const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const cacheService = require('./cache');
const { CACHE_TTL } = require('../config/cacheConfig');

function setupCartRoutes(router, pool) {
    // 查询用户购物车商品列表
    router.get('/api/cart/list', authMiddleware, async ctx => {
        try {
            const goodIds = ctx.query.goodIds
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;

            // 从缓存获取购物车数据
            const cacheKey = `cart:list:${userId}`;
            const cachedData = await cacheService.get(cacheKey);
            if (cachedData) {
                // 缓存数据存在，直接返回
                ctx.body = {
                    code: 200,
                    message: '查询成功',
                    data: cachedData
                };
                return;
            }
            
            // 查询该用户的购物车商品列表
            let sql = `SELECT 
                c.id as id,
                c.shopId as shopId,
                s.name as shopName,
                g.id as goodId,
                g.name as goodName,
                g.cprice as cprice,
                g.imgUrl as imgUrl,
                c.num as num,
                c.checked as checked
                FROM cart c
                LEFT JOIN shop s ON c.shopId = s.id
                LEFT JOIN goods g ON c.goodId = g.id
            WHERE c.userId = ?
            `
            let params = [userId]
            if(goodIds) {
                const goodIdArr = goodIds.split(',')
                const idHolders = goodIdArr.map(() => '?').join(',')
                sql += ` AND c.goodId IN (${idHolders})`
                params = params.concat(goodIdArr)
            }
            const [cartItems] = await pool.execute(sql, params);
            
            // 将平铺的商品列表按店铺分组
            const groupedCartData = [];
            const shopMap = new Map();
            
            cartItems.forEach(item => {
                if (!shopMap.has(item.shopId)) {
                    shopMap.set(item.shopId, {
                        id: item.id,
                        shopId: item.shopId,
                        shopName: item.shopName,
                        shopGoods: []
                    });
                    groupedCartData.push(shopMap.get(item.shopId));
                }
                
                const shop = shopMap.get(item.shopId);
                shop.shopGoods.push({
                    id: item.goodId,
                    cartId: item.cartId,
                    imgUrl: item.imgUrl,
                    name: item.goodName,
                    goodsSpec: '颜色分类: 原色', // 默认规格
                    checked: item.checked === 1,
                    cprice: item.cprice,
                    num: item.num
                });
            });
            
            await cacheService.set(cacheKey, groupedCartData, CACHE_TTL.CLASSIFY_LIST)
            ctx.body = {
                code: 200,
                message: '查询成功',
                data: groupedCartData
            };
        } catch (error) {
            console.error('查询购物车商品列表失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 添加商品到购物车
    router.post('/api/cart/addGood', authMiddleware, async ctx => {
        try {
            const { shopId, id, num} = ctx.request.body;
            
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;
            
            // 先查询是否已存在相同的购物车记录
            const [existingCart] = await pool.execute(
                'SELECT id, num FROM cart WHERE userId = ? AND shopId = ? AND goodId = ?',
                [userId, shopId, id]
            );
            
            if (existingCart.length > 0) {
                // 如果已存在，则更新数量（在原有基础上加上新数量）
                const existingNum = existingCart[0].num;
                const newNum = existingNum + num;
                
                await pool.execute(
                    'UPDATE cart SET num = ? WHERE id = ?',
                    [newNum, existingCart[0].id]
                );

                // 从购物车删除redis数据
                const cacheKey = `cart:list:${userId}`;
                await cacheService.del(cacheKey)
                
                ctx.body = {
                    code: 200,
                    message: '更新成功',
                    data: {
                        action: 'update',
                        newNum: newNum
                    }
                };
            } else {
                // 如果不存在，则新增一条记录
                await pool.execute(
                    'INSERT INTO cart (userId, shopId, goodId, num, checked) VALUES (?, ?, ?, ?, ?)',
                    [userId, shopId, id, num, false]
                );
                
                // 从购物车删除redis数据
                const cacheKey = `cart:list:${userId}`;
                await cacheService.del(cacheKey)
                
                ctx.body = {
                    code: 200,
                    message: '添加成功',
                    data: {
                        action: 'add'
                    }
                };
            }
        } catch (error) {
            console.error('添加地址失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 更新商品勾选状态
    router.post('/api/cart/updateGoodChecked', authMiddleware, async ctx => {
        const { goodId, checked } = ctx.request.body;
        // 从请求头获取token
        const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
        
        // 解析token获取userId
        const decoded = jwt.decode(token);      
        const userId = decoded.userId;
        try {
            // 更新购物车商品勾选状态
            await pool.execute(
                'UPDATE cart SET checked = ? WHERE userId = ? AND goodId = ?',
                [checked?1:0, userId, goodId]
            );
            
            // 从购物车删除redis数据
            const cacheKey = `cart:list:${userId}`;
            await cacheService.del(cacheKey)

            ctx.body = {
                code: 200,
                message: '更新成功'
            };
        } catch (error) {
            console.error('更新购物车商品勾选状态失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
        
    });

    // 更新商品数量
    router.post('/api/cart/updateGoodNum', authMiddleware, async ctx => {
        const { goodId, num } = ctx.request.body;
        // 从请求头获取token
        const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
        
        // 解析token获取userId
        const decoded = jwt.decode(token);      
        const userId = decoded.userId;
        try {
            // 更新购物车商品勾选状态
            await pool.execute(
                'UPDATE cart SET num = ? WHERE userId = ? AND goodId = ?',
                [num, userId, goodId]
            );

            // 从购物车删除redis数据
            const cacheKey = `cart:list:${userId}`;
            await cacheService.del(cacheKey)
            
            ctx.body = {
                code: 200,
                message: '更新成功'
            };
        } catch (error) {
            console.error('更新购物车商品数量失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 批量更新商品勾选状态
    router.post('/api/cart/batchUpdateGoodChecked', authMiddleware, async ctx => {
        const { goodIds, checked } = ctx.request.body;
        // 从请求头获取token
        const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
        
        // 解析token获取userId
        const decoded = jwt.decode(token);      
        const userId = decoded.userId;
        
        // 确保goodIds是数组且不为空
        if (!Array.isArray(goodIds) || goodIds.length === 0) {
            ctx.body = {
                code: 400,
                message: '商品ID列表不能为空'
            };
            return;
        }
        
        try {
            // 将goodIds转换为数字类型，避免数据类型不匹配
            const numericGoodIds = goodIds.map(id => parseInt(id));
            
            // 构建IN子句的占位符和参数
            const placeholders = numericGoodIds.map(() => '?').join(',');
            const params = [checked?1:0, userId, ...numericGoodIds];
            
            // 更新购物车商品勾选状态
            await pool.execute(
                `UPDATE cart SET checked = ? WHERE userId = ? AND goodId IN (${placeholders})`,
                params
            );

            // 从购物车删除redis数据
            const cacheKey = `cart:list:${userId}`;
            await cacheService.del(cacheKey)
            
            ctx.body = {
                code: 200,
                message: '更新成功'
            };
        } catch (error) {
            console.error('批量更新购物车商品勾选状态失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 批量删除商品
    router.delete('/api/cart/batchDeleteGood', authMiddleware, async ctx => {
        const { goodIds } = ctx.request.body;   
        // 从请求头获取token
        const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
        
        // 解析token获取userId
        const decoded = jwt.decode(token);      
        const userId = decoded.userId;
        
        // 确保goodIds是数组且不为空
        if (!Array.isArray(goodIds) || goodIds.length === 0) {
            ctx.body = {
                code: 400,
                message: '商品ID列表不能为空'
            };
            return;
        }
        
        try {
            // 将goodIds转换为数字类型，避免数据类型不匹配
            const numericGoodIds = goodIds.map(id => parseInt(id));
            
            // 构建IN子句的占位符和参数
            const placeholders = numericGoodIds.map(() => '?').join(',');
            const params = [userId, ...numericGoodIds];
            
            // 删除购物车商品
            await pool.execute(
                `DELETE FROM cart WHERE userId = ? AND goodId IN (${placeholders})`,
                params
            );
            
            // 从购物车删除redis数据
            const cacheKey = `cart:list:${userId}`;
            await cacheService.del(cacheKey)
            
            ctx.body = {
                code: 200,
                message: '删除成功'
            };
        } catch (error) {
            console.error('批量删除购物车商品失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });
}

module.exports = setupCartRoutes;
