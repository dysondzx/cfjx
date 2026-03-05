<template>
	<view class="icons">
		<view class="icons-item" v-for="(item, index) in dataList" :key="index">
			<image class="item-img" :src="item.imgUrl" mode="aspectFill"></image>
			<text class="item-name">{{item.name}}</text>
		</view>
		<!-- <view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons1.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons2.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons3.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons4.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons5.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons6.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons7.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view>
		<view class="icons-item">
			<image class="item-img" src="/static/image/index/other/icons8.png" mode="aspectFill"></image>
			<text class="item-name">运动户外</text>
		</view> -->
	</view>
</template>

<script setup>
	defineProps({
		dataList: Array
	})
</script>

<style lang="scss" scoped>
	.icons {
		display: flex;
		flex-wrap: wrap;
		margin: 20rpx 0;
		.icons-item {
			width: 25%;
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 30rpx;
			.item-img {
				width: 100rpx;
				height: 100rpx;
			}
			.item-name {
				color: #666;
				margin-top: 10rpx;
			}
		}
	}       
</style>