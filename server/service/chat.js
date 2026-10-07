const optionalAuth = require('../middlewares/optionalAuth');

/**
 * 智能客服相关的路由处理函数
 * @param {Object} router - Koa路由实例
 * @param {Object} pool - MySQL连接池
 */
function setupChatRoutes(router, pool) {
	/**
	 * 智能客服问答
	 * @route POST /api/chat
	 * 说明：仅做转发；RAG 检索、大模型生成、订单查询均由 Python AI 服务完成。
	 * 鉴权：可选鉴权——游客也能咨询规则类问题，但查询订单需要登录。
	 */
	router.post('/api/chat', optionalAuth, async ctx => {
		try {
			const { question } = ctx.request.body;
			if (!question || !String(question).trim()) {
				ctx.body = {
					code: 400,
					message: '问题不能为空'
				};
				return;
			}

			// 用户ID只从 JWT 解析结果获取，绝不使用前端提交的值
			const userId = ctx.state.user ? ctx.state.user.userId : null;

			const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
			const resp = await fetch(`${aiUrl}/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					question: String(question).trim(),
					user_id: userId
				})
			});

			if (!resp.ok) {
				throw new Error(`AI服务响应异常，状态码：${resp.status}`);
			}

			const data = await resp.json();
			ctx.body = {
				code: 200,
				data: {
					answer: data.answer
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

module.exports = setupChatRoutes;
