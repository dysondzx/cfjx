<template>
	<view class="my">
		<!-- 顶部header部分 -->
		<view class="header" style="background: url(/static/image/my/mybg.png)">
			<!-- 设置图标 -->
			<view class="header-left" @tap="goToConfig">
				<image src="/static/image/my/config.png" class="config-icon" mode="aspectFit"></image>
			</view>
			
			<!-- 中间用户信息 -->
			<view class="header-center">
				<image :src="loginStatus && userInfo && userInfo.avatar? userInfo.avatar :'/static/image/common/logo.png'" class="avatar" mode="aspectFit"></image>
				<text class="username">{{loginStatus? userInfo.nickname: '暂无昵称'}}</text>
			</view>
			
			<!-- 消息图标 -->
			<view class="header-right">
				<view class="message-icon">
					<text class="iconfont icon-xiaoxi"></text>
					<view class="message-badge">3</view>
				</view>
			</view>
		</view>
		<view class="orders">
			<view class="orders-title">
				<text class="title-left">我的订单</text>
				<text class="title-right" @tap="goToMyOrder">全部订单 <text class="iconfont icon-gengduo"></text></text>
			</view>
			<view class="orders-list">
				<view class="orders-item">
					<image src="/static/image/my/order1.png" class="order-image" mode="aspectFit"></image>
					<text class="order-name">待付款</text>
				</view>
				<view class="orders-item">
					<image src="/static/image/my/order2.png" class="order-image" mode="aspectFit"></image>
					<text class="order-name">待发货</text>
				</view>
				<view class="orders-item">
					<image src="/static/image/my/order3.png" class="order-image" mode="aspectFit"></image>
					<text class="order-name">待收货</text>
				</view>
				<view class="orders-item">
					<image src="/static/image/my/order4.png" class="order-image" mode="aspectFit"></image>
					<text class="order-name">待评价</text>
				</view>
				<view class="orders-item">
					<image src="/static/image/my/order5.png" class="order-image" mode="aspectFit"></image>
					<text class="order-name">退款管理</text>
				</view>
			</view>
		</view>
		<view class="my-other">
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">♡</text>
					<text class="item-name">我的收藏</text>
				</view>
				<view class="item-right">
					<text class="item-count">1</text>
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">💳</text>
					<text class="item-name">我的优惠券</text>
				</view>
				<view class="item-right">
					<text class="item-count">0</text>
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">💯</text>
					<text class="item-name">我的积分</text>
				</view>
				<view class="item-right">
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">🌟</text>
					<text class="item-name">加入超级VIP</text>
				</view>
				<view class="item-right">
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">❓</text>
					<text class="item-name">帮助中心</text>
				</view>
				<view class="item-right">
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">🎧</text>
					<text class="item-name">联系客服</text>
				</view>
				<view class="item-right">
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
			<view class="other-item">
				<view class="item-left">
					<text class="item-icon">🏪</text>
					<text class="item-name">商家入驻</text>
				</view>
				<view class="item-right">
					<text class="iconfont icon-gengduo"></text>
				</view>
			</view>
		</view>
		<TabBar activeName="my"/>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {storeToRefs} from 'pinia'
	import {useUserStore} from '@/store/user.js'
	import TabBar from '@/components/common/TabBar.vue'
	
	const userStore = useUserStore()
	const {userInfo, loginStatus} = storeToRefs(userStore)
	console.log('loginStatus.value:', loginStatus.value);
	console.log('userInfo.value:', userInfo.value);
	function goToConfig() {
		uni.navigateTo({
			url: '/pages/my-config/my-config'
		});
	}
	function goToMyOrder() {
		uni.navigateTo({
			url: '/pages/my-order/my-order'
		});
	}
	function goLogin() {
		uni.navigateTo({
			url: '/pages/login/login'
		})
	}
</script>

<style lang="scss" scoped>
	.my {
		width: 100%;
		height: 100vh;
		background-color: #F0F0F0;
	}
	// 顶部header样式
	.header {
		width: 100%;
		height: 400rpx;
		background-size: cover;
		background-position: center;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 150rpx 30rpx 0;
		box-sizing: border-box;
		
		// 左侧设置图标
		.header-left {
			width: 40rpx;
			height: 40rpx;
			.config-icon {
				width: 100%;
				height: 100%;
			}
		}
		
		// 中间用户信息
		.header-center {
			display: flex;
			flex-direction: column;
			align-items: center;
			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 50%;
				border: 4rpx solid rgba(255, 255, 255, 0.8);
			}
			
			.username {
				color: #fff;
				font-size: 32rpx;
				margin-top: 20rpx;
				text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
			}
		}
		
		// 右侧消息图标
		.header-right {
			.message-icon {
				position: relative;
				
				.iconfont {
					color: #fff;
					font-size: 40rpx;
					text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
				}
				
				.message-badge {
					position: absolute;
					top: -10rpx;
					right: -10rpx;
					width: 30rpx;
					height: 30rpx;
					background-color: #ff4d4f;
					color: #fff;
					font-size: 20rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}
	.orders {
		width: 100%;
		background-color: #fff;
		padding-bottom: 20rpx;
		.orders-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 30rpx 0;
			font-size: 32rpx;
			color: #333;
			.title-left {
				font-weight: 600;
			}
			.title-right {
				font-size: 26rpx;
				color: #999;
				line-height: 26rpx;
				height: 26rpx;
				font-weight: 600;
				.iconfont {
					font-size: 20rpx;
					line-height: 26rpx;
				}
			}
		}
		.orders-list {
			display: flex;
			align-items: center;
			justify-content: space-around;
			padding: 30rpx 0;
			.orders-item {
				flex: 1;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				.order-image {
					width: 60rpx;
					height: 60rpx;
				}
				.order-name {
					font-size: 26rpx;
					color: #333;
					margin-top: 15rpx;
				}
			}
		}
	}

	// 其他功能项样式
	.my-other {
		margin-top: 20rpx;
		background-color: #fff;
		.other-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx;
			border-bottom: 1rpx solid #f0f0f0;
			.item-left {
				display: flex;
				align-items: center;
				.item-icon {
					font-size: 32rpx;
					margin-right: 20rpx;
					width: 50rpx;
				}
				// 根据不同功能设置不同颜色
				&:nth-child(1) .item-icon {
					color: #ff4d4f;
				}
				&:nth-child(2) .item-icon {
					color: #faad14;
				}
				&:nth-child(3) .item-icon {
					color: #faad14;
				}
				&:nth-child(4) .item-icon {
					color: #faad14;
				}
				&:nth-child(5) .item-icon {
					color: #1890ff;
				}
				&:nth-child(6) .item-icon {
					color: #9254de;
				}
				&:nth-child(7) .item-icon {
					color: #fa8c16;
				}
				.item-name {
					font-size: 30rpx;
					color: #333;
				}
			}
			.item-right {
				display: flex;
				align-items: center;
				.item-count {
					font-size: 28rpx;
					color: #999;
					margin-right: 10rpx;
				}
				.iconfont {
					font-size: 24rpx;
					color: #999;
				}
			}
		}
	}
</style>
