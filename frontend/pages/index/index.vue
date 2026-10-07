<template>
	<view class="index">
		<!-- #ifdef MP-WEIXIN -->
		<view class="nav">
			<view class="iconfont icon-Magnifier"></view>
			<text>晨风精选</text>
			<view class="iconfont icon-xiaoxi"></view>
		</view>
		<!-- #endif -->
		<scroll-view scroll-x="true" class="scroll-top" :scroll-into-view="scrollToIndex">
			<view :id="'index'+index" :class="['scoll-item', {barActive: index === currIndex}]" v-for="(item,index) in topBar" @tap="barClick(index)">
				<text :class="['f-color', {'f-active-color': index === currIndex}]">{{item.name}}</text>
			</view>
		</scroll-view>
		<swiper @change="swiperChange" :current="currIndex" :style="'height: '+ swiperHeight +'px;'">
			<swiper-item v-for="(barData, index) in topBarData" :key="index">
				<scroll-view scroll-y="true" :style="'height: '+ swiperHeight +'px;'" @scrolltolower="loadData">
					<template v-if="barData.data.length > 0">
						<template v-for="item in barData.data">
							<IndexSwiper v-if="item.type==='indexSwiperList'" :dataList="item.data"/>
							<Recommend v-if="item.type==='recommendList'" :dataList="item.data"/>
							<Card v-if="item.type==='card'" :cardTitle="item.title" />
							<CommodityList v-if="item.type==='commodityList'" :dataList="item.data"/>
							<Banner v-if="item.type==='bannerList'" :data="item.imgUrl"/>
							<Icons v-if="item.type==='iconsList'" :dataList="item.data"/>
							<Hot v-if="item.type==='hotList'" :dataList="item.data"/>
							<Shop v-if="item.type==='shopList'" :dataList="item.data"/>
						</template>
						<view class="load-text">
							{{loadText}}
						</view>
					</template>
					<view v-else>暂无数据</view>
				</scroll-view>				
			</swiper-item>
		</swiper>
		<TabBar activeName="index"/>
	</view>
</template>

<script setup>
	import IndexSwiper from '@/components/index/Swiper.vue'
	import Recommend from '@/components/index/Recommend.vue'
	import Card from '@/components/common/Card.vue'
	import CommodityList from '@/components/common/CommodityList.vue'
	import Banner from '@/components/index/Banner.vue'
	import Icons from '@/components/index/Icons.vue'
	import Hot from '@/components/index/Hot.vue'
	import Shop from '@/components/index/Shop.vue'
	import TabBar from '@/components/common/TabBar.vue'
	import {ref, computed, } from 'vue'
	import { onReady, onNavigationBarButtonTap  } from '@dcloudio/uni-app'
	import request from '@/common/js/request.js'
		
	const topBar = ref([])
	const topBarData = ref([])
	const currIndex = ref(0)
	const swiperHeight = ref(0)
	const scrollToIndex = computed(() => 'index' + currIndex.value)
	const loadText = ref('下拉加载更多数据')

	onNavigationBarButtonTap(e => {
		if(e.index === 0) { // 左侧的商品搜索按钮
			uni.navigateTo({
				url: '/pages/search/search'
			})
		}
	}) 
	const barClick = index => {
		currIndex.value = index
	}
	const swiperChange = e => {
		currIndex.value = e.detail.current
		// tobBar切换时，如果当前tab分页号为0，说明还没有获取过数据，则请求一页数据。否则不获取，等待用户下拉后再加载
		if(topBarData.value[currIndex.value].currPageNum === 0) {
			getTopbarData(topBar.value[currIndex.value].id, topBarData.value[currIndex.value].currPageNum+1)
		}
	}
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
			// 微信小程序的windowHeight已经处理了原生导航栏
			
			// 如果你使用了自定义导航栏，windowHeight是不包含它的，要减去
			// .nav导航栏的 margin-top: var(--status-bar-height); 其中--status-bar-height 单位是px - 这是一个固定的像素值，在微信小程序中通常设置为25p
			const customNavHeight = uni.upx2px(180) + 25;
			availableHeight = windowInfo.windowHeight - customNavHeight; 
			
		} else {
			// ========== 其他端（H5等） ==========
			availableHeight = windowInfo.windowHeight;
		}

		// tabBar采用自定义了，getAvailableHeight()返回的高度中包含了batBar高度；如果采用原生tarBar，则getAvailableHeight()已经扣除了原生tarBar高度，就不需要再减去tarBar高度了
		const tabBarHeight = 50 + (systemInfo.safeAreaInsets?.bottom || 0);
        availableHeight -= tabBarHeight;
		
		return availableHeight;
	}
	//完美解决可用高度问题
	function initHeight() {
		const availableHeight = getAvailableHeight();
		// scoll-item的高度： height: 40rpx;  padding: 6rpx 10rpx; border-bottom: 6rpx solid #42B7FB;
		swiperHeight.value = availableHeight - uni.upx2px(40 + 6 * 2 + 6)
		
	}
	init()
	function init() {
		initHeight()
		getTopBar().then(() => {
			getTopbarData(topBar.value[currIndex.value].id, topBarData.value[currIndex.value].currPageNum+1)
		})
	}
	function getTopBar() {
		return request({
			url: '/api/index_list/top_bar',
		}).then(res => {
			topBar.value = res.data
			topBarData.value = Array.from({length: topBar.value.length}, () => ({currPageNum: 0, data: []}))
		})
	}
	function loadData() {
		getTopbarData(topBar.value[currIndex.value].id, topBarData.value[currIndex.value].currPageNum+1)
	}
	function getTopbarData(id, pageNum) {
		loadText.value='加载中...'
		request({
			url: `/api/index_list/${id}/data/${pageNum}`,
		}).then(res => {
			if(res.code == 200) {
				topBarData.value[currIndex.value].currPageNum = pageNum
				topBarData.value[currIndex.value].data = [...topBarData.value[currIndex.value].data, ...res.data]
				loadText.value='下拉加载更多数据'
			} else {
				console.error('数据获取出错')
			}
		})
	}
</script>

<style lang="scss" scoped>
/* 	.status-height {
		height: var(--status-bar-height);
		width: 100%;
	} */
	.nav {
		text-align: center;
		width: 100%;
		height: 170rpx;
		line-height: 170rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: var(--status-bar-height);
		text {
			margin: 0 70rpx;
		}
	}
	
	.scroll-top {
		white-space: nowrap;
	}
	.scoll-item {
		display: inline-block;
		font-size: 32rpx;
		text-align: center;
		height: 58rpx;
		line-height: 40rpx;
		padding: 6rpx 10rpx;
		border-bottom: 6rpx solid transparent;
		&.barActive {
			border-bottom: 6rpx solid #42B7FB;	
		}
	}
	.load-text {
		height: 40rpx;
		line-height: 40rpx;
		font-size: 25rpx;
		text-align: center;
	}
	
</style>
