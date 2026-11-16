const auth = require('../middlewares/auth');
const cacheService = require('./cache');

/**
 * AIGC 素材生成相关的路由处理函数
 *
 * 职责边界：
 * - Node 网关：JWT 鉴权、每日配额、任务表读写、产物 URL 反代
 * - Python AI 服务：LangGraph 编排、提示词工程、调用火山方舟、产物转存
 *
 * @param {Object} router - Koa路由实例
 * @param {Object} pool - MySQL连接池
 */

const ASSET_PREFIX = '/api/aigc/asset/';

// 每日生成配额，可通过环境变量调整（0 表示不限制）
// 注意：这里不能用 `|| 默认值`，否则配置成 0 会被当成默认值处理
const QUOTA = {
	image: process.env.AIGC_IMAGE_QUOTA === undefined ? 5 : Number(process.env.AIGC_IMAGE_QUOTA),
	video: process.env.AIGC_VIDEO_QUOTA === undefined ? 1 : Number(process.env.AIGC_VIDEO_QUOTA)
};

function aiBase() {
	return process.env.AI_SERVICE_URL || 'http://localhost:8000';
}

function todayKey() {
	const now = new Date();
	const pad = n => String(n).padStart(2, '0');
	return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
}

/**
 * 把 AI 服务返回的 /static/... 相对路径转换为网关统一 URL。
 * 前端 <image>/<video> 无法携带 Authorization，因此统一走无鉴权的资源反代。
 */
