<template>
	<view class="search">
		<Lines></Lines>
		<view class="hot-item">
			<view class="item-header">
				<text class="f-color">最近搜索</text>
				<i class="iconfont icon-lajitong" @tap="clearHistory"></i>
			</view>
			<view class="item-body">
				<view class="body-item" 
				v-for="(item, index) in searchHistory" 
				:key="index" @tap="search(item)">{{item}}</view>
			</view>
		</view>
		<view class="hot-item">
			<view class="item-header">
				<text class="f-color">热门搜索</text>
			</view>
			<view class="item-body">
				<view class="body-item" v-for="(item, index) in hotSearch" :key="index" @tap="search(item)">{{item}}</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import Lines from '@/components/common/Lines.vue'
	
	import {onNavigationBarButtonTap, 
			onNavigationBarSearchInputConfirmed, 
			onNavigationBarSearchInputChanged,
			onLoad
		} from '@dcloudio/uni-app'
	
	const text = ref('')
	const searchHistory = ref([])
	
	const hotSearch = ref(['nike', 'adidas', '面膜', 'coach', '四件套', '自营', '施华洛世奇', 'MK'])
	onNavigationBarSearchInputChanged(e => {
		text.value = e.text
	})
	onLoad(() => {
		uni.getStorage({
			key: 'searchData',
			success: res => {
				searchHistory.value = res.data || []
			}
		})
	})
	const search = (param) => {
		text.value = param
		addHistoryKeyword()
		fillSearchInput(text.value)
	}
	function fillSearchInput(param) {
		// #ifdef APP-PLUS 
			const pages = getCurrentPages()
			const currPage = pages[pages.length - 1]
			const webview = currPage.$getAppWebview()
			webview.setTitleNViewSearchInputText(param)
		// #endif
	}
	const clearHistory = () => {
		uni.showModal({
			title: '提醒',
			content: '确认要清除搜索历史吗？',
			confirmText: 'yes',
			cancelText: 'no',
			success: res => {
				console.log('res:', res);
				if(res.confirm) {					
					searchHistory.value = []
					uni.removeStorage({
						key: 'searchData'
					})
				}
			}
		})
	}
	const addHistoryKeyword = () => {
		const index = searchHistory.value.indexOf(text.value)
		if(index === -1) {
			searchHistory.value.unshift(text.value)
		} else {
			searchHistory.value.unshift(...searchHistory.value.splice(index, 1))
		}
		uni.setStorage({
			key: 'searchData',
			data: searchHistory.value,
		})
	}
	onNavigationBarButtonTap(e => {
		if (e.index === 0) {
			if(!text.value) {
				uni.showToast({
					title: '请输入搜索内容！',
					icon: 'none'
				})
				return
			}
			addHistoryKeyword()
			uni.hideKeyboard()
			uni.navigateTo({
				url: '/pages/search-list/search-list?keywords='+text.value
			})
		}
	})
	
	onNavigationBarSearchInputConfirmed(e => {
		if(!text.value) {
			uni.showToast({
				title: '请输入搜索内容！',
				icon: 'none'
			})
			return
		}
		addHistoryKeyword()
		uni.hideKeyboard()
		uni.navigateTo({
			url: '/pages/search-list/search-list?keywords='+text.value
		})
	})
</script>

<style lang="scss" scoped>
	.hot-item {
		margin: 20rpx 30rpx;
		.item-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: 50rpx;
			margin-bottom: 20rpx;
			.f-color {
				font-size: 32rpx;
				line-height: 50rpx;
			}
			.iconfont {
				font-size: 40rpx !important;
				line-height: 50rpx;
			}
		}
		
		/* 使用flexbox实现网格布局 */
		.item-body {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			align-content: flex-start;
			
			/* 移除左侧padding，确保与标题对齐 */
			padding: 0;
			
			/* 使用负margin抵消最后一行的margin-bottom，避免与下方元素产生间距 */
			margin-bottom: -20rpx;
			
			.body-item {
				/* 标签样式 */
				padding: 0 32rpx;
				height: 68rpx;
				line-height: 68rpx;
				font-size: 28rpx;
				color: #333333;
				background-color: #F5F5F5;
				border-radius: 34rpx;
				
				/* 外边距 - 实现网格间距，仅设置右侧和底部margin */
				/* 左侧margin为0确保与标题对齐 */
				margin-right: 20rpx;
				margin-bottom: 20rpx;
				
				/* 确保标签不会被压缩 */
				flex-shrink: 0;
				
				/* 文本不换行 */
				white-space: nowrap;
				
				/* 点击效果 */
				transition: background-color 0.2s;
				
				&:active {
					background-color: #E8E8E8;
				}
			}
		}
	}       
</style>
