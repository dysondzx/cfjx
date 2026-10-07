<template>
	<view class="card">
		<text>-</text>
		<slot>
			<text class="card-title">{{props.cardTitle}}</text>
		</slot>
		<text>-</text>
	</view>
</template>

<script setup>
	import {defineProps} from 'vue'
	const props = defineProps({
		cardTitle: String
	})
</script>

<style lang="scss" scoped>
	.card {
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: bold;
		padding:20rpx 0;
		font-size:32rpx;
		color: #636263;
		.card-title {
			margin: 0 15rpx;
		}
	}
</style>