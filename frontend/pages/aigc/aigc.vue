<template>
	<view class="aigc">
		<view class="header">
			<text class="title">我的 AI 素材</text>
			<text class="subtitle">海报与短视频会自动保存在这里</text>
		</view>

		<view v-if="!loading && !list.length" class="empty">
			<text class="empty-text">还没有生成过素材</text>
			<text class="empty-tip">去商品详情页试试「AI 营销素材」吧～</text>
		</view>

		<view class="grid">
			<view v-for="item in list" :key="item.id" class="card">
				<view class="media-wrap" @tap="openItem(item)">
					<image
						v-if="item.taskType === 1 && item.url"
						class="media"
						:src="assetUrl(item.url)"
						mode="aspectFill"
					/>
					<video
						v-else-if="item.taskType === 2 && item.url"
						class="media"
						:src="assetUrl(item.url)"
						:poster="item.cover ? assetUrl(item.cover) : ''"
						object-fit="cover"
						controls
					></video>
					<view v-else class="media placeholder">
						<text class="placeholder-text">{{ statusText(item) }}</text>
					</view>

					<view v-if="item.status !== 2" class="badge" :class="'badge-' + item.status">
						{{ statusText(item) }}
					</view>
				</view>

				<view class="caption">{{ item.caption || 'AI 生成素材' }}</view>
				<view class="actions">
					<text v-if="item.status === 2" class="action" @tap="save(item)">保存</text>
					<text class="action danger" @tap="remove(item)">删除</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {onShow, onHide, onUnload} from '@dcloudio/uni-app'
	import request from '@/common/js/request.js'
	import config from '@/config/index.js'

	const list = ref([])
	const loading = ref(false)
	let timer = null

	function assetUrl(path) {
		if (!path) return ''
		return /^https?:\/\//i.test(path) ? path : config.base_url + path
	}

	function statusText(item) {
		const map = { 0: '排队中', 1: '生成中', 2: '已完成', 3: '生成失败' }
		return map[item.status] || '未知状态'
	}

	async function loadList() {
		loading.value = true
		try {
			const res = await request({ url: '/api/aigc/history', method: 'GET', loading: false })
			if (res.code === 200) {
				list.value = res.data || []
			}
		} catch (e) {
			// 静默失败，保留上一次列表
		} finally {
			loading.value = false
			syncTimer()
		}
	}

	// 存在未完成任务时才开启轮询，避免无意义的请求
	function syncTimer() {
		const hasPending = list.value.some(item => item.status === 0 || item.status === 1)
		if (hasPending && !timer) {
			timer = setInterval(refreshPending, 5000)
		} else if (!hasPending && timer) {
			clearInterval(timer)
			timer = null
		}
	}

	async function refreshPending() {
		const pending = list.value.filter(item => item.status === 0 || item.status === 1)
		if (!pending.length) {
			syncTimer()
			return
		}

		for (const item of pending) {
			try {
				const res = await request({ url: `/api/aigc/task/${item.id}`, method: 'GET', loading: false })
				if (res.code === 200) {
					Object.assign(item, res.data)
				}
			} catch (e) {
				// 单个任务查询失败不影响其它任务
			}
		}
		syncTimer()
	}

	function openItem(item) {
		if (item.status !== 2 || !item.url) {
			uni.showToast({ title: statusText(item), icon: 'none' })
			return
		}
		if (item.taskType === 1) {
			uni.previewImage({ urls: [assetUrl(item.url)], current: assetUrl(item.url) })
		}
	}

	function save(item) {
		if (item.taskType !== 1) {
			uni.showToast({ title: '视频请在播放器中长按保存', icon: 'none' })
			return
		}

		// #ifdef H5
		uni.showToast({ title: 'H5 端请长按图片保存', icon: 'none' })
		// #endif

		// #ifndef H5
		uni.downloadFile({
			url: assetUrl(item.url),
			success: ({ statusCode, tempFilePath }) => {
				if (statusCode !== 200) {
					uni.showToast({ title: '下载失败', icon: 'none' })
					return
				}
				uni.saveImageToPhotosAlbum({
					filePath: tempFilePath,
					success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
					fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
				})
			},
			fail: () => uni.showToast({ title: '下载失败', icon: 'none' })
		})
		// #endif
	}

	function remove(item) {
		uni.showModal({
			title: '删除素材',
			content: '删除后不可恢复，确定删除吗？',
			success: async ({ confirm }) => {
				if (!confirm) return
				try {
					const res = await request({
						url: `/api/aigc/task/${item.id}`,
						method: 'DELETE',
						loading: true
					})
					if (res.code === 200) {
						list.value = list.value.filter(row => row.id !== item.id)
						syncTimer()
					}
				} catch (e) {
					uni.showToast({ title: '删除失败', icon: 'none' })
				}
			}
		})
	}

	function stopTimer() {
		if (timer) {
			clearInterval(timer)
			timer = null
		}
	}

	onShow(loadList)
	onHide(stopTimer)
	onUnload(stopTimer)
</script>

<style lang="scss" scoped>
	.aigc {
		min-height: 100vh;
		padding: 24rpx;
		box-sizing: border-box;
		background-color: #f7f8fa;
	}
	.header {
		display: flex;
		flex-direction: column;
		margin-bottom: 24rpx;
		.title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333333;
		}
		.subtitle {
			margin-top: 8rpx;
			font-size: 24rpx;
			color: #8a93a5;
		}
	}
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 180rpx;
		.empty-text {
			font-size: 30rpx;
			color: #666666;
		}
		.empty-tip {
			margin-top: 12rpx;
			font-size: 24rpx;
			color: #a0a7b5;
		}
	}
	.grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.card {
		width: 48.5%;
		margin-bottom: 24rpx;
		border-radius: 16rpx;
		overflow: hidden;
		background-color: #ffffff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
	}
	.media-wrap {
		position: relative;
		width: 100%;
		height: 340rpx;
		background-color: #f0f2f5;
	}
	.media {
		width: 100%;
		height: 100%;
	}
	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.placeholder-text {
		font-size: 24rpx;
		color: #8a93a5;
	}
	.badge {
		position: absolute;
		left: 12rpx;
		top: 12rpx;
		padding: 4rpx 14rpx;
		border-radius: 999rpx;
		font-size: 20rpx;
		color: #ffffff;
		background-color: rgba(0, 0, 0, 0.45);
	}
	.badge-3 {
		background-color: rgba(235, 87, 87, 0.9);
	}
	.caption {
		padding: 16rpx 16rpx 0;
		font-size: 24rpx;
		line-height: 1.5;
		color: #444444;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		padding: 12rpx 16rpx 16rpx;
		.action {
			margin-left: 24rpx;
			font-size: 24rpx;
			color: #42b7fb;
		}
		.danger {
			color: #eb5757;
		}
	}
</style>
