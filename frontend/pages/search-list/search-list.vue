<template>
	<view class="search-list">
		<ShopList :keywords="keywords" />
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import ShopList from '@/components/common/ShopList.vue'
	import {onLoad} from '@dcloudio/uni-app'
	const keywords = ref('')
	onLoad(e => {
		keywords.value = e.keywords
		// #ifdef APP-PLUS  
		// Vue3中使用getCurrentPages()获取当前页面实例，替代Vue2的this.$mp.page
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const webView = currentPage.$getAppWebview();  
		// 设置 searchInput的 text  
		webView.setTitleNViewSearchInputText(keywords.value) 
		// #endif
	})
</script>

<style lang="scss" scoped>
	       
</style>
