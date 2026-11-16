<template>
	<view class="chat">
		<view class="login-tip" v-if="!loginStatus" @tap="goLogin">
			<uni-icons type="info" size="16" color="#e6a23c"></uni-icons>
			<text class="login-tip-text">登录后可查询订单、生成 AI 营销素材</text>
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
				<view class="bubble" :class="{ 'bubble-media': hasMedia(m) }">
					<text v-if="m.content" class="bubble-text">{{ m.content }}</text>
					<template v-for="(a, ai) in (m.assets || [])" :key="ai">
						<image
							v-if="a.type === 'image' && a.url"
							class="bubble-img"
							:src="assetUrl(a.url)"
							mode="widthFix"
							@tap="previewImage(assetUrl(a.url))"
						/>
						<video
							v-else-if="a.type === 'video' && a.url"
							class="bubble-video"
							:src="assetUrl(a.url)"
							:poster="a.cover ? assetUrl(a.cover) : ''"
							object-fit="cover"
							controls
						></video>
						<view v-else-if="a.type === 'video'" class="bubble-pending">
							<text>视频生成中，约需 1 分钟…</text>
						</view>
					</template>
				</view>
			</view>
			<view v-if="loading" class="msg msg-assistant">
				<view class="avatar">
					<uni-icons type="headphones" color="#42b7fb" size="20"></uni-icons>
				</view>
				<view class="bubble">正在思考中…</view>
			</view>
		</scroll-view>

		<scroll-view v-if="showQuick" class="quick-list" scroll-x>
			<view v-for="item in quickList" :key="item.label" class="quick-item" @tap="onQuick(item)">
				{{ item.label }}
			</view>
		</scroll-view>

		<view class="input-bar">
			<input
				class="input"
				v-model="input"
				placeholder="如：怎么退货？给这个商品做张海报"
				confirm-type="send"
				:disabled="loading"
				@confirm="send()"
			/>
			<view class="send-btn" :class="{ disabled: loading }" @tap="send()">
				<uni-icons type="paperplane-filled" color="#ffffff" size="20"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref, computed, nextTick} from 'vue'
	import {onLoad, onUnload} from '@dcloudio/uni-app'
	import {storeToRefs} from 'pinia'
	import request from '@/common/js/request.js'
	import config from '@/config/index.js'
	import {useUserStore} from '@/store/user.js'

	const userStore = useUserStore()
	const {loginStatus} = storeToRefs(userStore)

	// 商品上下文：由商品详情页跳转时带入，用于素材生成
	const goodId = ref('')

	const messages = ref([
		{
			role: 'assistant',
			content: '您好，我是智能客服，请问有什么可以帮您？\n您可以问我退换货、物流等政策，登录后还能查询订单、生成商品海报和短视频。',
			assets: []
		}
	])
	const input = ref('')
	const scrollTo = ref('')
	const loading = ref(false)
	// 页面卸载后停止轮询，避免后台空转
	let destroyed = false

	const quickList = [
		{ label: '退货政策', text: '怎么退货？' },
		{ label: '我的订单', text: '我的订单到哪了？' },
		{ label: '生成海报', text: '帮我给这个商品生成一张促销海报', needGood: true },
		{ label: '生成短视频', text: '给这个商品做一条 5 秒的种草短视频', needGood: true }
	]

	function onQuick(item) {
		// 没有商品上下文时，引导用户从详情页进入，避免生成与商品无关的素材
		if (item.needGood && !goodId.value) {
			uni.showToast({
				title: '请从商品详情页的「AI 营销素材」进入',
				icon: 'none'
			})
			return
		}
		send(item.text)
	}

	const showQuick = computed(() => messages.value.length <= 2)

	function assetUrl(path) {
		if (!path) return ''
		return /^https?:\/\//i.test(path) ? path : config.base_url + path
	}

	function hasMedia(message) {
		return Array.isArray(message.assets) && message.assets.length > 0
	}

	function previewImage(url) {
		uni.previewImage({ urls: [url], current: url })
	}

	function goLogin() {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	}

	/**
	 * 视频是方舟异步任务，前端按固定间隔轮询网关，成功后替换气泡内容
	 */
	async function pollVideo(taskId, message) {
		for (let i = 0; i < 40; i++) {
			await new Promise(resolve => setTimeout(resolve, 3000))
			if (destroyed) return

			try {
				const res = await request({
					url: `/api/aigc/task/${taskId}`,
					method: 'GET',
					loading: false
				})
				if (res.code !== 200) continue

				const {status, url, cover, error} = res.data
				if (status === 2) {
					message.assets = [{ type: 'video', url, cover }]
					scrollToBottom()
					return
				}
				if (status === 3) {
					message.assets = []
					message.content = (message.content ? message.content + '\n' : '') + '视频生成失败：' + (error || '请稍后再试')
					scrollToBottom()
					return
				}
			} catch (e) {
				// 单次轮询失败不中断，继续重试
			}
		}

		message.assets = []
		message.content = (message.content ? message.content + '\n' : '') + '视频生成超时，请稍后在「AI 创作中心」查看。'
	}

	async function send(text) {
		const q = (typeof text === 'string' ? text : input.value).trim()
		if (!q || loading.value) return

		messages.value.push({ role: 'user', content: q, assets: [] })
		input.value = ''
		scrollToBottom()
		loading.value = true

		try {
			const res = await request({
				url: '/api/chat',
				method: 'POST',
				data: {
					question: q,
					good_id: goodId.value || null
				},
				loading: false,
				// 生图会让接口耗时明显变长
				timeout: 180000
			})

			if (res.code === 200) {
				const message = {
					role: 'assistant',
					content: res.data.answer,
					assets: res.data.assets || []
				}
				messages.value.push(message)

				const videoTask = (res.data.assets || []).find(item => item.type === 'video' && item.taskId)
				if (videoTask) {
					pollVideo(videoTask.taskId, message)
				}
			} else {
				messages.value.push({
					role: 'assistant',
					content: res.message || '抱歉，我暂时无法回答，请稍后再试。',
					assets: []
				})
			}
		} catch (e) {
			messages.value.push({ role: 'assistant', content: '抱歉，服务暂时不可用，请稍后再试。', assets: [] })
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

	onLoad(options => {
		const query = options || {}
		goodId.value = query.goodId || query.good_id || ''

		if (query.auto === 'poster') {
			setTimeout(() => send('帮我给这个商品生成一张促销海报'), 300)
		} else if (query.auto === 'video') {
			setTimeout(() => send('给这个商品做一条 5 秒的种草短视频'), 300)
		}
	})

	onUnload(() => {
		destroyed = true
	})
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
		.bubble-media {
			padding: 12rpx;
			background-color: #ffffff;
		}
		.bubble-text {
			display: block;
			margin-bottom: 8rpx;
			white-space: pre-wrap;
		}
		.bubble-img {
			width: 100%;
			border-radius: 12rpx;
			display: block;
		}
		.bubble-video {
			width: 100%;
			height: 420rpx;
			border-radius: 12rpx;
		}
		.bubble-pending {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 360rpx;
			height: 200rpx;
			border-radius: 12rpx;
			background-color: #f2f6fb;
			font-size: 24rpx;
			color: #7a8ba6;
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
	.quick-list {
		white-space: nowrap;
		padding: 12rpx 24rpx;
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
		.quick-item {
			display: inline-block;
			padding: 10rpx 24rpx;
			margin-right: 16rpx;
			border-radius: 999rpx;
			background-color: #f2f6fb;
			color: #42b7fb;
			font-size: 24rpx;
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
