const Koa = require('koa');
const Router = require('koa-router');
const mysql = require('mysql2/promise')
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

// 根据NODE_ENV加载不同的环境变量文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env';
require('dotenv').config({ path: envFile });

// 引入路由处理函数
const setupIndexRoutes = require('./service/index');
const setupClassifyRoutes = require('./service/classify');
const setupUserRoutes = require('./service/user');
const setupAddressRoutes = require('./service/address');
const setupCartRoutes = require('./service/cart');
const setupOrderRoutes = require('./service/orders');
const setupPaymentRoutes = require('./service/payment');


// 创建连接池
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectionLimit: 10, // 连接池中最大连接数
   	queueLimit: 0 // 无限制的排队请求
})

const app = new Koa();
const router = new Router();

app.use(cors({
  origin: false, // 允许的前端域名
  credentials: true, // 允许携带凭证
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// 设置路由
setupIndexRoutes(router, pool);
setupClassifyRoutes(router, pool);
setupUserRoutes(router, pool);
setupAddressRoutes(router, pool);
setupCartRoutes(router, pool);
setupOrderRoutes(router, pool);
setupPaymentRoutes(router, pool);

// 放到路由前面
app.use(bodyParser());
// 注册路由中间件
app.use(router.routes());
app.use(router.allowedMethods()); // 响应 OPTIONS 方法等

app.listen(process.env.PORT, () => {
  console.log(`服务器运行在 http://localhost:${process.env.PORT}`);
});