<template>
	<view class="login">
		<swiper :vertical="true" style="height: 100vh;">
			<swiper-item>
				<scroll-view scroll-y="true" style="height: 100%;">				
					<view class="login-main">
						<view class="main-top">
							<image class="close" src="/static/image/login/close.png" mode="aspectFit" @tap="goBack"></image>
						</view>
						<view class="main-core">
							<image class="logo-img" src="/static/image/common/logo.png" mode="aspectFit"></image>
						</view>
						<view class="main-tel" @tap="goRegister">
							<text>手机号注册</text>
						</view>
						<view class="other-login">
							<view class="other-login-tip">
								或用以下方式登录
							</view>
							<view class="other-login-types">
								<view class="other-login-item" @tap="loginOther('weixin')">
									<image class="login-item-img" src="/static/image/login/wx.png" mode="aspectFit"></image>
									<text class="login-item-label">
										微信登录
									</text>
								</view>
								<view class="other-login-item" @tap="loginOther('sinaweibo')">
									<image class="login-item-img" src="/static/image/login/wb.png" mode="aspectFit"></image>
									<text class="login-item-label">
										微博登录
									</text>
								</view>
								<view class="other-login-item" @tap="loginOther('qq')">
									<image class="login-item-img" src="/static/image/login/qq.png" mode="aspectFit"></image>
									<text class="login-item-label">
										QQ登录
									</text>
								</view>
							</view>
						</view>
						<view class="hasAccount">
							<text>已有帐号，去登录</text>
							<image class="tologin-img" src="/static/image/login/down.png" mode="aspectFit"></image>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			<swiper-item>
				<scroll-view scroll-y="true" style="height: 100%;">				
					<view class="login-main">
						<view class="main-top">
							<image class="close" src="/static/image/login/close.png" mode="aspectFit" @tap="goBack"></image>
							<view class="noAccount">
								<image class="toregister-img" src="/static/image/login/up.png" mode="aspectFit"></image>
								<text>没有账号，去注册</text>
							</view>
						</view>
						<view class="login-form">
							<view class="form-item">
								<view class="form-label">账号</view>
								<view class="form-input">
									<input type="text" v-model="accontNo" placeholder="请输入手机号/昵称" placeholder-style="color: #999;" />
								</view>
							</view>
							<view class="form-item">
								<view class="form-label">密码</view>
								<view class="form-input">
									<input type="password" v-model="password" placeholder="6-16位字符" placeholder-style="color: #999;" />
								</view>
							</view>
							<view class="form-links">
								<text class="forget-password">忘记密码?</text>
								<text class="no-password-login">免密登录</text>
							</view>
							<view class="form-btn" @tap="login">
								<text>登录</text>
							</view>
							<view class="form-tip">
								<text>温馨提示：您可选择免密登录，方便快捷。</text>
							</view>
						</view>
						<view class="other-login">
							<view class="other-login-tip">
								或用以下方式登录
							</view>
							<view class="other-login-types">
								<view class="other-login-item" @tap="loginOther('weixin')">
									<image class="login-item-img" src="/static/image/login/wx.png" mode="aspectFit"></image>
									<text class="login-item-label">
										微信登录
									</text>
								</view>
								<view class="other-login-item" @tap="loginOther('sinaweibo')">
									<image class="login-item-img" src="/static/image/login/wb.png" mode="aspectFit"></image>
									<text class="login-item-label">
										微博登录
									</text>
								</view>
								<view class="other-login-item" @tap="loginOther('qq')">
									<image class="login-item-img" src="/static/image/login/qq.png" mode="aspectFit"></image>
									<text class="login-item-label">
										QQ登录
									</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
		
		<!-- 手机号输入对话框 -->
		<view v-if="phoneDialogVisible" class="phone-dialog-mask">
			<view class="phone-dialog">
				<view class="dialog-header">
					<text class="dialog-title">手机号验证</text>
					<text class="dialog-close" @tap="closePhoneDialog">×</text>
				</view>
				<view class="dialog-content">
					<view class="phone-input-container">
						<input 
							class="phone-input" 
							type="number" 
							v-model="phoneInput" 
							placeholder="请输入关联手机号" 
							placeholder-style="color: #999;"
							maxlength="11"
						/>
					</view>
				</view>
				<view class="dialog-footer">
					<view class="dialog-btn cancel-btn" @tap="closePhoneDialog">取消</view>
					<view class="dialog-btn confirm-btn" @tap="confirmPhoneInput">确认</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import $http from '@/common/js/request.js'
	import {useUserStore} from '@/store/user.js'
	const userStore = useUserStore()
	
	// 定义表单数据
	const accontNo = ref('')
	const password = ref('')
	
	// 定义验证规则
	const rules = {
		accontNo: [
			{ required: true, message: '请输入账号', trigger: 'blur' },
		],
		password: [
			{ required: true, message: '请输入密码', trigger: 'blur' },
		]
	}
	
	/**
	 * 表单验证函数
	 * @param {Object} formData - 表单数据对象
	 * @param {Object} rules - 验证规则对象
	 * @returns {Object} 验证结果对象
	 */
	function validateForm(formData, rules) {
		const errors = {}
		
		for (const field in rules) {
			const fieldRules = rules[field]
			const value = formData[field]
			
			for (const rule of fieldRules) {
				// 必填验证
				if (rule.required && (!value || value.trim() === '')) {
					errors[field] = rule.message
					break
				}
				
				// 长度验证
				if (rule.min && value && value.length < rule.min) {
					errors[field] = rule.message
					break
				}
				if (rule.max && value && value.length > rule.max) {
					errors[field] = rule.message
					break
				}
				
				// 自定义验证器
				if (rule.validator) {
					let errorMessage = null
					rule.validator(rule, value, (error) => {
						if (error) {
							errorMessage = error.message || error
						}
					})
					if (errorMessage) {
						errors[field] = errorMessage
						break
					}
				}
			}
		}
		
		return {
			hasErrors: Object.keys(errors).length > 0,
			errors: errors
		}
	}
	
	/**
	 * 登录函数 - 包含表单验证逻辑
	 */
	function login() {
		// 构建表单数据对象
		const formData = {
			accontNo: accontNo.value,
			password: password.value
		}
		
		// 执行表单验证
		const validationResult = validateForm(formData, rules)
		
		if (validationResult.hasErrors) {
			// 显示第一个错误信息
			const firstErrorField = Object.keys(validationResult.errors)[0]
			const errorMessage = validationResult.errors[firstErrorField]
			
			uni.showToast({
				title: errorMessage,
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		$http({
			url: '/api/user/login',
			method: 'POST',
			data: formData
		}).then(res => {
			if(res.code === 200) {
				userStore.login(res.data)
				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 3000,
					success: () => {
						uni.reLaunch({
							url: '/pages/index/index',
						})					
					}
				})
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	
	
	// 定义对话框相关数据
	const phoneDialogVisible = ref(false)
	const phoneInput = ref('')
	const currentProvider = ref('')
	
	/**
	 * 第三方登录函数 - 先验证手机号格式，再执行登录
	 * @param {string} provider - 第三方登录提供商
	 */
	function loginOther(provider) {
		uni.login({
			provider: provider,
			onlyAuthorize: false,
			success: res => {
				// 判断当前平台类型
				const platform = uni.getSystemInfoSync().platform;
				
				// 微信小程序平台处理
				if (platform === 'devtools' || platform === 'mp-weixin') {
					// 微信小程序：需要将code发送到后端获取openid
					// 调用后端接口，使用code换取openid
					$http({
						url: '/api/user/getWxOpenIdByCode',
						method: 'GET',
						data: {
							code: res.code,
							platform: provider
						}
					}).then(res2 => {
						if(res2.code === 200) {
							console.log('获取到的openid:', res2.data.openid);
							// 检查第三方登录账户是否存在
							$http({
								url: '/api/user/checkThirdPartyExists',
								method: 'GET',
								data: {
									openid: res2.data.openid,
									platform: provider,
								}
							}).then(res3 => {
								if(res3.code === 200) {
									// 账户已存在，则直接登录
									if(res3.data === true) {
										// 调用后端接口，使用openid登录
										$http({
											url: '/api/user/loginByThirdParty',
											method: 'POST',
											data: {
												openid: res2.data.openid,
												platform: provider,
											}
										}).then(res3 => {
											if(res3.code === 200) {
												userStore.login(res3.data)
												uni.showToast({
													title: '登录成功',
													icon: 'success',
													duration: 3000,
													success: () => {
														uni.reLaunch({
															url: '/pages/index/index',
														})					
													}
												})
											} else {
												uni.showToast({
													title: res3.message,
													icon: 'none'
												})
											}
										})							
									} else { // 否则，弹出手机号输入框
										showPhoneDialog(provider)
									}
								} else {
									uni.showToast({
										title: res3.message,
										icon: 'none'
									})
								}
							})							
							
						} else {
							uni.showToast({
								title: res2.message,
								icon: 'none'
							})
						}
					})
				} else {
					// 其他平台（APP、H5等）：可以直接获取用户信息
					uni.getUserInfo({
						provider: provider,
						success: (ret) => {
							// 检查第三方登录账户是否存在
							$http({
								url: '/api/user/checkThirdPartyExists',
								method: 'GET',
								data: {
									openid: ret.userInfo.openId,
									platform: provider,
								}
							}).then(res3 => {
								if(res3.code === 200) {
									// 账户已存在，则直接登录
									if(res3.data === true) {
										$http({
											url: '/api/user/loginByThirdParty',
											method: 'POST',
											data: {
												openid: ret.userInfo.openId,
												platform: provider
											}
										}).then(res4 => {
											if(res4.code === 200) {
												userStore.login(res4.data)
												uni.showToast({
													title: '登录成功',
													icon: 'success',
													duration: 3000,
													success: () => {
														uni.reLaunch({
															url: '/pages/index/index',
														})					
													}
												})
											} else {
												uni.showToast({
													title: res4.message,
													icon: 'none'
												})
											}
										})
									} else { // 否则，弹出手机号输入框
										showPhoneDialog(provider)
									}
								} else {
									uni.showToast({
										title: res3.message,
										icon: 'none'
									})
								}
							})						
						},
						fail: err => {
							console.log('uni.getUserInfo err:', err);
						}
					});
				}
			},
			fail: err => {
				console.log('uni.login err:', err);
			}
		})
	
	}

	function thirdPartyLogin(provider) {
		uni.login({
			provider: provider,
			onlyAuthorize: false,
			success: res => {
				// 判断当前平台类型
				const platform = uni.getSystemInfoSync().platform;
				
				// 微信小程序平台处理
				if (platform === 'devtools' || platform === 'mp-weixin') {
					// 微信小程序：需要将code发送到后端获取openid
					// 调用后端接口，使用code换取openid
					$http({
						url: '/api/user/getWxOpenIdByCode',
						method: 'GET',
						data: {
							code: res.code,
							platform: provider
						}
					}).then(res2 => {
						if(res2.code === 200) {
							console.log('获取到的openid:', res2.data.openid);								
							// 调用后端接口，使用openid登录
							$http({
								url: '/api/user/loginByThirdParty',
								method: 'POST',
								data: {
									openid: res2.data.openid,
									platform: provider,
									phone: phoneInput.value
								}
							}).then(res3 => {
								if(res3.code === 200) {
									userStore.login(res3.data)
									uni.showToast({
										title: '登录成功',
										icon: 'success',
										duration: 3000,
										success: () => {
											uni.reLaunch({
												url: '/pages/index/index',
											})					
										}
									})
								} else {
									uni.showToast({
										title: res3.message,
										icon: 'none'
									})
								}
							})
						} else {
							uni.showToast({
								title: res2.message,
								icon: 'none'
							})
						}
					})
				} else {
					// 其他平台（APP、H5等）：可以直接获取用户信息
					uni.getUserInfo({
						provider: provider,
						success: (ret) => {
							$http({
								url: '/api/user/loginByThirdParty',
								method: 'POST',
								data: {
									openid: ret.userInfo.openId,
									platform: provider,
									phone: phoneInput.value
								}
							}).then(res4 => {
								if(res4.code === 200) {
									userStore.login(res4.data)
									uni.showToast({
										title: '登录成功',
										icon: 'success',
										duration: 3000,
										success: () => {
											uni.reLaunch({
												url: '/pages/index/index',
											})					
										}
									})
								} else {
									uni.showToast({
										title: res4.message,
										icon: 'none'
									})
								}
							})
						},
						fail: err => {
							console.log('uni.getUserInfo err:', err);
						}
					});
				}
			},
			fail: err => {
				console.log('uni.login err:', err);
			}
		})
	}

	function showPhoneDialog(provider) {
		// 保存当前提供商
		currentProvider.value = provider
		// 清空输入框
		phoneInput.value = ''
		// 显示自定义手机号输入对话框
		phoneDialogVisible.value = true
	}

	/**
	 * 关闭手机号输入对话框
	 */
	function closePhoneDialog() {
		phoneDialogVisible.value = false
	}
	
	/**
	 * 确认手机号输入
	 */
	function confirmPhoneInput() {
		const phoneNumber = phoneInput.value.trim()
		
		// 验证手机号格式
		if (!validatePhoneNumber(phoneNumber)) {
			uni.showToast({
				title: '手机号格式不正确，请重新输入',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 关闭对话框
		closePhoneDialog()
		
		// 手机号验证通过，执行第三方登录
		thirdPartyLogin(currentProvider.value)
	}
	
	/**
	 * 验证手机号格式
	 * @param {string} phone - 手机号码
	 * @returns {boolean} 验证结果
	 */
	function validatePhoneNumber(phone) {
		// 手机号正则表达式：1开头，第二位3-9，后面9位数字
		const phoneRegex = /^1[3-9]\d{9}$/
		return phoneRegex.test(phone)
	}
	
	/**
	 * 返回上一页
	 */
	function goBack() {
		uni.navigateBack({
			delta: 1
		})
	}

	function goRegister() {
		uni.navigateTo({
			url: '/pages/tel-register/tel-register'
		})
	}
</script>

<style lang="scss" scoped>
	.login {
		background-color: #fff;
		.login-main {
			padding: 30rpx;
			width: 100vw;
			height: 100vh;
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			
			.main-top {
				display: flex;
				justify-content: center;
				align-items: center;
				margin-top: 70rpx;
				position: relative;
				width: 100%;
				.close {
					position: absolute;
					left: 0;
					top: 0;
					width: 60rpx;
					height: 60rpx;
				}
				.noAccount {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					.toregister-img {
						width: 60rpx;
						height: 60rpx;
						margin-bottom: 15rpx;
					}
					text {
						font-size: 32rpx;
						color: #101010;
					}
				}
			}
			
			.main-core {
				margin-top: 200rpx;
				width: 400rpx;
				height: 400rpx;
				.logo-img {
					width: 100%;
					height: 100%;
				}
			}
			
			.main-login {
				margin-top: 200rpx;
			}
			
			.login-form {
				width: 100%;
				margin-top: 200rpx;
				
				.form-item {
					display: flex;
					align-items: center;
					padding: 30rpx 0;
					border-bottom: 1rpx solid #cbc9c9;
					
					.form-label {
						font-size: 32rpx;
						color: #070707;
						padding-right: 30rpx;
					}
					
					.form-input {
						flex: 1;
						input {
							font-size: 32rpx;
							color: #101010;
							width: 100%;
							height: 40rpx;
							line-height: 40rpx;
							padding: 0 20rpx;
						}
					}
				}
				
				.form-links {
					display: flex;
					justify-content: space-between;
					margin-top: 40rpx;
					
					.forget-password {
						font-size: 28rpx;
						color: #070707;
					}
					
					.no-password-login {
						font-size: 28rpx;
						color: #070707;
					}
				}
				
				.form-btn {
					width: 100%;
					height: 90rpx;
					line-height: 90rpx;
					text-align: center;
					background-color: #42B7FB;
					border-radius: 45rpx;
					margin-top: 60rpx;
					text {
						font-size: 36rpx;
						color: #fff;
					}
				}
				
				.form-tip {
					margin-top: 40rpx;
					text-align: center;
					text {
						font-size: 26rpx;
						color: #999;
					}
				}
			}
			
			.main-tel {
				width: 100%;
				height: 90rpx;
				line-height: 90rpx;
				text-align: center;
				background-color: #42B7FB;
				border-radius: 45rpx;
				margin-top: 200rpx;
				text {
					font-size: 36rpx;
					color: #fff;
				}
			}
			
			.other-login {
				width: 100%;
				margin-top: 150rpx;
				
				.other-login-tip {
					color: #101010;
					height: 40rpx;
					line-height: 40rpx;
					font-size: 28rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					margin-bottom: 60rpx;
					
					&::before, &::after {
						content: '';
						height: 1rpx;
						background-color: #aaa;
						flex: 1;
					}
					
					&::before {
						margin-right: 30rpx;
					}
					
					&::after {
						margin-left: 30rpx;
					}
				}
				
				.other-login-types {
					display: flex;
					align-items: center;
					justify-content: space-around;
					
					.other-login-item {
						flex: 1;
						display: flex;
						flex-direction: column;
						align-items: center;
						
						.login-item-img {
							width: 80rpx;
							height: 80rpx;
						}
						
						.login-item-label {
							font-size: 28rpx;
							height: 40rpx;
							line-height: 40rpx;
							color: #101010;
							background-color: transparent;
							margin-top: 10rpx;
						}
					}
				}
			}
			
			.hasAccount {
				margin-top: 120rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				text {
					font-size: 32rpx;
					color: #101010;
				}
				.tologin-img {
					width: 60rpx;
					height: 60rpx;
					margin-top: 10rpx;
				}
			}
		}
	}
	
	/* 手机号输入对话框样式 */
	.phone-dialog-mask {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}
	
	.phone-dialog {
		width: 600rpx;
		background-color: #fff;
		border-radius: 20rpx;
		overflow: hidden;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
	}
	
	.dialog-header {
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		position: relative;
		border-bottom: 1rpx solid #eee;
	}
	
	.dialog-title {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
	}
	
	.dialog-close {
		position: absolute;
		right: 30rpx;
		top: 0;
		font-size: 50rpx;
		color: #999;
		width: 60rpx;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
	}
	
	.dialog-content {
		padding: 40rpx 30rpx;
	}
	
	.dialog-tip {
		font-size: 28rpx;
		color: #666;
		text-align: center;
		display: block;
		margin-bottom: 40rpx;
	}
	
	.phone-input-container {
		border: 2rpx solid #e0e0e0;
		border-radius: 10rpx;
		overflow: hidden;
		background-color: #f9f9f9;
	}
	
	.phone-input {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 32rpx;
		color: #333;
		padding: 0 20rpx;
		background-color: transparent;
		border: none;
		outline: none;
	}
	
	.phone-input:focus {
		background-color: #fff;
	}
	
	.dialog-footer {
		display: flex;
		border-top: 1rpx solid #eee;
	}
	
	.dialog-btn {
		flex: 1;
		height: 100rpx;
		line-height: 100rpx;
		text-align: center;
		font-size: 32rpx;
		font-weight: bold;
	}
	
	.cancel-btn {
		color: #999;
		border-right: 1rpx solid #eee;
	}
	
	.confirm-btn {
		color: #42B7FB;
		background-color: #fff;
	}
</style>
