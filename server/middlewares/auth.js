const jwt = require('jsonwebtoken');

const authMiddleware = async (ctx, next) => {
  // 从请求头获取 Token
  const authHeader = ctx.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
  console.log('Token验证中间件执行，token:', token);
  
  if (!token) {
    ctx.status = 401;
    ctx.body = { message: '访问被拒绝，未提供Token。' };
    return;
  }
  
  try {
    // 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 验证成功，将用户信息挂载到 ctx.state 对象上，方便后续路由使用
    ctx.state.user = decoded;
    console.log('Token验证成功，用户信息:', decoded);
    await next(); // 继续执行下一个中间件或路由 handler
  } catch (err) {
    ctx.status = 403;
    ctx.body = { message: 'Token无效或已过期。' };
    console.log('Token验证失败:', err.message);
  }
};
module.exports = authMiddleware;