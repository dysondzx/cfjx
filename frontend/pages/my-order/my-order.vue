<template>
	<view class="my-order" :style="'height: '+ pageHeight +'px'">
		<Lines />
		<view class="order-header">
			<view 
				:class="['header-item', {'header-item-active': currName === tab.name}]" 
				v-for="tab in tabs" :key="tab.name"
				@tap="tabClick(tab)"
				>
				<text class="tab-label">{{tab.label}}</text>
				<text v-if="tab.badge" class="tab-badge">{{tab.badge}}</text>
			</view>
		</view>
		<view class="order-main">
			<view class="order-status" v-for="statusItem in currList" :key="statusItem.status">
				<view class="shop-item" v-for="(item, index) in statusItem.data" :key="item.id">		
					<!-- 店铺名称 -->
					<view class="shop-header">
						<view class="shop-header-left">
							<text class="shop-name">{{item.shopName}}</text>
							<text class="shop-icon iconfont icon-xiaoxi"></text>							
						</view>
						<view class="shop-header-right f-active-color ">
							{{getStatusLabel(statusItem.status)}}
						</view>
					</view>
					
					<!-- 商品列表 -->
					<view class="shop-goods">
						<!-- 商品1 -->
						<view class="goods-item" v-for="(gItem, gIndex) in item.shopGoods" :key="gItem.id">
							<image :src="gItem.imgUrl" mode="aspectFill" class="goods-image"></image>
							<view class="goods-info">
								<view class="goods-name">{{gItem.name}}</view>
								<view class="goods-spec">颜色分类: 原色</view>
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
					
					<view class="category-footer">					
						<view class="sumAmout">
							订单金额：<text class="f-active-color" style="font-size: 34rpx;">¥{{item.shopGoods.reduce((sum, g) => (sum+=g.cprice), 0)}}</text>(含运费¥0.00)
						</view>
						<template v-if="statusItem.status === 'pendingPayment'">						
							<Lines style="width: 100%;" />
							<view class="topay f-active-color" v-if="statusItem.status === 'pendingPayment'">
								支付
							</view>
						</template>
						<Lines style="width: 100%;" />
					</view>
				</view>
				
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref, computed} from 'vue'
	import Lines from '@/components/common/Lines.vue'
	const tabs = ref([{
		name: 'all',
		label: '全部'
	}, {
		name: 'pendingPayment',
		label: '待付款',
		badge: '1',
		list: [{
			
		}]
	}, {
		name: 'pendingDeliver',
		label: '待发货'
	}, {
		name: 'pendingReceiving',
		label: '待收货'
	}, {
		name: 'pendingEvaluation',
		label: '待评价'
	}])
	const orderCategory=ref({
		pendingPayment: [{
			id: 1,
			shopName: '津维佳达成人用品专营店',
			checked: false,
			shopGoods: [
				{
					id: 1,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '爆款睡衣蕾丝睡衣内衣睡裙情趣内衣性感ebay 1553',
					goodsSpec: '颜色分类: 浅紫色-高弹色丁',
					checked: false,
					cprice: 26,
					num: 1  
				}
			]	   
		}, 
		{
			 id: 2,
			 shopName: '太湖雪床上用品专卖店',
			 checked: false,
			 shopGoods: [
				 {
					 id: 5,
					 imgUrl: '/static/image/index/recommend/Children1.jpg',
					 name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
					 goodsSpec: '颜色分类: 原色',
					 checked: false,
					 cprice: 39,
					 num: 1				 
				 },
				 {
					id: 6,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
					goodsSpec: '颜色分类: 原色',
					checked: false,
					cprice: 39,
					num: 1 
				 }
			 ]
		}],
		pendingDeliver: [{
			id: 1,
			shopName: '津维佳达成人用品专营店',
			checked: false,
			shopGoods: [
				{
					id: 3,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '性感仿冰丝大码睡裙情趣内衣性感3002',
					goodsSpec: '颜色分类: 黑色',
					checked: false,
					cprice: 49,
					num: 1 
				}, {
					id: 4,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '吊带睫毛透视蕾丝情趣睡裙4414',
					goodsSpec: '颜色分类: 红色',
					checked: false,
					cprice: 29,
					num: 1 
				},
			]		   
		}, 
		{
			 id: 2,
			 shopName: '太湖雪床上用品专卖店',
			 checked: false,
			 shopGoods: [				 
				 {
					id: 7,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
					goodsSpec: '颜色分类: 原色',
					checked: false,
					cprice: 39,
					num: 1 
				 },
				 {
					id: 8,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
					goodsSpec: '颜色分类: 原色',
					checked: false,
					cprice: 39,
					num: 1 
				 }
			 ]
		}],
		pendingReceiving: [{
			id: 1,
			shopName: '津维佳达成人用品专营店',
			checked: false,
			shopGoods: [
				{
					id: 2,
					imgUrl: '/static/image/index/recommend/Children1.jpg',
					name: '爆款睡衣蕾丝睡衣内衣睡裙情趣内衣性感ebay 1553',
					goodsSpec: '颜色分类: 卡其色-高弹色丁',
					checked: false,
					cprice: 26,
					num: 1 
				},
			]			   
		}],
		pendingEvaluation: []
	})
	const currName = ref('all') // 默认选中"全部"
	const pageHeight = ref(0)
	const currList = computed(() => {
		if(currName.value === 'all') {
			return [{
					status: 'pendingPayment',
					data: orderCategory.value.pendingPayment
				}, {
					status: 'pendingDeliver',
					data: orderCategory.value.pendingDeliver
				}, {
					status: 'pendingReceiving',
					data: orderCategory.value.pendingReceiving
				}, {
					status: 'pendingEvaluation',
					data: orderCategory.value.pendingEvaluation
				}			
			]
		} else if(currName.value === 'pendingPayment') {
			return [
				{
					status: 'pendingPayment',
					data: orderCategory.value.pendingPayment
				}
			]
		} else if(currName.value === 'pendingDeliver') {
			return [
				{
					status: 'pendingDeliver',
					data: orderCategory.value.pendingDeliver
				}
			]
		} else if(currName.value === 'pendingReceiving') {
			return [
				{
					status: 'pendingReceiving',
					data: orderCategory.value.pendingReceiving
				}
			]
		} else if(currName.value === 'pendingEvaluation') {
			return [
				{
					status: 'pendingEvaluation',
					data: orderCategory.value.pendingEvaluation
				}
			]
		}
	})
	function tabClick(tab) {
		currName.value = tab.name
	}
	function getStatusLabel(status) {
		let label = ''
		switch (status) {
			case 'pendingPayment':
				label = '待付款'
				break
			case 'pendingDeliver':
				label = '待发货'
				break
			case 'pendingReceiving':
				label = '待收货'
				break
			case 'pendingEvaluation':
				label = '待评价'
				break
			default:
				label = ''
		}
		return label
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
			availableHeight = windowInfo.windowHeight; 
			
		} else {
			// ========== 其他端（H5等） ==========
			availableHeight = windowInfo.windowHeight;
		}
		
		return availableHeight;
	}
	init()
	function init() {
		const availableHeight = getAvailableHeight()
		pageHeight.value = availableHeight
	}
