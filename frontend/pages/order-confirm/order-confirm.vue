<template>
	<view class="order-confirm">
		<view class="order-address">
			<view class="address-content" v-if="selectedAddress" @tap="toSelectAddress">
				<view class="iconfont icon-address address-icon"></view>
				<view class="address-info">
					<view class="receiver-info">
						<text class="receiver-name">收货人：{{selectedAddress.receiverName}}</text>
						<text class="receiver-phone">{{selectedAddress.receiverPhone}}</text>
					</view>
					<view class="address-detail">
						<text class="address-label">收货地址：</text>
						<text class="address-text">{{selectedAddress.province + selectedAddress.city + selectedAddress.area}}{{selectedAddress.fullAddress}}</text>
					</view>
				</view>
				<view class="iconfont icon-gengduo address-arrow"></view>
			</view>
			<view class="select-address" v-else @tap="toSelectAddress">
				<text class="select-address-label">请选择收货地址</text>
				<view class="iconfont icon-gengduo address-arrow"></view>
			</view>
			<view class="address-stripe"></view>
		</view>
		<view class="order-content">
			<view class="shop-item" v-for="(item, index) in orderList" :key="item.id">
				<!-- 店铺名称 -->
				<view class="shop-header">
					<view class="shop-header-left">
						<text class="shop-name">{{item.shopName}}</text>
						<text class="shop-icon iconfont icon-xiaoxi"></text>							
					</view>
				</view>
				
				<!-- 商品列表 -->
				<view class="shop-goods">
					<!-- 商品1 -->
					<view class="goods-item" v-for="(gItem, gIndex) in item.shopGoods" :key="gItem.id">
						<image :src="gItem.imgUrl" mode="aspectFill" class="goods-image"></image>
						<view class="goods-info">
							<view class="goods-name">{{gItem.name}}</view>
							<view class="goods-spec">{{gItem.goodsSpec}}</view>
							<view class="goods-promise f-active-color">七天无理由</view>
						</view>
						<view class="goods-buy">
							<view class="goods-price">
								¥{{gItem.cprice}}
							</view>
							<text class="goods-count">x{{gItem.num}}</text>									
						</view>
					</view>				
				</view>
				
				<view class="shop-other">
					<view class="other-item other-freight">
						<view class="other-item-label">
							运费
						</view>
						<view class="other-item-value">
							¥0.00
						</view>
					</view>
					<Lines />
					<view class="other-item other-freight">
						<view class="other-item-label">
							留言:
						</view>
						<input class="other-item-input" type="text" placeholder="给卖家的留言，140字以内" maxlength="140" v-model="item.buyerMessage">
					</view>
					<Lines />
					<view class="other-sum">
						共{{item.shopGoods.reduce((count, _) => {
							return count += _.num
						}, 0)}}件商品 &nbsp; 小计: <text class="f-active-color" style="font-size: 34rpx">¥{{item.shopGoods.reduce((sum, _) => {
							return sum += _.cprice * _.num
						}, 0)}}</text>
					</view>
				</view>
			</view>
			<view class="category-footer">
				<view class="total-sum">
					合计：<text class="f-active-color" style="font-size: 34rpx">¥{{totalSum}}</text>
				</view>
				<view class="submit" @tap="goConfirmPayment">
					提交订单
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref, computed} from 'vue'
	import {onLoad, onUnload} from '@dcloudio/uni-app'
	import Lines from '@/components/common/Lines.vue'
	import {useAddressStore} from '@/store/address.js'
	import $http from '@/common/js/request.js'
	const selectedAddress = ref(null)
	const store = useAddressStore()
	const orderList = ref([])
	const totalSum = computed(() => {
		let sum = 0
		orderList.value.forEach(shop => {
			shop.shopGoods.forEach(good => {
				sum += good.num * good.cprice
			})
		})
		return sum
	})
	
	function toSelectAddress() {
		uni.navigateTo({
			url: '/pages/my-address-mgr/my-address-mgr?source=order-confirm'
		})
	}
	function goConfirmPayment() {
		if(!selectedAddress.value) {
			uni.showToast({
				title: '请选择收货地址',
				icon: 'none'
			})
			return
		}
		
		// 构建商品数据，包含每个店铺的留言
		const goods = []
		orderList.value.forEach(shop => {
			shop.shopGoods.forEach((good, gIndex) => {
				const goodInfo = {
					goodId: good.id,
					quantity: good.num,
				}
				if(gIndex === 0) {
					goodInfo.buyerMessage = shop.buyerMessage || '' // 使用店铺级别的留言
				}
				goods.push(goodInfo)
			})
		})
		
		$http({
			url: '/api/order/create',
			method: 'POST',
			data: {
				addressId: selectedAddress.value.id,
				goods: goods
			}
		}).then(res => {
			if(res.code === 200) {
				// 订单创建成功，跳转到支付页面
				uni.navigateTo({
					url: `/pages/confirm-payment/confirm-payment?orderId=${res.data.orderId}&orderNo=${res.data.orderNo}&payAmount=${res.data.payAmount}`
				})
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		}).catch(error => {
			console.error('创建订单失败:', error)
			uni.showToast({
				title: '创建订单失败，请重试',
				icon: 'none'
			})
		})
	}
	function getOrderGoods(goodIds) {
		$http({
			url: '/api/cart/list',
			method: 'GET',
			data: {
				goodIds
			}
		}).then(res => {
			if(res.code === 200) {
				const cartList = res.data
				orderList.value = cartList
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	function getDefaultAddress() {
		const addressList = store.list.value
		if(addressList && addressList.length > 0) {
			const defaultAddresses = store.getDefaultAddresses()
			if(defaultAddresses && defaultAddresses.length > 0) {
				selectedAddress.value = defaultAddresses[0]
			}	
		} else {
			$http({
				url: '/api/address/list',
				method: 'GET'
			}).then(res => {
				if(res.code === 200) {
					store.setList(res.data)
					const defaultAddresses = store.getDefaultAddresses()
					if(defaultAddresses && defaultAddresses.length > 0) {
						selectedAddress.value = defaultAddresses[0]
					}
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none'
					})
				}
			})
		}
	}
	onLoad((e) => {
		const goodIds = e.goodIds
		getOrderGoods(goodIds)
		getDefaultAddress()
		uni.$on('selectedData', data => {
			selectedAddress.value = data
		})
	})
	onUnload(() => {
		console.log('order-confirm onUnload');
		uni.$off('selectedData')
	})
</script>

<style lang="scss" scoped>
	.order-confirm {
		background-color: #ECECEC;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		
		.order-address {		
			border-radius: 10rpx;
			overflow: hidden;
			background-color: #fff;
			margin-top: 10rpx;
			
			.address-content {
				display: flex;
				align-items: center;
				padding: 30rpx;			
				
				.address-icon {
					font-size: 40rpx;
					color: #1989fa;
					margin-right: 20rpx;
					margin-top: 5rpx;
				}
				
				.address-info {
					flex: 1;
					
					.receiver-info {
						display: flex;
						justify-content: space-between;
						margin-bottom: 20rpx;
						
						.receiver-name {
							font-size: 32rpx;
							color: #333;
							font-weight: 500;
						}
						
						.receiver-phone {
							font-size: 32rpx;
							color: #333;
						}
					}
					
					.address-detail {
						display: flex;
						
						.address-label {
							font-size: 28rpx;
							color: #666;
						}
						
						.address-text {
							font-size: 28rpx;
							color: #333;
							flex: 1;
							line-height: 40rpx;
						}
					}
				}
				
				.address-arrow {
					font-size: 28rpx;
					color: #999;
					margin-left: 20rpx;
					margin-top: 10rpx;
				}
			}
			
			.select-address {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 30rpx;	
				.select-address-label {
					font-size: 28rpx;
					color: #666;
				}
				.address-arrow {
					font-size: 28rpx;
					color: #999;
					margin-left: 20rpx;
					margin-top: 10rpx;
				}
			}
			
			.address-stripe {
				height: 8rpx;
				background: linear-gradient(90deg, #1989fa 0%, #409eff 20%, #66b1ff 40%, #91d5ff 60%, #1989fa 80%, #409eff 100%);
				background-size: 200% 100%;
			}
		}
		.order-content {
			margin-top: 20rpx;
			background-color: #fff;
			padding-bottom: 150rpx;
			.shop-item {
				padding-bottom: 20rpx;
				background-color: #ffffff;
				/* 店铺头部 */
				.shop-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					height: 88rpx;
					padding: 0 30rpx;
					.shop-header-left {						
						.shop-name {
							font-size: 28rpx;
							color: #333333;
						}
						.shop-icon {
							font-size: 32rpx;
							color: #999999;
							margin-left: 20rpx;
						}
					}
					.shop-header-right {
						
					}
				}
				
				/* 商品列表 */
				.shop-goods {
					/* 商品项 */
					.goods-item {
						display: flex;
						align-items: center;
						padding: 30rpx;
						border-top: 2rpx solid #f5f5f5;
						background-color: #F6F6F6;
						/* 商品图片 */
						.goods-image {
							width: 170rpx;
							height: 170rpx;
							margin-right: 20rpx;
							border-radius: 8rpx;
						}
						/* 商品信息 */
						.goods-info {
							align-self: flex-start;
							flex: 1;
							.goods-name {
								font-size: 28rpx;
								color: #333333;
								line-height: 40rpx;
								margin-bottom: 10rpx;
								display: -webkit-box;
								-webkit-line-clamp: 2;
								-webkit-box-orient: vertical;
								overflow: hidden;
							}
							.goods-spec {
								font-size: 28rpx;
								color: #999999;
								margin-bottom: 10rpx;
								line-height: 40rpx;
							}
							.goods-promise {
								font-size: 28rpx;
								line-height: 40rpx;
							}
						}
						.goods-buy {
							width: 100rpx;
							margin-left: 50rpx;
							align-self: flex-start;
							display: flex;
							flex-direction: column;
							align-items: flex-end;
							.goods-price {
								font-size: 32rpx;
								font-weight: bold;
								color: #333333;
								line-height: 46rpx;
								height: 46rpx;	
							}
							.goods-count {
								font-size: 24rpx;
								line-height: 40rpx;
								color: #999999;
								margin-left: 20rpx;
							}
						}
					}
				}
				.shop-other {
					background-color: #fff;
					padding: 0 30rpx;
					.other-item {
						display: flex;
						justify-content: space-between;
						align-items: center;
						color: #333333;
						height: 80rpx;
						.other-item-label {
							font-size: 32rpx;
							font-weight: 500;
						}
						.other-item-value {
							font-size: 28rpx;
						}
						.other-item-input {
							flex: 1;
							padding-left: 30rpx;
						}
					}
					.other-sum {
						height: 80rpx;
						line-height: 80rpx;
						text-align: right;
					}
				}
			}
			.category-footer {
				position: fixed;
				left: 0;
				bottom: 0;
				z-index: 999;
				width: 100%;
				display: flex;
				justify-content: flex-end;
				align-items: center;
				background-color: #fff;
				padding-bottom: 50rpx;
				.total-sum {
					height: 100rpx;
					line-height: 100rpx;
					padding: 0 30rpx;
				}
				.submit {
					height: 100rpx;
					line-height: 100rpx;
					color: #fff;
					padding: 0 50rpx;
					background-color: #42B7FB;
				}
			}
		}
	}
</style>
