const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');

function setupAddressRoutes(router, pool) {
    // 查询用户收货地址列表
    router.get('/api/address/list', authMiddleware, async ctx => {
        try {
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;
            
            // 查询该用户的所有收货地址
            const [addresses] = await pool.execute('SELECT * FROM address WHERE user_id = ? ORDER BY is_default DESC, create_time DESC', [userId]);
            
            const formattedAddresses = addresses.map(address => ({
                id: address.id,
                receiverName: address.receiver_name,
                receiverPhone: address.receiver_phone,
                province: address.province,
                city: address.city,
                area: address.area,
                fullAddress: address.full_address,
                isDefault: address.is_default
            }));
            
            ctx.body = {
                code: 200,
                message: '查询成功',
                data: formattedAddresses
            };
        } catch (error) {
            console.error('查询地址列表失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 添加新收货地址
    router.post('/api/address/add', authMiddleware, async ctx => {
        try {
            const { receiverName, receiverPhone, province, city, area, fullAddress, isDefault } = ctx.request.body;
            
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);
            const userId = decoded.userId;

            if(isDefault === 1) {
                // 如果设置为默认地址，先将所有地址的is_default设为0
                await pool.execute(
                    'UPDATE address SET is_default = 0 WHERE user_id = ?',
                    [userId]
                );
            }
            
            // 插入新地址到数据库
            await pool.execute(
                'INSERT INTO address (user_id, receiver_name, receiver_phone, province, city, area, full_address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, receiverName, receiverPhone, province, city, area, fullAddress, isDefault]
            );
            
            ctx.body = {
                code: 200,
                message: '添加成功'
            };
        } catch (error) {
            console.error('添加地址失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });

    // 修改收货地址
    router.post('/api/address/update', authMiddleware, async ctx => {
        try {
            const { id, receiverName, receiverPhone, province, city, area, fullAddress, isDefault } = ctx.request.body;
            
            // 从请求头获取token
            const authHeader = ctx.headers['authorization'] || ctx.headers['Authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // 格式：Bearer <token>
            
            // 解析token获取userId
            const decoded = jwt.decode(token);   
            const userId = decoded.userId;

            if(isDefault === 1) {
                // 如果设置为默认地址，先将所有地址的is_default设为0
                await pool.execute(
                    'UPDATE address SET is_default = 0 WHERE user_id = ?',
                    [userId]
                );
            }
            
            // 插入新地址到数据库
            await pool.execute(
                'UPDATE address SET receiver_name = ?, receiver_phone = ?, province = ?, city = ?, area = ?, full_address = ?, is_default = ? WHERE id = ? AND user_id = ?',
                [receiverName, receiverPhone, province, city, area, fullAddress, isDefault, id, userId]
            );
            
            ctx.body = {
                code: 200,
                message: '修改成功'
            };
        } catch (error) {
            console.error('修改地址失败:', error);
            ctx.body = {
                code: 500,
                message: '服务器错误'
            };
        }
    });
}

module.exports = setupAddressRoutes;