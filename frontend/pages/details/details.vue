<template>
	<view class="details">
		<swiper class="top-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
			<!-- <swiper-item v-for="(item, index) in swiperList" :key="index">
				<view class="swiper-item">
					<image class="swiper-img" :src="item.imgUrl" mode="aspectFill"></image>
				</view>
			</swiper-item> -->
			<swiper-item>
				<view class="swiper-item">
					<image class="swiper-img" :src="goodsInfo.imgUrl" mode="aspectFill"></image>
				</view>
			</swiper-item>
		</swiper>
		<view class="info">
			<view class="cprice">¥{{goodsInfo.cprice}}</view>
			<view class="oprice">¥{{goodsInfo.oprice}}</view>
			<view class="keywords">{{goodsInfo.name}}</view>
		</view>
		<view class="description">
			<image src="/static/image/classify/detail1.jpg" mode="widthFix"></image>
			<image src="/static/image/classify/detail2.jpg" mode="widthFix"></image>
			<image src="/static/image/classify/detail3.jpg" mode="widthFix"></image>
			<image src="/static/image/classify/detail4.jpg" mode="widthFix"></image>
			<image src="/static/image/classify/detail5.jpg" mode="widthFix"></image>
		</view>
		<Card cardTitle="看了又看"/>
		<CommodityList :dataList="dataList"/>
		<view class="details-footer">
			<view class="iconfont icon-xiaoxi"></view>
			<view class="iconfont icon-3" @tap="toShopCart"></view>
			<view class="purchase shopCart" @tap="popAddCart">加入购物车</view>
			<view class="purchase buy" @tap="popBuy">立即购买</view>
		</view>
		<view class="modal" v-show="isShow" @tap="closeModal">
			<view class="modal-content" :animation="animationData" @tap.stop>
				<view class="modal-header">
					<view class="iconfont icon-guanbi1" @tap="closeModal"></view>
				</view>
				<view class="modal-body">
					<view class="product-info">
						<view class="product-img">
							<image :src="goodsInfo.imgUrl" mode="aspectFill"></image>
						</view>
						<view class="product-price">
							<view class="cprice">¥239.00</view>
							<view class="stock">可购33件</view>
							<view class="selected">已选:"透明"</view>
						</view>
					</view>
					<view class="color-section">
						<view class="section-title">颜色分类</view>
						<view class="color-options">
							<view class="color-item active">透明</view>
						</view>
					</view>
					<view class="quantity-section">
						<view class="section-title">购买数量</view>
						<view class="quantity-control">
							<uni-number-box v-model="quantity" :min="0" :step="1"></uni-number-box>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<view class="confirm-btn" @tap="confirmPurchase">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {ref, nextTick} from 'vue'
	import Card from '@/components/common/Card.vue'
	import CommodityList from '@/components/common/CommodityList.vue'
	import {onBackPress, onNavigationBarButtonTap, onLoad} from '@dcloudio/uni-app'
	import $http from '@/common/js/request'
	import config from '@/config/index.js'
	
	const isShow = ref(false)
	const dataList = ref([{
		id: 1,
		imgUrl: "/static/image/common/commodity1.jpg",
		name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
		cprice: 299,
		oprice: 599,
		discount: 4.9
	}, {
		id: 2,
		imgUrl: "/static/image/common/commodity2.jpg",
		name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
		cprice: 299,
		oprice: 599,
		discount: 4.9
	}, {
		id: 3,
		imgUrl: "/static/image/common/commodity3.jpg",
		name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
		cprice: 299,
		oprice: 599,
		discount: 4.9
	}, {
		id: 4,
		imgUrl: "/static/image/common/commodity4.jpg",
		name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
		cprice: 299,
		oprice: 599,
		discount: 4.9
	}])
	const swiperList = ref([{
		imgUrl: '/static/image/classify/details1.jpeg'
	}, {
		imgUrl: '/static/image/classify/details2.jpeg'
	}, {
		imgUrl: '/static/image/classify/details3.jpeg'
	}])
	const detailId = ref(null)
	const animation = ref(null)
	const animationData = ref({})
	const goodsInfo = ref({})
	const buyType = ref(null) // 1、加入购物车 2、立即购买
	const popAddCart = () => {
		buyType.value = 1
		// 先重置动画数据，确保弹框从初始位置开始
		animationData.value = {}
		// 显示弹框
		isShow.value = true
		// 使用 $nextTick 确保 DOM 更新完成后再执行动画
		nextTick(() => {		
			const anima = uni.createAnimation({
				duration: 1000,
				timingFunction: 'ease-in-out'
			})
			animation.value = anima
			// 设置初始位置为屏幕外下方
			anima.translateY(500).step()
			animationData.value = anima.export()
			// 立即执行从500到0的动画
			setTimeout(() => {
				anima.translateY(0).step()
				animationData.value = anima.export()
			}, 50)
		})
	}
	const popBuy = () => {
		buyType.value = 2
		// 先重置动画数据，确保弹框从初始位置开始
		animationData.value = {}
		// 显示弹框
		isShow.value = true
		// 使用 $nextTick 确保 DOM 更新完成后再执行动画
		nextTick(() => {		
			const anima = uni.createAnimation({
				duration: 1000,
				timingFunction: 'ease-in-out'
			})
			animation.value = anima
			// 设置初始位置为屏幕外下方
			anima.translateY(500).step()
			animationData.value = anima.export()
			// 立即执行从500到0的动画
			setTimeout(() => {
				anima.translateY(0).step()
				animationData.value = anima.export()
			}, 50)
		})
	}
	
	onBackPress(() => {
		console.log('onBackPress');
		// 如果购买的遮罩打开，点击返回键，则关闭遮罩，不返回前页（只有在该函数中返回值为 true 时，才表示不执行默认的返回，自行处理此时的业务逻辑）；否则返回前页
		if(isShow.value) {
			closeModal()
			return true
		}
	})
	onNavigationBarButtonTap((e) => {
		if(e.type === 'share') {
			uni.share({
				provider: 'weixin',
				type: 0,
				title: goodsInfo.value.name,
				scene: 'WXSceneSession',
				href: config.base_url.substring(0, config.base_url.length - 4) + '5173/#/pages/details/details?id=' + detailId.value,
				imageUrl: config.base_url.substring(0, config.base_url.length - 4) + '5173/#/static/image/index/other/icons1.png',
				success: () => {
					uni.showToast({
						title: '分享成功',
						icon: 'success'
					})
				},
				fail: (e) => {
					uni.showToast({
						title: '分享失败',					
						icon: 'fail'
					})
				}
			})
		}
	})
	onLoad(e => {
		detailId.value = e.id
		$http({
			url: '/api/goods/queryById',
			method: 'GET',
			data: {
				id: detailId.value
			}
		}).then(res => {
			if(res.code === 200) {
				goodsInfo.value = res.data
			}
		})
	})
	const closeModal = () => {
		const anima = animation.value
		// 执行关闭动画：从0到500
		anima.translateY(500).step()
		animationData.value = anima.export()
		// 动画结束后隐藏弹框
		setTimeout(() => {	
			isShow.value = false
		}, 1000)
	}
	
	// 购买数量
	const quantity = ref(1)
	
	const confirmPurchase = () => {
		const good = {
			...goodsInfo.value,
			num: quantity.value
		}
		$http({
			url: '/api/cart/addGood',
			method: 'POST',
			data: good
		}).then(res => {
			if(res.code === 200) {
				uni.showToast({
					title: '添加成功',
					icon: 'success',
					duration: 2000,
					success: () => {
						
						if(buyType.value == 2) {
							uni.reLaunch({
								url: '/pages/shop-cart/shop-cart',
							})
						}
					}
				})
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
		closeModal()
		uni.showToast({
			title: '加入购物车成功',
			icon: 'success'
		})
	}
	
	const toShopCart = () => {
		uni.reLaunch({
			url: '/pages/shop-cart/shop-cart',
		})
	}
</script>

<style lang="scss" scoped>
	.details {
		padding-bottom: 120rpx;
		.top-swiper {
			width: 100%;
			height: 700rpx;
			swiper-item {
				width: 100%;
				height: 100%;
				.swiper-item {
					width: 100%;
					height: 100%;
					.swiper-img {
						width: 100%;
						height: 100%;
					}
				}
			}
		}
		.info {
			text-align: center;
			color: #000;
			margin-top: 30rpx;
			font-weight: 700;
			.cprice {
				font-size: 40rpx;
				line-height: 60rpx;
			}
			.oprice {
				font-size: 30rpx;
				line-height: 40rpx;
				text-decoration: line-through;
				margin-bottom: 20rpx;
				font-weight: 500;
			}
			.keywords {
				font-size: 35rpx;
				font-weight: 600;
				line-height: 60rpx;
				margin-bottom: 20rpx;
			}
		}
		.description {
			image {
				width: 100%;
			}
		}
		.details-footer {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			display: flex;
			align-items: center;
			background-color: #F0F0F0;
			border-top: 1rpx solid #f0f0f0;
			padding: 20rpx 30rpx;
			z-index: 999;
			
			.iconfont {
				font-size: 40rpx;
				line-height: 80rpx;
				text-align: center;
				margin-right: 40rpx;
				color: #fff;
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				background-color: #2C2C2C;
			}
			
			.purchase {
				flex: 1;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				border-radius: 40rpx;
				font-size: 32rpx;
				font-weight: 600;
				margin-left: 20rpx;
				color: #fff;
			}
			
			.shopCart {
				background-color: #2C2C2C;
			}
			
			.buy {
				background-color: #42B7FB;
			}
		}
		
		.modal {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.5);
			z-index: 9999;
			.modal-content {
			width: 100%;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0 0;
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			/* 预设置初始位置为屏幕外下方，确保初次打开时动画正确 */
			transform: translateY(500px);
		}
			
			.modal-header {
				padding: 20rpx;
				height: 80rpx;
				position: relative;
			}
			
			.iconfont {
				position: absolute;
				top: 20rpx;
				right: 20rpx;
				font-size: 40rpx;
				color: #999;
				text-align: center;
				line-height: 40rpx;
			}
			
			.modal-body {
				padding: 0 30rpx 30rpx;
			}
			
			.product-info {
				display: flex;
				align-items: center;
				border-bottom: 1rpx solid #f0f0f0;
				height: 160rpx;
			}
			
			.product-img {
				width: 250rpx;
				height: 300rpx;
				margin-right: 30rpx;
				margin-top: -150rpx;
			}
			
			.product-img image {
				width: 100%;
				height: 100%;
				border-radius: 10rpx;
			}
			
			.product-price {
				flex: 1;
				padding-top: 10rpx;
			}
			
			.product-price .cprice {
				font-size: 36rpx;
				font-weight: 700;
				color: #ff4d4f;
				margin-bottom: 10rpx;
			}
			
			.product-price .stock {
				font-size: 24rpx;
				color: #666;
				margin-bottom: 10rpx;
			}
			
			.product-price .selected {
				font-size: 24rpx;
				color: #666;
			}
			
			.color-section {
				padding: 30rpx 0;
				border-bottom: 1rpx solid #f0f0f0;
			}
			
			.section-title {
				font-size: 28rpx;
				font-weight: 600;
				margin-bottom: 20rpx;
				color: #333;
			}
			
			.color-options {
				display: flex;
				flex-wrap: wrap;
			}
			
			.color-item {
				padding: 15rpx 30rpx;
				border: 1rpx solid #d9d9d9;
				border-radius: 4rpx;
				margin-right: 20rpx;
				margin-bottom: 20rpx;
				font-size: 26rpx;
				color: #333;
			}
			
			.color-item.active {
				border-color: #42B7FB;
				color: #42B7FB;
			}
			
			.quantity-section {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 30rpx 0;
			}
			
			.quantity-control {
				display: flex;
				align-items: center;
			}
			
			.quantity-btn {
				width: 60rpx;
				height: 60rpx;
				border: 1rpx solid #d9d9d9;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 32rpx;
				color: #666;
			}
			
			.quantity-btn:first-child {
				border-radius: 8rpx 0 0 8rpx;
			}
			
			.quantity-btn:last-child {
				border-radius: 0 8rpx 8rpx 0;
			}
			
			.quantity-input {
				width: 100rpx;
				height: 60rpx;
				border-top: 1rpx solid #d9d9d9;
				border-bottom: 1rpx solid #d9d9d9;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				color: #333;
			}
			
			.modal-footer {
				background-color: #fafafa;
				border-top: 1rpx solid #f0f0f0;
			}
			
			.confirm-btn {
				color: #fff;
				font-size: 32rpx;
				font-weight: 600;
				text-align: center;
				height: 90rpx;
				line-height: 90rpx;
				background-color: #42B7FB;
			}
		}
		
	}
</style>
