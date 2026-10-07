<template>
	<view class="hot">
		<Commodity :dataList="dataList" :itemColNum="3" itemImgH="250rpx"/>
	</view>
</template>

<script setup>
	import Commodity from '@/components/common/Commodity.vue'
	// const hotList = [{
	// 	imgUrl: "/static/image/index/other/hot1.jpg",
	// 	name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/hot2.jpg",
	// 	name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/hot3.jpg",
	// 	name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/hot1.jpg",
	// 	name: "波司登25年羽绒服男士秋冬90绒轻薄圆领修身短款休闲送礼物外套",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/hot2.jpg",
	// 	name: "罗蒙（ROMON）纯色商务职业正装男士白衬衫工装外套长袖衬衣男CS108白色XL",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }, {
	// 	imgUrl: "/static/image/index/other/hot3.jpg",
	// 	name: "拓路者轻薄立领羽绒服男冬季新款轻薄羽绒外套户外登山服徒步穿搭上衣",
	// 	cprice: 299,
	// 	oprice: 599,
	// 	discount: 4.9
	// }]
	defineProps({
		dataList: Array
	})
</script>

<style lang="scss" scoped>
	       
</style>