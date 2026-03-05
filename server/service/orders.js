const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');

function setupOrderRoutes(router, pool) {
    // 查询用户订单列表
    router.get('/api/order/list', authMiddleware, async ctx => {
        try {
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;

            
            ctx.body = {
                code: 200,
                message: '查询成功',
                data: []
            };
        } catch (error) {
            console.error('查询订单列表失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 创建订单
    router.post('/api/order/create', authMiddleware, async ctx => {
        try {
            const { addressId, goods } = ctx.request.body;
            
            // 参数验证
            if (!addressId) {
                ctx.body = {
                    code: 400,
                    message: '收货地址不能为空'
                };
                return;
            }
            
            if (!goods || !Array.isArray(goods) || goods.length === 0) {
                ctx.body = {
                    code: 400,
                    message: '商品信息不能为空'
                };
                return;
            }
            
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;
            
            // 1. 验证收货地址是否存在且属于当前用户
            const [addressRows] = await pool.execute(
                'SELECT * FROM address WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );
            
            if (addressRows.length === 0) {
                ctx.body = {
                    code: 400,
                    message: '收货地址不存在'
                };
                return;
            }
            
            // 2. 验证商品信息并按店铺分组计算金额
            let totalAmount = 0;
            let freightAmount = 0;
            let discountAmount = 0;
            const shopGroups = {}; // 按店铺分组的商品信息
            
            // 先按店铺分组，收集每个店铺的商品和留言
            for (const item of goods) {
                const { goodId, quantity } = item;
                
                // 验证商品是否存在
                const [goodRows] = await pool.execute(
                    'SELECT * FROM goods WHERE id = ?',
                    [goodId]
                );
                
                if (goodRows.length === 0) {
                    ctx.body = {
                        code: 400,
                        message: `商品ID ${goodId} 不存在`
                    };
                    return;
                }
                
                const good = goodRows[0];
                
                // 计算商品总金额（使用cprice作为当前价格）
                const itemTotal = good.cprice * quantity;
                totalAmount += itemTotal;
                
                // 按店铺分组
                if (!shopGroups[good.shopId]) {
                    shopGroups[good.shopId] = {
                        shopId: good.shopId,
                        shopTotalAmount: 0,
                        buyerMessage: '', // 初始化为空，后面会统一设置
                        items: []
                    };
                }
                
                shopGroups[good.shopId].shopTotalAmount += itemTotal;
                shopGroups[good.shopId].items.push({
                    goodId: good.id,
                    goodName: good.name,
                    goodImgUrl: good.imgUrl,
                    goodPrice: good.cprice,
                    quantity: quantity,
                    totalAmount: itemTotal
                });
            }
            
            // 为每个店铺设置留言（使用该店铺第一个商品的留言）
            for (const shopId in shopGroups) {
                const shopGroup = shopGroups[shopId];
                if (shopGroup.items.length > 0) {
                    // 查找该店铺第一个商品的留言
                    const firstItemMessage = goods.find(item => {
                        const goodId = item.goodId;
                        const good = shopGroup.items.find(g => g.goodId === goodId);
                        return good !== undefined;
                    })?.buyerMessage || '';
                    
                    shopGroup.buyerMessage = firstItemMessage;
                }
            }
            
            // 3. 生成订单号
            const orderNo = 'O' + Date.now() + Math.random().toString(36).substr(2, 9);
            
            // 4. 计算实际支付金额（总金额 + 运费 - 优惠）
            const payAmount = totalAmount + freightAmount - discountAmount;
            
            // 5. 开启事务，创建订单
            const connection = await pool.getConnection();
            await connection.beginTransaction();
            
            try {
                // 插入订单主表
                const [orderResult] = await connection.execute(
                    `INSERT INTO orders (
                        order_no, user_id, total_amount, freight_amount, discount_amount, pay_amount,
                        address_id, receiver_name, receiver_phone, receiver_province, receiver_city,
                        receiver_area, receiver_full_address, order_status, pay_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderNo, userId, totalAmount, freightAmount, discountAmount, payAmount,
                        addressId, addressRows[0].receiver_name, addressRows[0].receiver_phone,
                        addressRows[0].province, addressRows[0].city, addressRows[0].area,
                        addressRows[0].full_address, 0, 0  // order_status=0(待支付), pay_status=0(未支付)
                    ]
                );
                
                const orderId = orderResult.insertId;
                
                // 插入订单店铺表
                const shopOrderIds = {};
                for (const shopId in shopGroups) {
                    const shopGroup = shopGroups[shopId];
                    const [shopOrderResult] = await connection.execute(
                        `INSERT INTO order_shop (
                            order_id, shop_id, shop_total_amount, buyer_message
                        ) VALUES (?, ?, ?, ?)`,
                        [orderId, shopId, shopGroup.shopTotalAmount, shopGroup.buyerMessage]
                    );
                    shopOrderIds[shopId] = shopOrderResult.insertId;
                }
                
                // 插入订单商品明细表
                for (const shopId in shopGroups) {
                    const shopGroup = shopGroups[shopId];
                    for (const item of shopGroup.items) {
                        await connection.execute(
                            `INSERT INTO order_item (
                                order_shop_id, good_id, good_name, good_img_url, good_price,
                                quantity, total_amount
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                                shopOrderIds[shopId], item.goodId, item.goodName, item.goodImgUrl,
                                item.goodPrice, item.quantity, item.totalAmount
                            ]
                        );
                    }
                }
                
                // 插入订单状态日志
                await connection.execute(
                    'INSERT INTO order_status_log (order_id, old_status, new_status, remark, operator) VALUES (?, ?, ?, ?, ?)',
                    [orderId, -1, 0, '订单创建', 'system']
                );
                
                // 6. 删除购物车中已下单的商品
                const goodIds = goods.map(item => item.goodId);
                if (goodIds.length > 0) {
                    const placeholders = goodIds.map(() => '?').join(',');
                    await connection.execute(
                        `DELETE FROM cart WHERE userId = ? AND goodId IN (${placeholders})`,
                        [userId, ...goodIds]
                    );
                    console.log(`用户 ${userId} 创建订单后删除购物车商品:`, goodIds);
                }
                
                // 提交事务
                await connection.commit();
                
                ctx.body = {
                    code: 200,
                    message: '创建订单成功',
                    data: {
                        orderId: orderId,
                        orderNo: orderNo,
                        payAmount: payAmount
                    }
                };
                
            } catch (error) {
                // 回滚事务
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
            
        } catch (error) {
            console.error('创建订单失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

}
module.exports = setupOrderRoutes;
