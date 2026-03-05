import config from '@/config/index.js'

const defautOptions = {
	baseUrl: config.base_url,
	data: {},
	header: {
		'content-type': 'application/json'
	},
	method: 'GET',
	dataType: 'json'
}
export default function (options) {
	return new Promise((resolve, reject) => {
        uni.showLoading({
            title: '加载中',
            mask: true
        })
		const token = uni.getStorageSync('token');
		const header = Object.assign({}, defautOptions.header, options.header || {})
		if(token) {
			header['Authorization'] = 'Bearer ' + token; // 通常使用 Bearer 模式
		}
		uni.request({
			url: defautOptions.baseUrl + options.url,
			data: options.data || defautOptions.data,
			method: options.method || defautOptions.method,
			header: header,
			dataType: options.dataType || defautOptions.dataType,
			timeout: 60000,
            success: (res) => {
                if (res.statusCode === 200) {
                    resolve(res.data)
                } else if (res.statusCode === 401) {
                    // 401: 未提供Token或Token无效
                    uni.showModal({
                        title: '提示',
                        content: '您还未登录，请先登录',
                        showCancel: false,
                        success: () => {
                            // 用户确认后跳转到登录页面
                            uni.reLaunch({
                                url: '/pages/login/login'
                            });
                        }
                    });
                    reject(res)
                } else if (res.statusCode === 403) {
                    // 403: Token已过期或权限不足
                    uni.showModal({
                        title: '提示',
                        content: '登录已过期，请重新登录',
                        showCancel: false,
                        success: () => {
                            // 用户确认后跳转到登录页面
                            uni.reLaunch({
                                url: '/pages/login/login'
                            });
                        }
                    });
                    reject(res)
                } else {
                    reject(res)
                }
            },
            fail: (err) => {
                console.log('fail err:', err);
                reject(err)
            },
            complete: () => {
                setTimeout(() => {
                    uni.hideLoading()
                }, 500)
            }
		})
	})
}