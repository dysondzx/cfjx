<template>
	<view class="tab-bar">
		<view class="tab-item" v-for="(item, index) in tabBarList" :key="index" @tap="tabItemClick(item)">
			<view class="item-icon">
				<image class="icon-img" :src="item.selectedIconPath" mode="aspectFit" v-if="activeName === item.name"></image>
				<image class="icon-img" :src="item.iconPath" mode="aspectFit" v-else></image>
			</view>
			<view class="item-text">
				{{item.text}}
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {storeToRefs} from 'pinia'
	import {onLoad} from '@dcloudio/uni-app'
	import {useUserStore} from '@/store/user.js'
	const userStore = useUserStore()
	const {loginStatus} = storeToRefs(userStore)
	const tabBarList = ref([
		{
			"iconPath": "/static/image/tabbar/home.png",
			"selectedIconPath": "/static/image/tabbar/home-selected.png",
			"pagePath": "/pages/index/index",
			"text": "首页",
			"name": "index"
		},
		{
			"iconPath": "/static/image/tabbar/classify.png",
			"selectedIconPath": "/static/image/tabbar/classify-selected.png",
			"pagePath": "/pages/classify/classify",
			"text": "分类",
			"name": "classify"
		},
		{
			"iconPath": "/static/image/tabbar/shopCart.png",
			"selectedIconPath": "/static/image/tabbar/shopCart-selected.png",
			"pagePath": "/pages/shop-cart/shop-cart",
			"text": "购物车",
			"name": "shop-cart"
		},
		{
			"iconPath": "/static/image/tabbar/my.png",
			"selectedIconPath": "/static/image/tabbar/my-selected.png",
			"pagePath": "/pages/my/my",
			"text": "我的",
			"name": "my"
		}
	])
	const props = defineProps({
		activeName: {
			type: String,
			default: 'index'
		}
	})
	function tabItemClick(item) {
		if(item.name === 'shop-cart' || item.name === 'my') {
			if(loginStatus.value) {
				uni.reLaunch({
					url: item.pagePath
				})
				return
			} else {
				uni.reLaunch({
					url: '/pages/login/login'
				})
				return
			}
		}
		uni.reLaunch({
			url: item.pagePath
		})
	}
</script>

<style lang="scss" scoped>
	.tab-bar {
		height: calc(50px + env(safe-area-inset-bottom));
  		padding-bottom: env(safe-area-inset-bottom);
		border-top: 2px solid #E2E2E2;
		background-color: #fff;
		color: #333;
		position: fixed;
		z-index: 9999;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		.tab-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			.item-icon {
				width: 24px;
				height: 24px;
				.icon-img {
					width: 100%;
					height: 100%;
				}
			}
			.item-text {
				margin-top: 8px;
				font-size: 10px;
				line-height: 10px;
			}
		}
	}
</style>