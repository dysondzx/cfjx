<template>
	<view class="shop">
		<view class="shop-item" v-for="(item, index) in dataList" :key="index">
			<image class="img-big" :src="item.bigUrl" mode="aspectFill"></image>
			<scroll-view scroll-x="true" class="scroll-content" :show-scrollbar="false">
				<Commodity 
					:dataList="item.data" 
					wrap="no-wrap" 
					:itemColNum="3" 
					itemImgH="250rpx"
					nameFontSize="26rpx"
				></Commodity>
			</scroll-view>
		</view>
		<!-- <view class="shop-item">
			<image class="img-big" src="/static/image/index/other/shop.jpg" mode="aspectFill"></image>
			<scroll-view scroll-x="true" class="scroll-content" :show-scrollbar="false">
				<Commodity 
					:dataList="shopList" 
					wrap="no-wrap" 
					:itemColNum="3" 
					itemImgH="250rpx"
					nameFontSize="26rpx"
				></Commodity>
			</scroll-view>
		</view>
		<view class="shop-item">
			<image class="img-big" src="/static/image/index/other/shop.jpg" mode="aspectFill"></image>
			<scroll-view scroll-x="true" class="scroll-content" :show-scrollbar="false">
				<Commodity 
					:dataList="shopList" 
					wrap="no-wrap" 
					:itemColNum="3" 
					itemImgH="250rpx"
					nameFontSize="26rpx"
				></Commodity>
			</scroll-view>
		</view>
		<view class="shop-item">
			<image class="img-big" src="/static/image/index/other/shop.jpg" mode="aspectFill"></image>
			<scroll-view scroll-x="true" class="scroll-content" :show-scrollbar="false">
				<Commodity 
					:dataList="shopList" 
					wrap="no-wrap" 
					:itemColNum="3" 
					itemImgH="250rpx"
					nameFontSize="26rpx"
				></Commodity>
			</scroll-view>
		</view> -->
	</view>
</template>

<script setup>
	import Commodity from '@/components/common/Commodity.vue'
	defineProps({
		dataList: Array
	})
	// const shopList = [{
	// 	imgUrl: "/static/image/index/other/shop1.jpg",
	// 	name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop2.jpg",
	// 	name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop3.jpg",
	// 	name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop4.jpg",
	// 	name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop1.jpg",
	// 	name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop2.jpg",
	// 	name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop3.jpg",
	// 	name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/shop4.jpg",
	// 	name: "JEEP SPIRIT吉普90鸭绒羽绒裤男冬季保暖防水防风工装休闲裤男裤 雪山白 XL",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }]
</script>

<style lang="scss" scoped>
	.shop {
		.shop-item {
			font-size: 0;
			.img-big {
				width: 100%;
				height: 300rpx;
			}
			.scroll-content {
				white-space: nowrap;
			}
		}
	}       
</style>