<template>
	<view class="verify-code">
		<Lines />
		<view class="verify-container">
			<view class="input-section">
				<text class="label">验证码</text>
				<input type="number" v-model="verifyCode" class="input" placeholder="请输入验证码" placeholder-style="color: #999" />
				<button class="resend-btn" plain :disabled="resendBtnDisabled" @click="resendCode">{{ resendBtnText }}</button>
			</view>
			
			<view class="hint-text">
				我们已经给你的手机号码{{ tel }}发送了验证短信
			</view>
			
			<button class="next-btn" :plain="!verifyCode" :disabled="!verifyCode" @tap="nextStep">下一步</button>
		</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {onLoad, onReady} from '@dcloudio/uni-app'
	import Lines from '@/components/common/Lines.vue'
	import $http from '@/common/js/request.js'
	import {useUserStore} from '@/store/user.js'
	
	const userStore = useUserStore()
	
	const tel = ref('')
	const verifyCode = ref('')
	const countDown = ref(10)
	const resendBtnText = ref('')
	const resendBtnDisabled = ref(false)
	
	/**
	 * 页面加载时获取传入的手机号参数
	 * @param {Object} e - 页面参数对象
	 */
	onLoad(e => {
		tel.value = e.tel
	})
	onReady(()=> {
		resendBtnText.value = `重新发送(${countDown.value})`
		resendCode()		
	})

	function resendCode() {
		resendBtnDisabled.value = true
		// 启动倒计时
		const timer = setInterval(() => {
			countDown.value--
			if (countDown.value <= 0) {
				clearInterval(timer)
				resendBtnText.value = `重新发送`
				resendBtnDisabled.value = false
				countDown.value = 10
			} else {
				resendBtnText.value = `重新发送(${countDown.value})`
			}
		}, 1000)
	}
	
	function nextStep() {
		$http({
			url: '/api/user/registerByPhone',
			method: 'POST',
			data: {
				phone: tel.value,
				verifyCode: verifyCode.value
			}
		}).then(res => {
			if(res.code === 200) {
				uni.showToast({
					title: '注册成功',
					icon: 'success'
				})
				userStore.login(res.data)
				uni.reLaunch({
					url: '/pages/index/index',
				})
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	
</script>

<style lang="scss" scoped>
	.verify-code {
		padding: 0 40rpx;
		background-color: #fff;
		min-height: 100vh;
	}
	
	.verify-container {
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
	
	.resend-btn {
		font-size: 28rpx;
		color: #1890ff;
		padding: 10rpx 30rpx;
    	border-radius: 50rpx;
	}
	
	.hint-text {
		margin-top: 40rpx;
		font-size: 28rpx;
		color: #666;
		line-height: 40rpx;
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
</style>
