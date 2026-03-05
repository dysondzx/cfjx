<template>
	<view class="my-config">
		<!-- 账号设置标题 -->
		<view class="config-header">
			<view class="header-title">账号设置</view>
		</view>
		
		<!-- 功能项列表 -->
		<view class="config-list">
			<view class="list-item">
				<text class="item-text">修改密码</text>
			</view>
			<view class="list-item">
				<text class="item-text">绑定手机号码</text>
			</view>
			<view class="list-item" @tap="goToAddressMgr">
				<text class="item-text">地址管理</text>
				<text class="iconfont icon-gengduo"></text>
			</view>
			<view class="list-item">
				<text class="item-text">绑定第三方账号</text>
			</view>
		</view>
		<view class="config-footer" @tap="logout">
			退出
		</view>
	</view>
</template>

<script setup>
	import {useUserStore} from '@/store/user.js'
	const userStore = useUserStore()

	function goToAddressMgr() {
		uni.navigateTo({
			url: '/pages/my-address-mgr/my-address-mgr'
		});
	}
	function logout() {
		userStore.logout()
		uni.reLaunch({
			url: '/pages/login/login',
		})
	}
</script>

<style lang="scss" scoped>
	.my-config {
		background-color: #f5f5f5;
		min-height: 100vh;
		
		// 标题样式
		.config-header {
			background-color: #fff;
			padding: 0 30rpx;
    		margin-top: 30rpx;
			.header-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
				height: 70rpx;
				line-height: 58rpx;
				padding-bottom: 10rpx;
				border-bottom: 2rpx solid #CECECE;
			}
		}
		
		// 功能列表样式
		.config-list {
			background-color: #fff;
			padding: 0 30rpx;
			.list-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 30rpx 0;
				border-bottom: 1rpx solid #e4e4e4;
				.item-text {
					font-size: 30rpx;
					color: #333;
				}
				.icon-gengduo {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.config-footer {
			position: fixed;
			bottom: 50rpx;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 30rpx 0;
			font-size: 30rpx;
			color: #fff;
			background-color: #42B7FB;
		}
	}
</style>
