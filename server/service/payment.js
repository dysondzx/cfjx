const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const { alipaySdk, AlipayFormData } = require('../config/alipay.config');

function setupPaymentRoutes(router, pool) {
    // 创建支付
    router.post('/api/payment/create', authMiddleware, async ctx => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;

            const { orderNo, payAmount } = ctx.request.body;
            
            // 验证订单是否存在且属于当前用户
            const [orders] = await connection.execute(
                'SELECT id, pay_amount, order_status FROM `orders` WHERE order_no = ? AND user_id = ?',
                [orderNo, userId]
            );
            
            if (orders.length === 0) {
                return ctx.body = {
                    code: 404,
                    message: '订单不存在'
                };
            }
            
            const order = orders[0];
            
            // 查询订单中的商品信息，用于生成支付宝支付标题
            const [orderItems] = await connection.execute(
                `SELECT oi.good_name, oi.quantity 
                 FROM order_item oi 
                 JOIN order_shop os ON oi.order_shop_id = os.id 
                 WHERE os.order_id = ? 
                 ORDER BY oi.id ASC 
                 LIMIT 3`,
                [order.id]
            );
            
            // 生成支付宝支付标题
            let subject = '商品购买';
            if (orderItems.length > 0) {
                const firstItem = orderItems[0];
                if (orderItems.length === 1) {
                    subject = `${firstItem.good_name}等1件商品`;
                } else {
                    subject = `${firstItem.good_name}等${orderItems.length}件商品`;
                }
            }
            
            // 验证订单状态
            if (order.order_status !== 0) {
                return ctx.body = {
                    code: 400,
                    message: '订单状态异常，无法支付'
                };
            }
            console.log('order.pay_amount,payAmount:', order.pay_amount,payAmount);
            
            // 验证金额是否匹配
            if (parseFloat(order.pay_amount) !== parseFloat(payAmount)) {
                return ctx.body = {
                    code: 400,
                    message: '支付金额与订单金额不匹配'
                };
            }
            
            // 生成支付流水号
            const payment_no = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 9);
            
            // 创建支付记录
            await connection.execute(
                'INSERT INTO payment_record (order_id, payment_no, pay_type, pay_amount, pay_status) VALUES (?, ?, ?, ?, ?)',
                [order.id, payment_no, 1, payAmount, 0]
            );
            
            const formData = new AlipayFormData();
            formData.setMethod('get');
            
            formData.addField('bizContent', {
                out_trade_no: payment_no, // 使用支付流水号作为商户订单号
                total_amount: payAmount, // 订单金额
                subject,      // 订单标题
                product_code: 'FAST_INSTANT_TRADE_PAY'
            });
            
            // 使用实际的回调URL
            formData.addField('return_url', 'https://www.sohu.com/');
            // 需要外网环境，没办法
            // formData.addField('notify_url', 'http://192.168.63.62:3000/api/payment/notify');
            
            // 生成支付链接
            const result = await alipaySdk.pageExecute(
                'alipay.trade.page.pay',
                'GET',
                {
                    bizContent: {
                        out_trade_no: payment_no,
                        total_amount: payAmount,
                        subject,
                        product_code: 'FAST_INSTANT_TRADE_PAY'
                    },
                    returnUrl: 'http://localhost:3000/api/payment/return'
                }
            );
            
            await connection.commit();
            
            ctx.body = {
                code: 0,
                message: '创建支付成功',
                data: {
                    payUrl: result,
                    paymentNo: payment_no
                }
            }
        } catch (error) {
            await connection.rollback();
            console.error('创建支付失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        } finally {
            connection.release();
        }
    });

    // 异步通知回调
    router.post('/api/payment/notify', async ctx => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const params = ctx.request.body;
            // 验证签名
            const signVerified = alipaySdk.checkNotifySign(params);
            
            if (!signVerified) {
                return ctx.body = 'fail';
            }
            
            const { out_trade_no, trade_status, total_amount, trade_no } = params;
            
            // 根据trade_status处理业务逻辑
            if (trade_status === 'TRADE_SUCCESS' || 
                trade_status === 'TRADE_FINISHED') {
                
                // 查询支付记录
                const [paymentRecords] = await connection.execute(
                    'SELECT pr.*, o.order_no, o.user_id FROM payment_record pr ' +
                    'JOIN `orders` o ON pr.order_id = o.id ' +
                    'WHERE pr.payment_no = ? AND pr.pay_status = 0',
                    [out_trade_no]
                );
                
                if (paymentRecords.length === 0) {
                    return ctx.body = 'fail';
                }
                
                const paymentRecord = paymentRecords[0];
                
                // 验证金额是否匹配
                if (parseFloat(paymentRecord.pay_amount) !== parseFloat(total_amount)) {
                    return ctx.body = 'fail';
                }
                
                // 更新支付记录状态
                await connection.execute(
                    'UPDATE payment_record SET pay_status = 1, third_party_no = ?, pay_time = NOW() WHERE payment_no = ?',
                    [trade_no, out_trade_no]
                );
                
                // 更新订单状态
                await connection.execute(
                    'UPDATE `orders` SET order_status = 1, pay_status = 1, pay_type = 1, pay_time = NOW() WHERE id = ?',
                    [paymentRecord.order_id]
                );
                
                // 记录订单状态变更日志
                await connection.execute(
                    'INSERT INTO order_status_log (order_id, old_status, new_status, remark, operator) VALUES (?, ?, ?, ?, ?)',
                    [paymentRecord.order_id, 0, 1, '支付宝支付成功', 'system']
                );
                
                console.log('支付成功处理完成:', {
                    payment_no: out_trade_no,
                    order_no: paymentRecord.order_no,
                    trade_no: trade_no,
                    total_amount: total_amount
                });
                
                await connection.commit();
                ctx.body = 'success';
            } else if (trade_status === 'TRADE_CLOSED') {
                // 支付关闭，更新状态
                await connection.execute(
                    'UPDATE payment_record SET pay_status = 2 WHERE payment_no = ?',
                    [out_trade_no]
                );
                
                await connection.commit();
                ctx.body = 'success';
            } else {
                // 其他状态暂时不处理
                await connection.commit();
                ctx.body = 'success';
            }
        } catch (error) {
            await connection.rollback();
            console.error('处理异步通知失败:', error);
            ctx.body = 'fail';
        } finally {
            connection.release();
        }
    });

    // 查询订单
    router.get('/api/payment/queryByOrderNo', async ctx => {
        try {
            const { out_trade_no } = ctx.query;
            console.log('out_trade_no:', out_trade_no);
            
            if (!out_trade_no) {
                return ctx.body = {
                    code: 400,
                    message: '缺少订单号参数'
                };
            }
      
            const result = await alipaySdk.exec('alipay.trade.query', {
                bizContent: {
                    out_trade_no: out_trade_no
                }
            });
            console.log('result:', result);
            
            // 检查支付宝返回结果
            if (result.code === '10000') {
                // 新的API返回格式，直接使用result对象
                ctx.body = {
                    code: 200,
                    message: '查询成功',
                    data: {
                        trade_status: result.tradeStatus || result.trade_status,
                        out_trade_no: result.outTradeNo || result.out_trade_no,
                        trade_no: result.tradeNo || result.trade_no,
                        total_amount: result.totalAmount || result.total_amount,
                        buyer_pay_amount: result.buyerPayAmount || result.buyer_pay_amount
                    }
                };
            } else {
                // 支付宝返回错误
                ctx.body = {
                    code: 500,
                    message: result.msg || '查询失败',
                    data: result
                };
            }
        } catch (error) {
            console.error('查询订单失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误',
                data: error.message
            };
        }
    });

}

module.exports = setupPaymentRoutes;