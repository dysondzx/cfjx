const authMiddleware = require('../middlewares/auth');

/**
 * 分类和商品相关的路由处理函数
 * @param {Object} router - Koa路由实例
 * @param {Object} pool - MySQL连接池
 */
function setupClassifyRoutes(router, pool) {
    /**
     * 根据商品ID查询商品详情
     * @route GET /api/goods/queryById
     */
    router.get('/api/goods/queryById', authMiddleware, async ctx => {
        const id = ctx.query.id
        const rows = await pool.execute(`SELECT g.*, s.name as shopName FROM goods g inner join shop s on g.shopId = s.id WHERE g.id = ${id}`)
        ctx.body = {
            code: 200,
            data: rows[0][0]
        }
    })

    /**
     * 查询所有分类条目
     * @route GET /api/classify/classifies
     */
    router.get('/api/classify/classifies', ctx => {
        ctx.body = {
            code: 200,
            data: [{
                    id: 1,
                    name: '家居家纺'
                }, {
                    id: 2,
                    name: '女装'
                }, {
                    id: 3,
                    name: '男装'
                }, {
                    id: 4,
                    name: '内衣配饰'
                }, {
                    id: 5,
                    name: '运动户外'
                }, {
                    id: 6,
                    name: '鞋靴'
                }, {
                    id: 7,
                    name: '箱包'
                }, {
                    id: 8,
                    name: '食品酒饮'
                }, {
                    id: 9,
                    name: '美妆个护'
                }, {
                    id: 10,
                    name: '母婴童装'
                }, {
                    id: 11,
                    name: '饰品'
                }, {
                    id: 12,
                    name: '数码家电'
                }, {
                    id: 13,
                    name: '计生情趣'
                }, {
                    id: 14,
                    name: '家居日用'
                }, {
                    id: 15,
                    name: '图书音像'
                }, {
                    id: 16,
                    name: '办公用品'
                }, {
                    id: 17,
                    name: '宠物用品'
                }, {
                    id: 18,
                    name: '汽车用品'
                }, {
                    id: 19,
                    name: '乐器'
                }, {
                    id: 20,
                    name: '礼品鲜花'
                }]
        }
    })

    /**
     * 根据分类ID查询商品列表
     * @route GET /api/classify/queryGoodsByClassifyId
     */
    router.get('/api/classify/queryGoodsByClassifyId', ctx => {
        const goodsList = [
            {
                classifyId: 1,
                data: [
                    {
                        name: '家纺',
                        data: [
                            {
                                id: 1,
                                name: '毛巾/浴巾',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '枕头',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '被子',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '被套',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 1,
                                name: '套件',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '抱枕靠垫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '凉席',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '床垫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 1,
                                name: '毯子',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '坐垫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '蚊帐',
                                imgUrl: '/static/image/classify/list1.jpg'
                            }
                        ]
                    },
                    {
                        name: '生活日用',
                        data: [
                            {
                                id: 1,
                                name: '收纳用品',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '衣架',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '清洁用品',
                                imgUrl: '/static/image/classify/list1.jpg'
                            }
                        ]
                    }
                ]
            }, {
                classifyId: 2,
                data: [
                    {
                        name: '裙装/套装',
                        data: [
                            {
                                id: 1,
                                name: '半身裙',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '连衣裙',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '吊带/背带裙',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '套装',
                                imgUrl: '/static/image/classify/list1.jpg'
                            }
                        ]
                    },
                    {
                        name: '上衣',
                        data: [
                            {
                                id: 1,
                                name: 'T恤/打底衫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '衬衫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '针织衫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '卫衣',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 1,
                                name: '牛仔外套',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '夹克',
                                imgUrl: '/static/image/classify/list1.jpg'
                            }
                        ]
                    }
                ]
            }, {
                classifyId: 3,
                data: [
                    {
                        name: '上装',
                        data: [
                            {
                                id: 1,
                                name: '衬衫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '夹克',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '毛衣/针织衫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '卫衣',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 1,
                                name: 'T恤',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: 'POLO衫',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '马甲',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '西装',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 1,
                                name: '羽绒服',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '大衣',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '皮衣',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 4,
                                name: '棉衣棉服',
                                imgUrl: '/static/image/classify/list1.jpg'
                            }
                        ]
                    },
                    {
                        name: '下装',
                        data: [
                            {
                                id: 1,
                                name: '休闲裤',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 2,
                                name: '牛仔裤',
                                imgUrl: '/static/image/classify/list1.jpg'
                            },
                            {
                                id: 3,
                                name: '运动裤',
                                imgUrl: '/static/image/classify/list1.jpg'
                            }
                        ]
                    }
                ]
            }
        ]
        
        const classifyId = ctx.query.classifyId
        const result = goodsList.find(item => item.classifyId === parseInt(classifyId))
        ctx.body = {
            code: 200,
            data: result ? result.data : []
        }
    })

    /**
     * 查询商品列表（支持分页和搜索）
     * @route GET /api/goods/queryList
     */
    router.get('/api/goods/queryList', async ctx => {
        try {
            // 获取查询参数
            const { page = 1, pageSize = 10, keywords, orderKey, order } = ctx.query;
            
            // 构建基础SQL语句
            let sql = 'SELECT * FROM goods WHERE 1=1';
            
            // 添加搜索条件
            if (keywords) {
                sql += ` AND name LIKE '%${keywords}%'`;
            }

            if(orderKey && order) {
                sql += ` ORDER BY ${orderKey} ${order}`;
            }
            
            // 添加分页条件
            const offset = (parseInt(page) - 1) * parseInt(pageSize);
            sql += ` LIMIT ${parseInt(pageSize)} OFFSET ${offset}`;
            // 执行查询
            const [rows, fields] = await pool.execute(sql);
            
            // 获取总数用于分页
            let countSql = 'SELECT COUNT(*) as total FROM goods WHERE 1=1';
            
            if (keywords) {
                countSql += ` AND name LIKE '%${keywords}%'`;
            }
            const [countResult] = await pool.execute(countSql);
            const total = countResult[0].total;
            
            ctx.body = {
                code: 200,
                data: {
                    list: rows,
                    total: total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalPages: Math.ceil(total / parseInt(pageSize))
                }
            }
        } catch (err) {
            console.error('查询出错：', err);
            ctx.body = {
                code: 500,
                message: '服务器内部错误',
                error: err.message
            }
        }
    })
}

module.exports = setupClassifyRoutes;