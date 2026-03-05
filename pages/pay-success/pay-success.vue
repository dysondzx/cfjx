<template>
	<view class="pay-success">
		<!-- 成功图标区域 -->
		<view class="success-header">
			<view class="success-icon">
				<view class="iconfont icon-zhifuchenggong"></view>
			</view>
			<view class="success-title">支付成功</view>
			<view class="success-desc">感谢您的购买，订单已支付成功</view>
		</view>
		
		<!-- 订单信息 -->
		<view class="order-info">
			<view class="info-item">
				<text class="info-label">订单编号：</text>
				<text class="info-value">202312150001</text>
			</view>
			<view class="info-item">
				<text class="info-label">支付金额：</text>
				<text class="info-value price">¥159.00</text>
			</view>
			<view class="info-item">
				<text class="info-label">支付方式：</text>
				<text class="info-value">微信支付</text>
			</view>
			<view class="info-item">
				<text class="info-label">支付时间：</text>
				<text class="info-value">2023-12-15 14:30:25</text>
			</view>
		</view>
		
		<!-- 按钮区域 -->
		<view class="button-group">
			<view class="btn btn-primary" @click="goToOrderDetail">
				查看订单
			</view>
			<view class="btn btn-secondary" @click="goToHome">
				返回首页
			</view>
		</view>
		
		<!-- 温馨提示 -->
		<view class="tips">
			<view class="tips-title">温馨提示</view>
			<view class="tips-content">
				<text>• 订单预计1-3个工作日内发货</text>
				<text>• 发货后会有短信通知，请注意查收</text>
				<text>• 如有疑问，请联系客服：400-123-4567</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	
	onLoad((e) => {
		console.log(e);
	})
	
	/**
	 * 跳转到订单详情页
	 */
	const goToOrderDetail = () => {
		uni.navigateTo({
			url: '/pages/my-order/my-order'
		})
	}
	
	/**
	 * 返回首页
	 */
	const goToHome = () => {
		uni.reLaunch({
			url: '/pages/index/index'
		})
	}
</script>

<style lang="scss" scoped>
	.pay-success {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding: 0 30rpx;
		
		/* 成功图标区域 */
		.success-header {
			text-align: center;
			padding: 80rpx 0 60rpx;
			background-color: #ffffff;
			border-radius: 16rpx;
			margin-top: 40rpx;
			
			.success-icon {
				margin-bottom: 30rpx;
				
				.iconfont {
					font-size: 120rpx;
					color: #07C160;
				}
			}
			
			.success-title {
				font-size: 48rpx;
				font-weight: bold;
				color: #333333;
				margin-bottom: 20rpx;
			}
			
			.success-desc {
				font-size: 28rpx;
				color: #666666;
			}
		}
		
		/* 订单信息 */
		.order-info {
			background-color: #ffffff;
			border-radius: 16rpx;
			padding: 40rpx 30rpx;
			margin-top: 30rpx;
			
			.info-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 24rpx;
				
				&:last-child {
					margin-bottom: 0;
				}
				
				.info-label {
					font-size: 28rpx;
					color: #666666;
					flex-shrink: 0;
				}
				
				.info-value {
					font-size: 28rpx;
					color: #333333;
					text-align: right;
					
					&.price {
						font-weight: bold;
						color: #ff3b30;
					}
				}
			}
		}
		
		/* 按钮区域 */
		.button-group {
			display: flex;
			justify-content: space-between;
			margin-top: 60rpx;
			
			.btn {
				flex: 1;
				height: 88rpx;
				border-radius: 44rpx;
				font-size: 32rpx;
				font-weight: 500;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&.btn-primary {
					background-color: #007AFF;
					color: #ffffff;
					margin-right: 20rpx;
				}
				
				&.btn-secondary {
					background-color: #ffffff;
					color: #007AFF;
					border: 1rpx solid #007AFF;
					margin-left: 20rpx;
				}
			}
		}
		
		/* 温馨提示 */
		.tips {
			background-color: #ffffff;
			border-radius: 16rpx;
			padding: 30rpx;
			margin-top: 40rpx;
			
			.tips-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
				margin-bottom: 20rpx;
			}
			
			.tips-content {
				display: flex;
				flex-direction: column;
				
				text {
					font-size: 26rpx;
					color: #666666;
					line-height: 1.6;
					margin-bottom: 12rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
				}
			}
		}
	}
	
	/* 成功图标样式 */
	.icon-success:before {
		content: "\e601";
	}
</style>
