<template>
	<view class="chat">
		<view class="login-tip" v-if="!loginStatus" @tap="goLogin">
			<uni-icons type="info" size="16" color="#e6a23c"></uni-icons>
			<text class="login-tip-text">登录后可查询您的订单</text>
		</view>

		<scroll-view class="msg-list" scroll-y :scroll-into-view="scrollTo" scroll-with-animation>
			<view
				v-for="(m, i) in messages"
				:key="i"
				:id="'msg-' + i"
				:class="['msg', m.role === 'user' ? 'msg-user' : 'msg-assistant']"
			>
				<view class="avatar">
					<uni-icons
						:type="m.role === 'user' ? 'person-filled' : 'headphones'"
						:color="m.role === 'user' ? '#ffffff' : '#42b7fb'"
						size="20"
					></uni-icons>
				</view>
				<view class="bubble">{{ m.content }}</view>
			</view>
		</scroll-view>

		<view class="input-bar">
			<input
				class="input"
				v-model="input"
				placeholder="如：怎么退货？我的订单到哪了？"
				confirm-type="send"
				:disabled="loading"
				@confirm="send"
			/>
			<view class="send-btn" :class="{ disabled: loading }" @tap="send">
				<uni-icons type="paperplane-filled" color="#ffffff" size="20"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref, nextTick} from 'vue'
	import {storeToRefs} from 'pinia'
	import request from '@/common/js/request.js'
	import {useUserStore} from '@/store/user.js'

	const userStore = useUserStore()
	const {loginStatus} = storeToRefs(userStore)

	const messages = ref([
		{
			role: 'assistant',
			content: '您好，我是智能客服，请问有什么可以帮您？\n您可以问我退换货、物流等政策，登录后还能查询您的订单。'
		}
	])
	const input = ref('')
	const scrollTo = ref('')
	const loading = ref(false)

	function goLogin() {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	}

	async function send() {
		const q = input.value.trim()
		if (!q || loading.value) return
		messages.value.push({ role: 'user', content: q })
		input.value = ''
		scrollToBottom()
		loading.value = true
		try {
			const res = await request({
				url: '/api/chat',
				method: 'POST',
				data: { question: q },
				loading: false
			})
			if (res.code === 200) {
				messages.value.push({ role: 'assistant', content: res.data.answer })
			} else {
				messages.value.push({ role: 'assistant', content: res.message || '抱歉，我暂时无法回答，请稍后再试。' })
			}
		} catch (e) {
			messages.value.push({ role: 'assistant', content: '抱歉，服务暂时不可用，请稍后再试。' })
		} finally {
			loading.value = false
			scrollToBottom()
		}
	}

	function scrollToBottom() {
		nextTick(() => {
			scrollTo.value = 'msg-' + (messages.value.length - 1)
		})
	}
</script>

<style lang="scss" scoped>
	.chat {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
	}
	.login-tip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16rpx 24rpx;
		background-color: #fdf6ec;
		.login-tip-text {
			margin-left: 8rpx;
			font-size: 24rpx;
			color: #e6a23c;
		}
	}
	.msg-list {
		flex: 1;
		overflow: hidden;
		padding: 24rpx;
		box-sizing: border-box;
	}
	.msg {
		display: flex;
		align-items: flex-start;
		margin-bottom: 28rpx;

		.avatar {
			width: 64rpx;
			height: 64rpx;
			border-radius: 50%;
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: #e8f4fd;
		}
		.bubble {
			max-width: 70%;
			padding: 20rpx 26rpx;
			border-radius: 16rpx;
			font-size: 28rpx;
			line-height: 1.6;
			word-break: break-all;
			white-space: pre-wrap;
			margin: 0 16rpx;
		}
	}
	.msg-assistant {
		justify-content: flex-start;
		.bubble {
			background-color: #ffffff;
			color: #333333;
		}
	}
	.msg-user {
		justify-content: flex-start;
		flex-direction: row-reverse;
		.avatar {
			background-color: #42b7fb;
		}
		.bubble {
			background-color: #42b7fb;
			color: #ffffff;
		}
	}
	.input-bar {
		display: flex;
		align-items: center;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 1rpx solid #eeeeee;
	}
	.input {
		flex: 1;
		height: 72rpx;
		background-color: #f2f2f2;
		border-radius: 36rpx;
		padding: 0 28rpx;
		font-size: 28rpx;
	}
	.send-btn {
		width: 72rpx;
		height: 72rpx;
		margin-left: 16rpx;
		border-radius: 50%;
		background-color: #42b7fb;
		display: flex;
		align-items: center;
		justify-content: center;
		&.disabled {
			opacity: 0.5;
		}
	}
</style>
