<template>
	<view class="shop-cart">
		<template v-if="cartDatas && cartDatas.length > 0">
			<uni-nav-bar 
				title="购物车" 
				:statusBar="true" 
				color="#000000"  
				:right-text="isEdit? '完成': '编辑'"
				:showMenuButtonWidth="true"
				:fixed="true"
				@clickRight="isEdit = !isEdit"
				>
			</uni-nav-bar>
			<view class="shop-content">
				<!-- 店铺1 -->
				<view class="shop-item" v-for="(item, index) in cartDatas" :key="item.id">
					<!-- 店铺名称 -->
					<view class="shop-header">
						<radio :checked="item.checked" @tap="shopCheckChange(item)"></radio>
						<text class="shop-name">{{item.shopName}}</text>
						<text class="shop-icon iconfont icon-xiaoxi"></text>
					</view>
					
					<!-- 商品列表 -->
					<view class="shop-goods">
						<!-- 商品1 -->
						<view class="goods-item" v-for="(gItem, gIndex) in item.shopGoods" :key="gItem.id">
							<radio :checked="gItem.checked" @tap="goodCheckChange(gItem, item.shopId)"></radio>
							<image :src="gItem.imgUrl" mode="aspectFill" class="goods-image"></image>
							<view class="goods-info" v-if="!isEdit">
								<view class="goods-name">{{gItem.name}}</view>
								<view class="goods-spec">颜色分类: 原色</view>
								<view class="goods-buy">
									<view class="goods-price">
										¥{{gItem.cprice}}
									</view>
									<text class="goods-count">x{{gItem.num}}</text>									
								</view>
							</view>
							<view class="goods-info" v-else>
								<view class="goods-name">{{gItem.name}}</view>
								<view class="goods-spec">颜色分类: 原色</view>
								<view class="goods-buy">
									<view class="goods-price">
										¥{{gItem.cprice}}
									</view>
									<uni-number-box :value="gItem.num" @change="numChange($event, gItem, item.shopId)"></uni-number-box>							
								</view>
							</view>
						</view>				
					</view>
				</view>
			</view>
			<view class="shop-footer">
				<view class="footer-left">
					<radio :checked="allChecked" @tap="allCheckedChange"><text>全选</text></radio>
				</view>
				<view class="footer-right" v-if="!isEdit">
					<view class="sum">
						<view class="sum-top">合计：<text style="color: #49BDFB;">¥{{ sumCount.sumAmout }}</text></view>
						<view class="sum-bottom">不含运费</view>
					</view>
					<view class="settlement" @tap="goOrderConfirm">
						结算({{ sumCount.num }})
					</view>
				</view>
				<view class="footer-right" v-else>
					<view class="favourite">
						移入收藏夹
					</view>
					<view class="settlement" @tap="deleteSelected">
						删除
					</view>
				</view>
			</view>
		</template>
		<template v-else>
			<uni-nav-bar
				title="购物车" 
				:statusBar="true" 
				color="#000000"  
				:showMenuButtonWidth="true"
				:fixed="true"
				>
			</uni-nav-bar>
			<view class="empty">
				囧~购物车还是空的~
			</view>
		</template>
		<TabBar activeName="shop-cart"/>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {onLoad, onShow} from '@dcloudio/uni-app'
	import { storeToRefs } from 'pinia'
	import {useCartStore} from '@/store/cart.js'
	import TabBar from '@/components/common/TabBar.vue'
	import $http from '@/common/js/request.js'
	
	const store = useCartStore()
	const {cartDatas, allChecked, sumCount, selectGoodIds} = storeToRefs(store)
	const isEdit = ref(false)
	function goodCheckChange(item, shopId) {
		$http({
			url: '/api/cart/updateGoodChecked',
			method: 'POST',
			data: {
				checked: !item.checked,
				goodId: item.id
			}
		}).then(res => {
			if(res.code === 200) {
				getCartList()			
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	function shopCheckChange(item) {
		$http({
			url: '/api/cart/batchUpdateGoodChecked',
			method: 'POST',
			data: {
				checked: !item.checked,
				goodIds: item.shopGoods.map(good => good.id)
			}
		}).then(res => {
			if(res.code === 200) {
				getCartList()			
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	function allCheckedChange() {
		let checked = !allChecked.value
		const goodIds = []
		cartDatas.value.forEach(shop => {
			shop.shopGoods.forEach(good => {
				goodIds.push(good.id)
			})
		})
		$http({
			url: '/api/cart/batchUpdateGoodChecked',
			method: 'POST',
			data: {
				checked: checked,
				goodIds: goodIds
			}
		}).then(res => {
			if(res.code === 200) {
				getCartList()			
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	function numChange(value, item, shopId) {
		$http({
			url: '/api/cart/updateGoodNum',
			method: 'POST',
			data: {
				num: value,
				goodId: item.id
			}
		}).then(res => {
			if(res.code === 200) {
				getCartList()			
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	function deleteSelected() {
		$http({
			url: '/api/cart/batchDeleteGood',
			method: 'DELETE',
			data: {
				goodIds: selectGoodIds.value
			}
		}).then(res => {
			if(res.code === 200) {
				getCartList()			
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	function goOrderConfirm() {
		if(!selectGoodIds.value || selectGoodIds.value.length === 0) {
			uni.showToast({
				title: '请先选择商品再结算',
				icon: 'none'
			})
			return
		}
		uni.navigateTo({
			url: '/pages/order-confirm/order-confirm?goodIds=' + selectGoodIds.value.join(',')
		})
	}

	function getCartList() {
		$http({
			url: '/api/cart/list',
			method: 'GET'
		}).then(res => {
			if(res.code === 200) {
				const cartList = res.data
				store.setCartList(cartList)
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	onShow(() => {
		getCartList()
	})
</script>

<style lang="scss" scoped>
	.shop-cart {
		position: relative;
		min-height: 100vh;
		padding-bottom: calc(50px + env(safe-area-inset-bottom) + 120rpx); /* 为底部固定栏留出空间 */
		/* 购物车内容区域 */
		.shop-content {
			padding: 20rpx 0;
			/* 店铺项 */
			.shop-item {
				margin-bottom: 20rpx;
				background-color: #ffffff;
				/* 店铺头部 */
				.shop-header {
					display: flex;
					align-items: center;
					height: 88rpx;
					padding: 0 30rpx;
					radio {
						transform: scale(0.8);
						margin-right: 20rpx;
					}
					.shop-name {
						font-size: 28rpx;
						color: #333333;
						flex: 1;
					}
					.shop-icon {
						font-size: 24rpx;
						color: #999999;
						margin-left: 20rpx;
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
						radio {
							transform: scale(0.8);
							margin-right: 20rpx;
						}
						/* 商品图片 */
						.goods-image {
							width: 200rpx;
							height: 200rpx;
							margin-right: 20rpx;
							border-radius: 8rpx;
						}
						/* 商品信息 */
						.goods-info {
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
							.goods-buy {
								display: flex;
								justify-content: space-between;
								align-items: center;
								height: 46rpx;	
							}
							.goods-price {
								font-size: 32rpx;
								font-weight: bold;
								color: #333333;
								line-height: 46rpx;
								height: 46rpx;	
							}
							.goods-count {
								font-size: 24rpx;
								color: #999999;
								margin-left: 20rpx;
							}
						}
						/* 商品数量 */
						.goods-count {
							font-size: 24rpx;
							color: #999999;
							margin-left: 20rpx;
						}
					}
				}
			}
		}
		/* 底部固定栏样式 */
		.shop-footer {
			position: fixed;
			bottom: calc(50px + env(safe-area-inset-bottom));
			left: 0;
			right: 0;
			height: 120rpx;
			background-color: #ffffff;
			border-top: 2rpx solid #e5e5e5;
			display: flex;
			align-items: center;
			justify-content: space-between;
			z-index: 999;
			/* 左侧全选区域 */
			.footer-left {
				display: flex;
				align-items: center;
				padding-left: 30rpx;
				radio {
					transform: scale(0.8); /* 调整单选框大小 */
				}
				text {
					font-size: 28rpx;
					color: #333333;
					margin-left: 10rpx;
				}
			}
			/* 右侧合计和结算区域 */
			.footer-right {
				display: flex;
				align-items: center;
				height: 100%;
				/* 合计金额区域 */
				.sum {
					margin-right: 30rpx;
					.sum-top {
						font-size: 32rpx;
						font-weight: bold;
						color: #999999;
					}
					.sum-bottom {
						font-size: 24rpx;
						color: #999999;
						margin-top: 4rpx;
					}
					
				}
				.favourite {
					height: 100%;
					padding: 0 30rpx;
					background-color: #000;
					color: #fff;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 32rpx;
					font-weight: 500;
				}
				/* 结算按钮 */
				.settlement {
					width: 200rpx;
					height: 100%;
					background-color: #49BDFB;
					color: #ffffff;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 32rpx;
					font-weight: 500;
				}
			}
		}
		.empty {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #f7f7f7;
			color: #999999;
			text-align: center;
			padding-top: 200rpx;
		}
	}
	
</style>
