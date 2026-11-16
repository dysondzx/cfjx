const optionalAuth = require('../middlewares/optionalAuth');
const { toAssetUrl, consumeQuota } = require('./aigc');

/**
 * 对话中触发素材生成时，需要先扣配额再调用 AI 服务。
 * 这里用关键词做前置判断（AI 侧还会再做一次意图分类），
 * 命中但最终未走 AIGC 会浪费一次配额，属于可用性优先的取舍。
 */
function guessAigcType(question) {
	if (/视频|短视频/.test(question)) return 'video';
	if (/海报|主图|图片|生成|做图|画一张|素材/.test(question)) return 'image';
	return null;
}

/**
 * 智能客服相关的路由处理函数
 * @param {Object} router - Koa路由实例
 * @param {Object} pool - MySQL连接池
 */
function setupChatRoutes(router, pool) {
	/**
	 * 智能客服问答
	 * @route POST /api/chat
	 * 说明：仅做转发；RAG 检索、大模型生成、订单查询、AIGC 素材生成均由 Python AI 服务完成。
	 * 鉴权：可选鉴权——游客也能咨询规则类问题，但查询订单与生成素材需要登录。
	 */
	router.post('/api/chat', optionalAuth, async ctx => {
		try {
			const { question, good_id: goodId } = ctx.request.body || {};
			if (!question || !String(question).trim()) {
				ctx.body = {
					code: 400,
					message: '问题不能为空'
				};
				return;
			}

			// 用户ID只从 JWT 解析结果获取，绝不使用前端提交的值
			const userId = ctx.state.user ? ctx.state.user.userId : null;
			const questionText = String(question).trim();

			// 对话内生成素材同样受每日配额限制（有商品上下文时才判定）
			if (userId && goodId) {
				const type = guessAigcType(questionText);
				if (type) {
					const quota = await consumeQuota(userId, type);
					if (!quota.ok) {
						ctx.body = {
							code: 429,
							message: `今日${type === 'video' ? '视频' : '海报'}生成次数已用完（${quota.limit} 次），明天再来吧～`
						};
						return;
					}
				}
			}

			const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
			const resp = await fetch(`${aiUrl}/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					question: questionText,
					user_id: userId,
					// 商品ID用于素材生成的上下文，服务端会按ID回查数据库
					good_id: goodId ? Number(goodId) : null
				})
			});

			if (!resp.ok) {
				throw new Error(`AI服务响应异常，状态码：${resp.status}`);
			}

			const data = await resp.json();
			const assets = await normalizeAssets(pool, data.assets || [], userId, goodId);

			ctx.body = {
				code: 200,
				data: {
					answer: data.answer,
					intent: data.intent || 'faq',
					assets
				}
			};
		} catch (error) {
			console.error('智能客服接口错误:', error);
			ctx.body = {
				code: 500,
				message: '智能客服服务异常，请稍后再试'
			};
		}
	});
}

/**
 * 规整 AI 服务返回的素材：
 * - 图片：把 /static 路径转换为网关反代地址
 * - 视频：方舟任务是异步的，需要落一张本地任务表，前端拿本地任务ID轮询
 */
async function normalizeAssets(pool, assets, userId, goodId) {
	const result = [];

	for (const item of assets) {
		let taskId = null;

		if (item.type === 'video' && item.status === 'pending' && item.provider_task_id && userId) {
			try {
				const [insertResult] = await pool.execute(
					`INSERT INTO aigc_task
					 (user_id, good_id, task_type, prompt, status, provider, provider_task_id)
					 VALUES (?, ?, 2, ?, 0, 'ark', ?)`,
					[
						userId,
						goodId ? Number(goodId) : null,
						item.prompt || '',
						item.provider_task_id
					]
				);
				taskId = insertResult.insertId;
			} catch (error) {
				// 任务表写入失败不应影响对话主链路，只是前端无法轮询视频
				console.error('AIGC任务落表失败:', error);
			}
		}

		result.push({
			type: item.type,
			status: item.status,
			url: toAssetUrl(item.url),
			cover: toAssetUrl(item.cover),
			taskId
		});
	}

	return result;
}

module.exports = setupChatRoutes;
