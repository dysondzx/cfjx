<template>
	<view class="tel-register">
		<Lines />
		<view class="register-container">
			<view class="input-section">
				<text class="label">手机号</text>
				<input type="number" class="input" v-model="tel" :focus="true" placeholder="请输入11位手机号" placeholder-style="color: #999" maxlength="11" />
			</view>
			
			<button class="next-btn" @click="nextStep">下一步</button>
			
			<view class="agreement">
				<text>继续注册表示您阅读并同意</text>
				<text class="agreement-link">《晨风精选网(含App)服务协议》</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import Lines from '@/components/common/Lines.vue'
	import { ref } from 'vue'
	import $http from '@/common/js/request.js'
	
	const tel = ref('')
	// 定义验证规则
	const rules = {
		tel: [
			{ required: true, message: '请输入11位手机号', trigger: 'blur' },
			{ pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
		],
	}
	/**
	 * 下一步按钮点击事件处理函数
	 * 先验证手机号格式，验证通过后才能进行下一步操作
	 */
	const nextStep = () => {
		// 构建表单数据对象
		const formData = {
			tel: tel.value
		}
		
		// 验证表单数据
		const validateResult = validateForm(formData, rules)
		
		if (validateResult.isValid) {
			$http({
				url: '/api/user/checkPhoneExists',
				method: 'GET',
				data: {
					phone: tel.value,
				}
			}).then(res => {
				if(res.code === 200) {
					if(res.data === true) {
						uni.showToast({
							title: '手机号已经存在',
							icon: 'none'
						})
					} else {						
						// 验证通过，执行下一步操作
						uni.showToast({
							title: '验证通过，准备下一步',
							icon: 'success',
							duration: 2000
						})
						
						// 这里可以添加下一步的具体逻辑，比如跳转到验证码页面
						uni.navigateTo({
							url: '/pages/verify-code/verify-code?tel=' + tel.value
						})
					}
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none'
					})
				}
			})
			
		} else {
			// 验证失败，显示错误信息
			uni.showToast({
				title: validateResult.errors[0],
				icon: 'none',
				duration: 2000
			})
		}
	}
	
	/**
	 * 表单验证函数
	 * @param {Object} formData - 表单数据对象
	 * @param {Object} rules - 验证规则对象
	 * @returns {Object} 验证结果对象
	 */
	const validateForm = (formData, rules) => {
		const errors = []
		
		// 遍历验证规则
		for (const field in rules) {
			const fieldRules = rules[field]
			const value = formData[field]
			
			// 遍历字段的每条规则
			for (const rule of fieldRules) {
				// 必填验证
				if (rule.required && (!value || value.trim() === '')) {
					errors.push(rule.message)
					break
				}
				
				// 正则表达式验证
				if (rule.pattern && value) {
					if (!rule.pattern.test(value)) {
						errors.push(rule.message)
						break
					}
				}
				
				// 长度验证
				if (rule.min && value && value.length < rule.min) {
					errors.push(rule.message)
					break
				}
				
				if (rule.max && value && value.length > rule.max) {
					errors.push(rule.message)
					break
				}
			}
		}
		
		return {
			isValid: errors.length === 0,
			errors: errors
		}
	}
</script>

<style lang="scss" scoped>
	.tel-register {
		padding: 0 40rpx;
		background-color: #fff;
		min-height: 100vh;
	}
	
	.register-container {
		padding-top: 80rpx;
	}
	
	.input-section {
		border-bottom: 1rpx solid #eee;
		padding: 40rpx 0;
		display: flex;
		align-items: center;
	}
	
	.label {
		font-size: 32rpx;
		color: #333;
		margin-right: 40rpx;
		width: 120rpx;
	}
	
	.input {
		flex: 1;
		font-size: 32rpx;
		color: #333;
		height: 48rpx;
		line-height: 48rpx;
	}
	
	.next-btn {
		width: 100%;
		height: 90rpx;
		background-color: #1890ff;
		color: #fff;
		font-size: 36rpx;
		border-radius: 45rpx;
		margin-top: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.agreement {
		margin-top: 60rpx;
		text-align: center;
		font-size: 24rpx;
		color: #999;
	}
	
	.agreement-link {
		color: #1890ff;
		margin-left: 8rpx;
	}
</style>
