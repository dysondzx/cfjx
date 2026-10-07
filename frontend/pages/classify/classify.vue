<template>
	<view class="classify">
		<Lines></Lines>
		<view class="classify-main">
			<scroll-view scroll-y="true" class="main-left" :style="{height: swiperHeight + 'px'}">
				<view 
					:class="['left-item', {active: currClassifyId === item.id}]" 
					v-for="item in classifiesMenu" 
					:key="item" 
					@tap="clickMenu(item)"
				>
					{{item.name}}
				</view>
			</scroll-view>
			<scroll-view scroll-y="true" class="main-right" :style="{height: swiperHeight + 'px'}">
				<view class="right-section" v-for="(item, index) in rightData" :key="index">
					<view class="right-name">{{item.name}}</view>
					<view class="right-content">
						<view class="right-item" v-for="(subItem, idx) in item.data" :key="idx" @tap="itemTap(subItem)">
							<image class="item-image" :src="subItem.imgUrl" mode='widthFix'></image>
							<view class="item-text">{{subItem.name}}</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<TabBar activeName="classify"/>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import Lines from '@/components/common/Lines.vue'
	import TabBar from '@/components/common/TabBar.vue'
	import $http from '@/common/js/request.js'
	
	const classifiesMenu = ref([])
	const rightData = ref([])
	const currClassifyId = ref(null)
	const swiperHeight = ref(0)
	function getAvailableHeight() {
		const deviceInfo = uni.getDeviceInfo();
		const windowInfo = uni.getWindowInfo();
		const systemInfo = uni.getSystemInfoSync();
		
		let availableHeight = 0;
		
		// 获取运行平台（区分app、小程序、H5）
		const uniPlatform = systemInfo.uniPlatform; // 'app'、'mp-weixin'、'h5'等
		const hostPlatform = systemInfo.hostPlatform; // 也可以使用这个
		
		if (uniPlatform === 'app') {
			// ========== App端 ==========
			// 方法1：使用safeArea（最准确）
			if (windowInfo.safeArea) {
				availableHeight = windowInfo.safeArea.height;
				
				// 如果有底部安全区域，需要扣除
				if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom) {
					availableHeight -= systemInfo.safeAreaInsets.bottom;
				}
			} 
			// 方法2：计算导航栏高度
			else {
				// 获取导航栏高度
				let navigationBarHeight = 0;
				if (deviceInfo.platform === 'ios') {
					navigationBarHeight = 44;
				} else {
					// Android可以通过系统信息判断
					const model = systemInfo.model || '';
					if (model.includes('iPhone') || windowInfo.statusBarHeight > 30) {
						navigationBarHeight = 44; // 全面屏设备
					} else {
						navigationBarHeight = 48;
					}
				}
				availableHeight = windowInfo.windowHeight - navigationBarHeight;
			}
			
		} else if (uniPlatform === 'mp-weixin') {
		// ========== 微信小程序 ==========
		// 微信小程序的windowHeight已经扣除了状态栏和导航栏高度
		// 但可能还包含了原生tabBar的高度（如果使用了原生tabBar）
		// 由于我们使用的是自定义tabBar，需要确保高度计算正确
		
		// 最准确的方法：使用screenHeight减去状态栏和导航栏高度
		const statusBarHeight = windowInfo.statusBarHeight || 0;
		const navBarHeight = 44; // 微信小程序默认导航栏高度
		availableHeight = systemInfo.screenHeight - statusBarHeight - navBarHeight;
		
	} else {
		// ========== 其他端（H5等） ==========
		availableHeight = windowInfo.windowHeight;
	}

	// 计算自定义tabBar的高度
	// 基础高度50px + 底部安全区域
	let tabBarHeight = 50;
	
	// 处理底部安全区域
	if (uniPlatform === 'mp-weixin') {
		// 微信小程序：使用screenHeight - safeArea.bottom
		if (systemInfo.safeArea && systemInfo.safeArea.bottom) {
			tabBarHeight += (systemInfo.screenHeight - systemInfo.safeArea.bottom);
		}
	} else {
		// 其他平台：使用safeAreaInsets.bottom
		if (systemInfo.safeAreaInsets && systemInfo.safeAreaInsets.bottom) {
			tabBarHeight += systemInfo.safeAreaInsets.bottom;
		}
	}
	
	// 扣除自定义tabBar的高度
	availableHeight -= tabBarHeight;
	
	// 确保可用高度不小于0
	if (availableHeight < 0) {
		availableHeight = 0;
	}
	
	return availableHeight;
	}
	//完美解决可用高度问题
	function initHeight() {
		const availableHeight = getAvailableHeight()
		swiperHeight.value = availableHeight
	}
	init()
	
	function init() {
		initHeight()
		getClassifies()
	}
	
	function getClassifies() {
		$http({
			url: '/api/classify/classifies',
			method: 'GET',
		}).then(res => {
			if(res.code === 200) {
				classifiesMenu.value = res.data
				currClassifyId.value = classifiesMenu.value? classifiesMenu.value[0].id: null
				getGoodsListByClassifyId()
			}
		})
	}
	
	function getGoodsListByClassifyId() {
		$http({
			url: '/api/classify/queryGoodsByClassifyId',
			method: 'GET',
			data: {
				classifyId: currClassifyId.value
			}
		}).then(res => {
			if(res.code === 200) {
				rightData.value = res.data
			}
		})
	}
	
	function clickMenu(item) {
		if(currClassifyId.value === item.id) {
			return
		}
		currClassifyId.value = item.id
		getGoodsListByClassifyId()
	}
	
	function itemTap(item) {
		uni.navigateTo({
			url: '/pages/details/details?id='+item.id,		
		})
	}
</script>

<style lang="scss" scoped>
	.classify {
		.classify-main {
			display: flex;
			.main-left {
				width: 180rpx;
				.left-item {
					font-weight: bold;
					font-size: 30rpx;
					height: 100rpx;
					line-height: 98rpx;
					text-align: center;
					background-color: #F0F0F0;
					border-bottom: 2px solid #fff;
					&.active {
						background-color: #fff;
						border-left: 8rpx solid #49BDFB;
					}
				}
			}
			.main-right {
				flex: 1;
				.right-section {
					padding: 20rpx 40rpx;
					position: relative;
					&:nth-child(n + 2) {					
						&::after {
							content: '';
							width: 80%;
							height: 1rpx;
							position: absolute;
							background-color: #ccc;
							left: 50%;
							transform: translateX(-50%);
							top: 0;
						}
					}
					.right-name {
						font-weight: bold;
						font-size: 26rpx;
						height: 80rpx;
						line-height: 80rpx;
					}
					.right-content {
						display: flex;
						flex-wrap: wrap;
						// margin-bottom: -20rpx;
						margin-right: -20rpx;
						.right-item {
							width: 33.33%;
							margin-bottom: 20rpx;
							padding-right: 20rpx;
							.item-image {
								width: 100%;
							}
							.item-text {
								font-size: 24rpx;
								height: 30rpx;
								line-height: 30rpx;
								text-align: center;
							}
						}
					}
				}
			}
		}
	}       
</style>
