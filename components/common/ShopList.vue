<template>
	<view class="shop-list">
		<view class="shop-header">
			<view class="header-item f-color" v-for="(item, index) in headerItems" 
				:key="item.id" @tap="clickHeader(item)">
				<text :class="['item-label', item.id === currId? 'f-active-color': 'f-color']">{{item.name}}</text>
				<view class="item-order">
					<text :class="['iconfont', 'icon-shangjiantou', 'up', item.id === currId && item.state === 1? 'f-active-color': 'f-color']"></text>
					<text :class="['iconfont', 'icon-xiajiantou', 'down', item.id === currId && item.state === 2? 'f-active-color': 'f-color']"></text>
				</view>
			</view>
		</view>
		<Lines style="margin-bottom: 5rpx;"/>
		<CommodityList :dataList="dataList"/>
	</view>
</template>

<script setup>
	import {ref, onMounted} from 'vue'
	import Lines from '@/components/common/Lines.vue'
	import CommodityList from '@/components/common/CommodityList.vue'
	import $http from '@/common/js/request'
	const props = defineProps({
		keywords: {
			type: String,
			default: ''
		}
	})
	const dataList = ref([])
	const currId = ref(null)
	const headerItems = ref([
		{id: 1, name: '价格', state: 0, key: 'cprice'}, //state: 0不排序；1升序；2降序
		{id: 2, name: '折扣', state: 0, key: 'discount'},
		{id: 3, name: '品牌', state: 0}	
	])
	
	const queryGoods = () => {
		let orderKey = null
		let order = null
		if(currId.value != null) {
			const orderInfo = headerItems.value.find(item => item.id === currId.value)
			orderKey = orderInfo.key
			order = 'desc'
			if(orderInfo.state === 1) {
				order = 'asc'
			}
		}
		$http({
			url: '/api/goods/queryList',
			method: 'GET',
			data: {
				keywords: props.keywords,
				orderKey: orderKey,
				order: order,
			}
		}).then(res => {
			if(res.code === 200) {
				dataList.value = res.data.list
				console.log('dataList.value:', dataList.value);
			}
		})
	}

	onMounted(() => {
		if(props.keywords) {
			queryGoods()
		}
	})

	const clickHeader = item => {
		currId.value = item.id
		if(item.state === 0) {
			item.state = 1
		} else if(item.state === 1) {
			item.state = 2
		} else if(item.state === 2) { //降序时，再点击一下，就取消排序
			item.state = 0
			currId.value = null
		}
		queryGoods()
	}

</script>

<style lang="scss" scoped>
	.shop-list {
		.shop-header {
			display: flex;
			align-items: center;
			.header-item {
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 70rpx;
				
				.item-label {
					font-size: 30rpx;
				}
				.item-order {
					position: relative;
					width: 30rpx;
					margin-left: 10rpx;
					background-color: red;
					.up, .down {
						font-size: 30rpx;
						position: absolute;
						left: 50%;
						transform: translateX(-50%);
					}
					.up {
						top: -22rpx;
					}
					.down {
						top: -8rpx;
					}
				}
			}
		}
	}       
</style>