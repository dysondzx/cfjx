const cacheService = require('./cache');
const { CACHE_KEYS, CACHE_TTL } = require('../config/cacheConfig');

/**
 * 首页相关的路由处理函数
 * @param {Object} router - Koa路由实例
 * @param {Object} pool - MySQL连接池
 */
function setupIndexRoutes(router, pool) {
    /**
     * 获取首页顶部导航栏数据
     * @route GET /api/index_list/top_bar
     */
    router.get('/api/index_list/top_bar', async ctx => {
        const cacheData = await cacheService.get(CACHE_KEYS.INDEX_TOP_BAR)
        if(cacheData) {
            ctx.body = {
                code: 200,
                data: cacheData
            }
            return
        }
        const topBarData = [
                { id: 1, name: '推荐' },
                { id: 2, name: '运动户外' },
                { id: 3, name: '服饰内衣' },
                { id: 4, name: '鞋靴箱包' },
                { id: 5, name: '美妆个护' },
                { id: 6, name: '家居数码' },
                { id: 7, name: '食品母婴' }
            ]
        await cacheService.set(CACHE_KEYS.INDEX_TOP_BAR, topBarData, CACHE_TTL.INIFY_LIST)
        ctx.body = {
            code: 200,
            data: topBarData
        }
    })

    router.get('/api/index_list/1/data/1', (ctx) => {
		// 返回JSON响应给前端
		ctx.body = {
			code: 200,
			data: [
				{
					type: 'indexSwiperList',
					data: [{
						imgUrl: '/static/image/index/swiper/swiper1.jpg'
					}, {
						imgUrl: '/static/image/index/swiper/swiper2.jpg'
					}, {
						imgUrl: '/static/image/index/swiper/swiper3.jpg'
					}]
				},
				{
					type: 'recommendList',
					data: [{
						bigUrl: '/static/image/index/recommend/Children.jpg',
						smallImg: [{
							imgUrl: '/static/image/index/recommend/Children1.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Children2.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Children3.jpg'
						}]
					}, {
						bigUrl: '/static/image/index/recommend/Furnishing.jpg',
						smallImg: [{
							imgUrl: '/static/image/index/recommend/Furnishing1.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Furnishing2.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Furnishing3.jpg'
						}]
					}]
				}, {
					type: 'card',
					title: '猜你喜欢'
				}, {
					type: 'commodityList',
					data: [{
						id: 1,
						imgUrl: "/static/image/common/commodity1.jpg",
						name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 2,
						imgUrl: "/static/image/common/commodity2.jpg",
						name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 3,
						imgUrl: "/static/image/common/commodity3.jpg",
						name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 4,
						imgUrl: "/static/image/common/commodity4.jpg",
						name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}]
				}
			]
		};
    });

    router.get('/api/index_list/1/data/2', (ctx) => {
		// 返回JSON响应给前端
		ctx.body = {
			code: 200,
			data: [
				{
					type: 'indexSwiperList',
					data: [{
						imgUrl: '/static/image/index/swiper/swiper1.jpg'
					}, {
						imgUrl: '/static/image/index/swiper/swiper2.jpg'
					}, {
						imgUrl: '/static/image/index/swiper/swiper3.jpg'
					}]
				},
				{
					type: 'recommendList',
					data: [{
						bigUrl: '/static/image/index/recommend/Children.jpg',
						smallImg: [{
							imgUrl: '/static/image/index/recommend/Children1.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Children2.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Children3.jpg'
						}]
					}, {
						bigUrl: '/static/image/index/recommend/Furnishing.jpg',
						smallImg: [{
							imgUrl: '/static/image/index/recommend/Furnishing1.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Furnishing2.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Furnishing3.jpg'
						}]
					}]
				}, {
					type: 'card',
					title: '猜你喜欢'
				}, {
					type: 'commodityList',
					data: [{
						id: 1,
						imgUrl: "/static/image/common/commodity1.jpg",
						name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 2,
						imgUrl: "/static/image/common/commodity2.jpg",
						name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 3,
						imgUrl: "/static/image/common/commodity3.jpg",
						name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 4,
						imgUrl: "/static/image/common/commodity4.jpg",
						name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}]
				}
			]
		};
    });
	
	router.get('/api/index_list/1/data/3', (ctx) => {
		// 返回JSON响应给前端
		ctx.body = {
			code: 200,
			data: [
				{
					type: 'indexSwiperList',
					data: [{
						imgUrl: '/static/image/index/swiper/swiper1.jpg'
					}, {
						imgUrl: '/static/image/index/swiper/swiper2.jpg'
					}, {
						imgUrl: '/static/image/index/swiper/swiper3.jpg'
					}]
				},
				{
					type: 'recommendList',
					data: [{
						bigUrl: '/static/image/index/recommend/Children.jpg',
						smallImg: [{
							imgUrl: '/static/image/index/recommend/Children1.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Children2.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Children3.jpg'
						}]
					}, {
						bigUrl: '/static/image/index/recommend/Furnishing.jpg',
						smallImg: [{
							imgUrl: '/static/image/index/recommend/Furnishing1.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Furnishing2.jpg'
						}, {
							imgUrl: '/static/image/index/recommend/Furnishing3.jpg'
						}]
					}]
				}, {
					type: 'card',
					title: '猜你喜欢'
				}, {
					type: 'commodityList',
					data: [{
						id: 1,
						imgUrl: "/static/image/common/commodity1.jpg",
						name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 2,
						imgUrl: "/static/image/common/commodity2.jpg",
						name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 3,
						imgUrl: "/static/image/common/commodity3.jpg",
						name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}, {
						id: 4,
						imgUrl: "/static/image/common/commodity4.jpg",
						name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
						cprice: 299,
						oprice: 599,
						discount: 4.9
					}]
				}
			]
		};
	});

    router.get('/api/index_list/2/data/1', ctx => {
        ctx.body = {
            code: 200,
            data: [
                {
                    type: 'bannerList',
                    imgUrl: '/static/image/index/other/banner1.jpg'
                },
                {
                    type: 'iconsList',
                    data: [{
                        imgUrl: '/static/image/index/other/icons1.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons2.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons3.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons4.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons5.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons6.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons7.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons8.png',
                        name: '运动户外'
                    }]
                },
                {
                    type: 'card',
                    title: '热销爆品'
                },
                {
                    type: 'hotList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                },
                {
                    type: 'card',
                    title: '推荐店铺'
                },
                {
                    type: 'shopList',
                    data: [{
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }]
                },
                {
                    type: 'card',
                    title: '为您推荐'
                },
                {
                    type: 'commodityList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/common/commodity1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/common/commodity2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/common/commodity3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 4,
                        imgUrl: "/static/image/common/commodity4.jpg",
                        name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                }
            ]
        }
    })

    router.get('/api/index_list/2/data/2', ctx => {
        ctx.body = {
            code: 200,
            data: [
                {
                    type: 'bannerList',
                    imgUrl: '/static/image/index/other/banner1.jpg'
                },
                {
                    type: 'iconsList',
                    data: [{
                        imgUrl: '/static/image/index/other/icons1.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons2.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons3.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons4.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons5.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons6.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons7.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons8.png',
                        name: '运动户外'
                    }]
                },
                {
                    type: 'card',
                    title: '热销爆品'
                },
                {
                    type: 'hotList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                },
                {
                    type: 'card',
                    title: '推荐店铺'
                },
                {
                    type: 'shopList',
                    data: [{
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }]
                },
                {
                    type: 'card',
                    title: '为您推荐'
                },
                {
                    type: 'commodityList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/common/commodity1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/common/commodity2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/common/commodity3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 4,
                        imgUrl: "/static/image/common/commodity4.jpg",
                        name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                }
            ]
        }
    })

    router.get('/api/index_list/2/data/3', ctx => {
        ctx.body = {
            code: 200,
            data: [
                {
                    type: 'bannerList',
                    imgUrl: '/static/image/index/other/banner1.jpg'
                },
                {
                    type: 'iconsList',
                    data: [{
                        imgUrl: '/static/image/index/other/icons1.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons2.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons3.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons4.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons5.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons6.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons7.png',
                        name: '运动户外'
                    }, {
                        imgUrl: '/static/image/index/other/icons8.png',
                        name: '运动户外'
                    }]
                },
                {
                    type: 'card',
                    title: '热销爆品'
                },
                {
                    type: 'hotList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                },
                {
                    type: 'card',
                    title: '推荐店铺'
                },
                {
                    type: 'shopList',
                    data: [{
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }]
                },
                {
                    type: 'card',
                    title: '为您推荐'
                },
                {
                    type: 'commodityList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/common/commodity1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/common/commodity2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/common/commodity3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 4,
                        imgUrl: "/static/image/common/commodity4.jpg",
                        name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                }
            ]
        }
    })

    router.get('/api/index_list/3/data/1', ctx => {
        ctx.body = {
            code: 200,
            data: [
                {
                    type: 'bannerList',
                    imgUrl: '/static/image/index/other/banner1.jpg'
                },
                {
                    type: 'iconsList',
                    data: [{
                        imgUrl: '/static/image/index/other/icons1.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons2.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons3.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons4.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons5.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons6.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons7.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons8.png',
                        name: '服饰内衣'
                    }]
                },
                {
                    type: 'card',
                    title: '热销爆品'
                },
                {
                    type: 'hotList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                },
                {
                    type: 'card',
                    title: '推荐店铺'
                },
                {
                    type: 'shopList',
                    data: [{
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }]
                },
                {
                    type: 'card',
                    title: '为您推荐'
                },
                {
                    type: 'commodityList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/common/commodity1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/common/commodity2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/common/commodity3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 4,
                        imgUrl: "/static/image/common/commodity4.jpg",
                        name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                }
            ]
        }
    })

    router.get('/api/index_list/3/data/2', ctx => {
        ctx.body = {
            code: 200,
            data: [
                {
                    type: 'bannerList',
                    imgUrl: '/static/image/index/other/banner1.jpg'
                },
                {
                    type: 'iconsList',
                    data: [{
                        imgUrl: '/static/image/index/other/icons1.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons2.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons3.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons4.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons5.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons6.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons7.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons8.png',
                        name: '服饰内衣'
                    }]
                },
                {
                    type: 'card',
                    title: '热销爆品'
                },
                {
                    type: 'hotList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                },
                {
                    type: 'card',
                    title: '推荐店铺'
                },
                {
                    type: 'shopList',
                    data: [{
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }]
                },
                {
                    type: 'card',
                    title: '为您推荐'
                },
                {
                    type: 'commodityList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/common/commodity1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/common/commodity2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/common/commodity3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 4,
                        imgUrl: "/static/image/common/commodity4.jpg",
                        name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                }
            ]
        }
    })

    router.get('/api/index_list/3/data/3', ctx => {
        ctx.body = {
            code: 200,
            data: [
                {
                    type: 'bannerList',
                    imgUrl: '/static/image/index/other/banner1.jpg'
                },
                {
                    type: 'iconsList',
                    data: [{
                        imgUrl: '/static/image/index/other/icons1.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons2.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons3.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons4.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons5.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons6.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons7.png',
                        name: '服饰内衣'
                    }, {
                        imgUrl: '/static/image/index/other/icons8.png',
                        name: '服饰内衣'
                    }]
                },
                {
                    type: 'card',
                    title: '热销爆品'
                },
                {
                    type: 'hotList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 1,
                        imgUrl: "/static/image/index/other/hot1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/index/other/hot2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/index/other/hot3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                },
                {
                    type: 'card',
                    title: '推荐店铺'
                },
                {
                    type: 'shopList',
                    data: [{
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }, {
                        bigUrl: '/static/image/index/other/shop.jpg',
                        data: [{
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 1,
                            imgUrl: "/static/image/index/other/shop1.jpg",
                            name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 2,
                            imgUrl: "/static/image/index/other/shop2.jpg",
                            name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 3,
                            imgUrl: "/static/image/index/other/shop3.jpg",
                            name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }, {
                            id: 4,
                            imgUrl: "/static/image/index/other/shop4.jpg",
                            name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                            cprice: 299,
                            oprice: 599,
                            discount: 4.9
                        }]
                    }]
                },
                {
                    type: 'card',
                    title: '为您推荐'
                },
                {
                    type: 'commodityList',
                    data: [{
                        id: 1,
                        imgUrl: "/static/image/common/commodity1.jpg",
                        name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 2,
                        imgUrl: "/static/image/common/commodity2.jpg",
                        name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 3,
                        imgUrl: "/static/image/common/commodity3.jpg",
                        name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }, {
                        id: 4,
                        imgUrl: "/static/image/common/commodity4.jpg",
                        name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
                        cprice: 299,
                        oprice: 599,
                        discount: 4.9
                    }]
                }
            ]
        }
    })
}

module.exports = setupIndexRoutes;