const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const expiresInTime = '4h'

function setupUserRoutes(router, pool) {
	// 手机号，验证码注册
	router.post('/api/user/registerByPhone', async ctx => {
		try {
			const {phone, verifyCode} = ctx.request.body;
			// 验证输入
			if (!phone) {
				ctx.body = {
					code: 400,
					message: '手机号不能为空'
				};
				return;
			}
			// 检查手机号是否存在
			const [existingUsers] = await pool.execute('SELECT * FROM user WHERE phone = ' + phone);
			if (existingUsers.length > 0) {
				ctx.body = {
					code: 400,
					message: '手机号已存在'
				};
				return;
			}
			// 插入新用户
			const [insertResult] = await pool.execute(
				`INSERT INTO user (phone, nickname) VALUES (${phone}, '无名氏')`
			);
			
			// 获取插入的用户ID
			const userId = insertResult.insertId;
			
			// 查询完整的用户信息
			const [users] = await pool.execute('SELECT * FROM user WHERE id = ?', [userId]);
			const userData = users[0];			
			const payload = {
				userId: userData.id
			}
			// 从环境变量获取JWT密钥
			const jwtSecret = process.env.JWT_SECRET;
			const token = jwt.sign(payload, jwtSecret, { expiresIn: expiresInTime })
			ctx.body = {
				code: 200,
				message: '注册成功',
				data: {
					userInfo: userData,
					token: token
				}
			};
		} catch (error) {
			ctx.body = {
				code: 500,
				message: '服务器错误'
			};
		}
	});
	
	// 账号(或者手机号)，密码登录
	router.post('/api/user/login', async ctx => {
		try {
			const {accontNo, password} = ctx.request.body
			if (!accontNo) {
				ctx.body = {
					code: 400,
					message: '账号不能为空'
				};
				return;
			}
			if (!password) {
				ctx.body = {
					code: 400,
					message: '密码不能为空'
				};
				return;
			}
			const [results] = await pool.execute(`SELECT * FROM user WHERE username = '${accontNo}' or phone = '${accontNo}'`)
			if(!results || results.length === 0) {
				ctx.body = {
					code: 400,
					message: '账号不存在'
				};
				return;
			}
			const userData = results[0];
			const md5Pwd = crypto.createHash('md5').update(password).digest('hex')
			if(userData.password !== md5Pwd) {
				ctx.body = {
					code: 400,
					message: '密码错误'
				};
				return;
			}
			const payload = {
			userId: userData.id
		}
		// 从环境变量获取JWT密钥
		const jwtSecret = process.env.JWT_SECRET;
		const token = jwt.sign(payload, jwtSecret, { expiresIn: expiresInTime })
			ctx.body = {
				code: 200,
				message: '登录成功',
				data: {
					userInfo: userData,
					token: token
				}
			};		
		} catch (error) {
			console.log('login error:', error);
			ctx.body = {
				code: 500,
				message: '服务器错误'
			}
		}
	})
	
	//检查手机号是否存在
	router.get('/api/user/checkPhoneExists', async ctx => {
		const phone = ctx.query.phone
		try {
			const [existingUsers] = await pool.execute('SELECT * FROM user WHERE phone = ?', [phone]);
			ctx.body = {
				code: 200,
				message: '检查成功',
				data: existingUsers && existingUsers.length > 0? true: false
			};
		} catch (error) {
			ctx.body = {
				code: 500,
				message: '服务器错误'
			}
		}
	})

	// 微信小程序使用code换取openid
	router.get('/api/user/getWxOpenIdByCode', async ctx => {
		try {
			const code = ctx.query.code	
			// 验证参数
			if (!code) {
				ctx.body = {
					code: 400,
					message: 'code参数不能为空'
				};
				return;
			}
			
			// 微信小程序配置（需要替换为实际的小程序配置）
			const appid = process.env.WX_APPID;
			const secret = process.env.WX_SECRET;
			
			// 调用微信接口获取openid
			const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
			
			const response = await fetch(wxUrl);
			const wxResult = await response.json();
			
			console.log('微信接口返回:', wxResult);
			
			if (wxResult.errcode) {
				// 微信接口返回错误
				ctx.body = {
					code: 400,
					message: `微信接口错误: ${wxResult.errmsg}`,
					data: wxResult
				};
				return;
			}
			
			const { openid, session_key } = wxResult;
			
			if (!openid) {
				ctx.body = {
					code: 400,
					message: '获取openid失败'
				};
				return;
			}
					
			ctx.body = {
				code: 200,
				message: '获取openid成功',
				data: {
					openid: openid,
					session_key: session_key
				}
			};
			
		} catch (error) {
			console.error('获取微信openid错误:', error);
			ctx.body = {
				code: 500,
				message: '服务器错误'
			};
		}
	})

	//检查第三方登录账户是否存在
	router.get('/api/user/checkThirdPartyExists', async ctx => {
		const openid = ctx.query.openid
		const platform = ctx.query.platform
		try {
			const [existingUserThirdParty] = await pool.execute('SELECT * FROM user_third_party WHERE platform = ? AND openid = ?', [platform, openid])
			ctx.body = {
				code: 200,
				message: '检查成功',
				data: existingUserThirdParty && existingUserThirdParty.length > 0? true: false
			};
		} catch (error) {
			ctx.body = {
				code: 500,
				message: '服务器错误'
			}
		}
	})

	// 第三方登录接口
	router.post('/api/user/loginByThirdParty', async ctx => {
		try {
			const {phone, openid, platform} = ctx.request.body;
			console.log('loginByThirdParty phone, openid, platform:', phone, openid, platform);
			// 查询用户第三方登录关联表是否存在
			const [existingUserThirdParty] = await pool.execute('SELECT * FROM user_third_party WHERE platform = ? AND openid = ?', [platform, openid])
			let userData = null
			// 用户第三方登录关联表已经存在
			if(existingUserThirdParty.length > 0) {
				// 关联表存在，根据关联表查询用户信息
				const userId = existingUserThirdParty[0].user_id
				const [users] = await pool.execute('SELECT * FROM user WHERE id = ?', [userId]);
				userData = users[0];			
			} else {
				// 第三方登录账户不存在，根据手机号查询用户信息
				// 检查手机号是否存在
				const [existingUsers] = await pool.execute('SELECT * FROM user WHERE phone = ' + phone);
				if (existingUsers.length > 0) {
					userData = existingUsers[0];
				} else {
					// 插入新用户
					const [insertResult] = await pool.execute(
						`INSERT INTO user (phone, nickname) VALUES (${phone}, '无名氏')`
					);
					
					// 获取插入的用户ID
					const userId = insertResult.insertId;
					
					// 查询完整的用户信息
					const [users] = await pool.execute('SELECT * FROM user WHERE id = ?', [userId]);
					userData = users[0];			
				}
				// 插入用户第三方登录关联表
				await pool.execute('INSERT INTO user_third_party (user_id, platform, openid) VALUES (?, ?, ?)', [userData.id, platform, openid])
			}
			
			const payload = {
				userId: userData.id
			}
			// 从环境变量获取JWT密钥
			const jwtSecret = process.env.JWT_SECRET;
			const token = jwt.sign(payload, jwtSecret, { expiresIn: expiresInTime })
			ctx.body = {
				code: 200,
				message: '登录成功',
				data: {
					userInfo: userData,
					token: token
				}
			};
		} catch (error) {
			console.error('第三方登录错误:', error);
			ctx.body = {
				code: 500,
				message: '服务器错误'
			};
		}
	});
}

module.exports = setupUserRoutes;