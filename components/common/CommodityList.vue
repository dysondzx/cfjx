<template>
	<view class="commodity-list">
		<Commodity :dataList="dataList"/>
	</view>
</template>

<script setup>
	import Commodity from './Commodity.vue';
	defineProps({
		dataList: Array
	})
</script>

<style lang="scss" scoped>
	       
</style>