<template>
	<view class="banner">
		<image class="banner-img" :src="data" mode="aspectFill"></image>
	</view>
</template>

<script setup>
	defineProps({
		data: String
	})
</script>

<style lang="scss" scoped>
	.banner {
		.banner-img {
			width: 100%;
			height: 350rpx;
		}
	}       
</style>