function toAssetUrl(path) {
	if (!path) return '';
	if (/^https?:\/\//i.test(path)) return path;
	return ASSET_PREFIX + path.replace(/^\/?static\//, '');
}

/**
 * 消耗一次生成配额。
 * Redis 不可用时放行，优先保证功能可用（生产环境应补充监控告警）。
 */
async function consumeQuota(userId, type) {
	const limit = QUOTA[type];
	if (!limit) return { ok: true, used: 0, limit };

	const used = await cacheService.incr(`aigc:quota:${userId}:${todayKey()}:${type}`, 86400);
	if (!used) return { ok: true, used: 0, limit };
	return { ok: used <= limit, used, limit };
}

async function callAi(path, body) {
	const resp = await fetch(`${aiBase()}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	const data = await resp.json().catch(() => ({}));
	if (!resp.ok) {
		throw new Error(data.detail || data.error || `AI服务响应异常，状态码：${resp.status}`);
	}
	return data;
}

function toTaskView(task) {
	return {
		id: task.id,
		taskType: task.task_type,
		status: task.status, // 0-排队 1-生成中 2-成功 3-失败
		url: toAssetUrl(task.result_path),
		cover: toAssetUrl(task.cover_path),
		caption: task.caption || '',
		error: task.error_msg || '',
		createTime: task.create_time
	};
}

function setupAigcRoutes(router, pool) {
	/**
	 * 生成商品海报（同步）
	 * @route POST /api/aigc/poster
	 */
	router.post('/api/aigc/poster', auth, async ctx => {
		try {
			const userId = ctx.state.user.userId;
			const { good_id: goodId, style = '简约', scene = '促销' } = ctx.request.body || {};

			if (!goodId) {
				ctx.body = { code: 400, message: '缺少商品ID' };
				return;
			}

			const quota = await consumeQuota(userId, 'image');
			if (!quota.ok) {
				ctx.body = { code: 429, message: `今日海报生成次数已用完（${quota.limit} 次），明天再来吧～` };
				return;
			}

			const data = await callAi('/aigc/poster', {
				good_id: Number(goodId),
				style: String(style).slice(0, 20),
				scene: String(scene).slice(0, 20),
				user_id: userId
			});

			// 图片已经生成，落表失败不应让用户白等一次（素材库会少一条记录）
			let taskId = null;
			try {
				const [result] = await pool.execute(
					`INSERT INTO aigc_task (user_id, good_id, task_type, prompt, caption, status, provider, result_path)
					 VALUES (?, ?, 1, ?, ?, 2, 'ark', ?)`,
					[userId, Number(goodId), data.prompt || '', data.caption || '', data.url || '']
				);
				taskId = result.insertId;
			} catch (error) {
				console.error('海报任务落表失败:', error);
			}

			ctx.body = {
				code: 200,
				data: {
					id: taskId,
					url: toAssetUrl(data.url),
					caption: data.caption || '',
					prompt: data.prompt || ''
				}
			};
		} catch (error) {
			console.error('生成海报失败:', error);
			ctx.body = { code: 500, message: '海报生成失败，请稍后再试' };
		}
	});

	/**
	 * 创建商品短视频任务（异步）
	 * @route POST /api/aigc/video
	 */
	router.post('/api/aigc/video', auth, async ctx => {
		try {
			const userId = ctx.state.user.userId;
			const { good_id: goodId, style = '简约', duration = 5 } = ctx.request.body || {};

			if (!goodId) {
				ctx.body = { code: 400, message: '缺少商品ID' };
				return;
			}

			const quota = await consumeQuota(userId, 'video');
			if (!quota.ok) {
				ctx.body = { code: 429, message: `今日视频生成次数已用完（${quota.limit} 次），明天再来吧～` };
				return;
			}

			const data = await callAi('/aigc/video', {
				good_id: Number(goodId),
				style: String(style).slice(0, 20),
				duration: Math.max(2, Math.min(Number(duration) || 5, 12)),
				user_id: userId
			});

			const [result] = await pool.execute(
				`INSERT INTO aigc_task
				 (user_id, good_id, task_type, prompt, caption, status, provider, provider_task_id)
				 VALUES (?, ?, 2, ?, ?, 0, 'ark', ?)`,
				[userId, Number(goodId), data.prompt || '', data.caption || '', data.provider_task_id]
			);

			ctx.body = {
				code: 200,
				data: {
					id: result.insertId,
					status: 0,
					caption: data.caption || ''
				}
			};
		} catch (error) {
			console.error('创建视频任务失败:', error);
			ctx.body = { code: 500, message: '视频任务创建失败，请稍后再试' };
		}
	});

	/**
	 * 查询任务状态（懒轮询：命中未完成任务时才回源方舟）
	 * @route GET /api/aigc/task/:id
	 */
	router.get('/api/aigc/task/:id', auth, async ctx => {
		try {
			const userId = ctx.state.user.userId;
			const [rows] = await pool.execute(
				'SELECT * FROM aigc_task WHERE id = ? AND user_id = ?',
				[ctx.params.id, userId]
			);
			const task = rows[0];

			if (!task) {
				ctx.body = { code: 404, message: '任务不存在' };
				return;
			}

			if ((task.status === 0 || task.status === 1) && task.provider_task_id) {
				const remote = await fetch(`${aiBase()}/aigc/task/${task.provider_task_id}`).then(res => res.json());

				if (remote.status === 'succeeded') {
					await pool.execute(
						'UPDATE aigc_task SET status = 2, result_path = ?, cover_path = ? WHERE id = ?',
						[remote.url || '', remote.cover || '', task.id]
					);
					task.status = 2;
					task.result_path = remote.url || '';
					task.cover_path = remote.cover || '';
				} else if (remote.status === 'failed') {
					await pool.execute(
						'UPDATE aigc_task SET status = 3, error_msg = ? WHERE id = ?',
						[String(remote.error || '生成失败').slice(0, 500), task.id]
					);
					task.status = 3;
					task.error_msg = remote.error || '生成失败';
				}
			}

			ctx.body = { code: 200, data: toTaskView(task) };
		} catch (error) {
			console.error('查询AIGC任务失败:', error);
			ctx.body = { code: 500, message: '任务查询失败，请稍后再试' };
		}
	});

	/**
	 * 我的素材列表
	 * @route GET /api/aigc/history
	 */
	router.get('/api/aigc/history', auth, async ctx => {
		try {
			const userId = ctx.state.user.userId;
			const [rows] = await pool.execute(
				`SELECT id, good_id, task_type, status, result_path, cover_path, caption, error_msg, create_time
				 FROM aigc_task WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
				[userId]
			);
			ctx.body = { code: 200, data: rows.map(toTaskView) };
		} catch (error) {
			console.error('查询素材列表失败:', error);
			ctx.body = { code: 500, message: '素材列表加载失败' };
		}
	});

	/**
	 * 删除素材
	 * @route DELETE /api/aigc/task/:id
	 */
	router.delete('/api/aigc/task/:id', auth, async ctx => {
		try {
			const userId = ctx.state.user.userId;
			await pool.execute('DELETE FROM aigc_task WHERE id = ? AND user_id = ?', [ctx.params.id, userId]);
			ctx.body = { code: 200, message: '已删除' };
		} catch (error) {
			console.error('删除素材失败:', error);
			ctx.body = { code: 500, message: '删除失败，请稍后再试' };
		}
	});

	/**
	 * 产物反代：/api/aigc/asset/aigc/20261116/xxx.png → AI服务 /static/aigc/20261116/xxx.png
	 * 说明：文件名是随机 UUID，作为不可猜测的访问凭证；同时避免前端跨域与多端域名差异。
	 * @route GET /api/aigc/asset/*
	 */
	router.use(ASSET_PREFIX.replace(/\/$/, ''), async (ctx, next) => {
		if (ctx.method !== 'GET') {
			await next();
			return;
		}

		const filePath = ctx.path.slice(ASSET_PREFIX.length);

		// 只允许访问 aigc/ 目录，并阻断路径穿越
		if (!filePath.startsWith('aigc/') || filePath.includes('..')) {
			ctx.status = 400;
			ctx.body = { message: '非法资源路径' };
			return;
		}

		try {
			const resp = await fetch(`${aiBase()}/static/${filePath}`);
			if (!resp.ok) {
				ctx.status = 404;
				ctx.body = { message: '资源不存在' };
				return;
			}
			ctx.set('Content-Type', resp.headers.get('content-type') || 'application/octet-stream');
			ctx.set('Cache-Control', 'public, max-age=604800');
			ctx.body = Buffer.from(await resp.arrayBuffer());
		} catch (error) {
			console.error('AIGC资源反代失败:', error);
			ctx.status = 502;
			ctx.body = { message: '资源加载失败' };
		}
	});
}

module.exports = setupAigcRoutes;
module.exports.toAssetUrl = toAssetUrl;
module.exports.consumeQuota = consumeQuota;
