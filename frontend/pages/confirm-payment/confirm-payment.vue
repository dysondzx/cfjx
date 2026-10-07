<template>
	<view class="confirm-payment">
		<uni-nav-bar title="确认支付" leftText="关闭" @clickLeft="close" :statusBar="true" />
		<view class="payment-box">
			<radio-group @change="onPayTypeChange">
				<!-- #ifndef MP-WEIXIN -->
				<view class="payment-item">
					<view class="payment-item-left">
						<view class="item-icon">					
							<image class="item-img" src="/static/image/common/zfb.png" mode="aspectFit"></image>
						</view>
						<view class="item-desc">
							<view class="item-desc-top">
								支付宝支付
							</view>
							<view class="item-desc-bottom">
								推荐支付宝用户使用
							</view>
						</view>
					</view>
					<view class="payment-item-right">
						<label class="radio">
							<radio :value="1" class="pay-type-check" />
						</label>
					</view>
				</view>
				<Lines />
				<!-- #endif -->
				<view class="payment-item">
					<view class="payment-item-left">
						<view class="item-icon">					
							<image class="item-img" src="/static/image/common/wxf.png" mode="aspectFit"></image>
						</view>
						<view class="item-desc">
							<view class="item-desc-top">
								微信支付
							</view>
							<view class="item-desc-bottom">
								推荐有微信账户的用户使用
							</view>
						</view>
					</view>
					<view class="payment-item-right">
						<label class="radio">
							<radio :value="2" class="pay-type-check" />
						</label>
					</view>
				</view>
				<Lines />
			</radio-group>
		</view>
		<view class="payment-footer">
			<view class="footer-left">
				合计 <text style="color: #fff; font-size: 34rpx;margin-left: 30rpx;">¥{{ payAmount }}</text>
			</view>
			<view class="footer-right" @tap="toPay">
				去支付
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onUnload } from '@dcloudio/uni-app'
	import Lines from '@/components/common/Lines.vue'
	import $http from '@/common/js/request.js'
	const orderId = ref(null)
	const orderNo = ref('')
	const payAmount = ref(null)
	const payType = ref(null)
	const onPayTypeChange = (e) => {
		payType.value = e.detail.value
	}
	const close = () => {
		uni.navigateBack({
			delta: 1
		})
	}
	async function toPay() {
		if (!payType.value) {
			uni.showToast({
				title: '请选择支付方式',
				icon: 'none'
			})
			return
		}
		
		// 微信支付沙箱申请比较麻烦，这里直接跳转到支付成功页面
		if(payType.value == 2) {
			// 跳转到支付成功页面
			uni.navigateTo({
				url: '/pages/pay-success/pay-success'
			})
			return
		}
		
		try {
			const res = await $http({
				url: '/api/payment/create',
				method: 'POST',
				data: {
					orderNo: orderNo.value,
					payAmount: payAmount.value
				}
			})
			
			if (res.code === 0) {
				console.log('创建支付成功:', res.data);
				
				// 根据平台处理支付
				if (uni.getSystemInfoSync().platform === 'android' || 
					uni.getSystemInfoSync().platform === 'ios') {
					// App环境：打开支付宝支付
					plus.runtime.openURL(res.data.payUrl, (result) => {
						console.log('打开支付宝结果:', result);
					})
					
					// 开始轮询支付结果
					startPollingPaymentStatus(res.data.paymentNo);
				} else {
					// 微信小程序环境：显示支付链接（用户需要手动扫码）
					uni.showModal({
						title: '支付宝支付',
						content: '请复制以下链接到支付宝完成支付：\n\n' + res.data.payUrl,
						showCancel: false,
						confirmText: '复制链接'
					})
					
					// 开始轮询支付结果
					startPollingPaymentStatus(res.data.paymentNo);
				}
			} else {
				console.log('res.message:', res.message);
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('支付失败:', error)
			uni.showToast({
				title: '支付失败，请重试',
				icon: 'none'
			})
		}
	}
	
	// 轮询支付状态
	let pollingTimer = null
	function startPollingPaymentStatus(paymentNo) {
		// 停止之前的轮询
		if (pollingTimer) {
			clearInterval(pollingTimer)
		}
		
		pollingTimer = setInterval(async () => {
			try {
				const res = await $http({
					url: '/api/payment/queryByOrderNo',
					method: 'GET',
					data: {
						out_trade_no: paymentNo
					}
				})
				
				if (res.code === 200) {
					
					// 根据支付宝返回的交易状态判断
					if (res.data.trade_status === 'TRADE_SUCCESS' || res.data.trade_status === 'TRADE_FINISHED') {
						// 支付成功
						clearInterval(pollingTimer)
						uni.showToast({
							title: '支付成功',
							icon: 'success'
						})
						
						// 跳转到支付成功页面
						uni.navigateTo({
							url: '/pages/pay-success/pay-success?paymentNo=' + paymentNo
						})
						
					} else if (res.data.trade_status === 'TRADE_CLOSED') {
						// 支付关闭/失败
						clearInterval(pollingTimer)
						uni.showToast({
							title: '支付失败',
							icon: 'none'
						})
					} else if (res.data.trade_status === 'WAIT_BUYER_PAY') {
						// 等待支付，继续轮询
						console.log('等待用户支付中...');
					} else {
						// 其他状态
						console.log('支付状态:', res.data.trade_status);
					}
				}
			} catch (error) {
				console.error('查询支付状态失败:', error)
			}
		}, 3000) // 每3秒查询一次
		
		// 设置超时，5分钟后停止轮询
		setTimeout(() => {
			if (pollingTimer) {
				clearInterval(pollingTimer)
				uni.showToast({
					title: '支付超时，请重新支付',
					icon: 'none'
				})
			}
		}, 5 * 60 * 1000)
	}
	onLoad(e => {
		orderId.value = e.orderId
		orderNo.value = e.orderNo
		payAmount.value = e.payAmount
	})
	onUnload(() => {
		if (pollingTimer) {
			clearInterval(pollingTimer)
		}
	})
</script>

<style lang="scss" scoped>
	.confirm-payment {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100vh;
		background-color: #fff;
		.payment-box {
			padding: 30rpx;
			.payment-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				.payment-item-left {
					flex: 1;
					display: flex;
					justify-content: flex-start;
					align-items: center;
					.item-icon {
						width: 140rpx;
						text-align: center;
						margin-right: 20rpx;
						.item-img {
							width: 100rpx;
							height: 100rpx;
							
						}
					}
					.item-desc {
						font-size: 30rpx;
						text-align: left;
						line-height: 40rpx;
						.item-desc-top {
							color: #000;
						}
						.item-desc-bottom {
							color: #8A8A8A;
						}
					}
				}
				.payment-item-right {
					width: 60rpx;
					text-align: center;
					.pay-type-check {
						transform: scale(0.9);
					}
				}
			}
		}
		.payment-footer {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;	
			display: flex;
			padding-bottom: 60rpx;
			line-height: 100rpx;
			font-size: 30rpx;
			.footer-left {
				flex: 1;
				height: 100rpx;
				background-color: #171717;
				padding: 0 30rpx;
				color: #aaa;
			}
			.footer-right {
				padding: 0 60rpx;
				color: #fff;
				background-color: #42B7FB;
				height: 100rpx;
			}
		}
	}       
</style>
