<template>
	<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
		<swiper-item v-for="item in dataList">
			<image class="swiper-img" :src="item.imgUrl" mode="aspectFill"></image>
		</swiper-item>
		<!-- <swiper-item>
			<image class="swiper-img" src="@/static/image/index/swiper/swiper1.jpg" mode="aspectFill"></image>
		</swiper-item>
		<swiper-item>
			<image class="swiper-img" src="@/static/image/index/swiper/swiper2.jpg" mode="aspectFill"></image>
		</swiper-item>
		<swiper-item>
			<image class="swiper-img" src="@/static/image/index/swiper/swiper3.jpg" mode="aspectFill"></image>
		</swiper-item> -->
	</swiper>
</template>

<script setup>
	defineProps({
		dataList: Array
	})
</script>

<style lang="scss" scoped>
	swiper {
		width: 100%;
		height: 350rpx;
	}
	.swiper-img {
		width: 100%;
		height: 350rpx;
	}
</style>