</script>

<style lang="scss" scoped>
	.my-order {
		background-color: #F6F6F6;
		.order-header {
			background-color: #fff;
			padding: 0 30rpx;
			display: flex;
			justify-content: space-around;
			align-items: center;
			height: 80rpx;
			border-bottom: 1rpx solid #f0f0f0;
			
			.header-item {
				position: relative;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 20rpx;
				height: 100%;
				
				.tab-label {
					font-size: 32rpx;
					color: #333;
				}
				
				.tab-badge {
					position: absolute;
					top: 10rpx;
					right: 0;
					background-color: #ff4d4f;
					color: #fff;
					font-size: 20rpx;
					border-radius: 10rpx;
					padding: 2rpx 10rpx;
					min-width: 24rpx;
					height: 24rpx;
					text-align: center;
					line-height: 24rpx;
				}
				
				&.header-item-active {
					.tab-label {
						color: #1989fa;
						font-weight: 500;
					}
					
					&::after {
						content: '';
						position: absolute;
						bottom: -1rpx;
						left: 10rpx;
						right: 10rpx;
						height: 4rpx;
						background-color: #1989fa;
						border-radius: 2rpx;
					}
				}
			}
		}
		.order-main {
			// padding: 20rpx 0;
			/* 店铺项 */
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
				.category-footer {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					.sumAmout {
						font-weight: 500;
						font-size: 28rpx;
						margin: 30rpx;
					}
					.topay {
						margin: 30rpx;
						font-size: 32rpx;
						height: 60rpx;
						line-height: 56rpx;
						padding: 0 50rpx;
						border: 2rpx solid #49BDFB;
						border-radius: 50rpx;
					}
				}
			}
		}
	}       
</style>
