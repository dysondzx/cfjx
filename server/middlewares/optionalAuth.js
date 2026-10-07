const jwt = require('jsonwebtoken');

/**
 * 可选鉴权中间件
 * - 携带有效 Token：解析后挂到 ctx.state.user
 * - 未携带 / Token 无效：不阻断请求，按未登录（游客）继续处理
 *
 * 适用场景：既允许游客使用的功能（如 FAQ 咨询），
 * 又需要按登录身份返回个性化数据的接口（如查询我的订单）。
 */
const optionalAuth = async (ctx, next) => {
	const authHeader = ctx.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token) {
		try {
			ctx.state.user = jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			// Token 无效或已过期，按未登录处理，不阻断请求
			console.log('可选鉴权：Token 无效，按游客处理');
		}
	}

	await next();
};

module.exports = optionalAuth;
