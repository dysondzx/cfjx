<template>
	<view class="recommend bg-color">
		<view class="recommend-item" v-for="(item, index) in dataList" :key="index">
			<view class="item-big">
				<image class="big-img" :src="item.bigUrl" mode="aspectFill"></image>
			</view>
			<view class="item-small">
				<image class="small-img" :src="innerItem.imgUrl" mode="aspectFill" v-for="innerItem in item.smallImg"></image>
			</view>
		</view>
		<!-- <view class="recommend-item">
			<view class="item-big">
				<image class="big-img" src="@/static/image/index/recommend/Children.jpg" mode="aspectFill"></image>
			</view>
			<view class="item-small">
				<image class="small-img" src="@/static/image/index/recommend/Children1.jpg" mode="aspectFill"></image>
				<image class="small-img" src="@/static/image/index/recommend/Children2.jpg" mode="aspectFill"></image>
				<image class="small-img" src="@/static/image/index/recommend/Children3.jpg" mode="aspectFill"></image>
			</view>
		</view>
		<view class="recommend-item">
			<view class="item-big">
				<image class="big-img" src="@/static/image/index/recommend/Furnishing.jpg" mode="aspectFill"></image>
			</view>
			<view class="item-small">
				<image class="small-img" src="@/static/image/index/recommend/Furnishing1.jpg" mode="aspectFill"></image>
				<image class="small-img" src="@/static/image/index/recommend/Furnishing2.jpg" mode="aspectFill"></image>
				<image class="small-img" src="@/static/image/index/recommend/Furnishing3.jpg" mode="aspectFill"></image>
			</view>
		</view> -->
	</view>
</template>

<script setup>
	defineProps({
		dataList: Array
	})
</script>

<style lang="scss" scoped>
	.recommend {
		padding: 20rpx;
		.recommend-item {
			display: flex;
			flex-direction: column;
			border-radius: 20rpx;
			border: 2rpx solid #ccc;
			overflow: hidden;
			margin: 20rpx 0;
			.item-big {
				width: 100%;
				height: 300rpx;
				.big-img {
					width: 100%;
					height: 100%;
				}
			}
			.item-small {
				width: 100%;
				height: 240rpx;
				.small-img {
					width: 33.33%;
					height: 100%;
				}
			}
		}
	}       
</style>