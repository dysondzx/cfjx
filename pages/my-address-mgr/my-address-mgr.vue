<template>
	<view class="my-address-mgr">
		<!-- 地址列表 -->
		<view class="address-list">
			<!-- 地址项 -->
			<view class="address-item" v-for="(item, index) in list" :key="item.id" @tap="addressClick(item)">
				<!-- 收货人信息 -->
				<view class="recipient-info">
					<text class="recipient-name">{{item.receiverName}}</text>
					<text class="recipient-phone">{{item.receiverPhone}}</text>
				</view>
				
				<!-- 地址信息 -->
				<view class="address-detail">
					<text class="default-tag" v-if="item.isDefault === 1">默认</text>
					<text class="address-text">{{item.province + item.city + item.area}}{{item.fullAddress}}</text>
				</view>
			</view>
		</view>
		
		<!-- 新增地址按钮 -->
		<view class="add-address-btn" @tap="gotoAdd">
			<text class="btn-text">新增地址</text>
		</view>
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {onLoad, onShow} from '@dcloudio/uni-app'
	import {useAddressStore} from '@/store/address'
	import { storeToRefs } from 'pinia'
	import $http from '@/common/js/request.js'
	const store = useAddressStore()
	const {list} = storeToRefs(store)
	const isSelect = ref(false)

	function gotoAdd() {
		uni.navigateTo({
			url: '/pages/my-address-add/my-address-add'
		})
	}
	function addressClick(item) {
		// 如果是从确认订单页面跳过来的，则是选择地址。点击后跳转回确认订单页面，并把选择的地址带过去
		if(isSelect.value) {
			uni.$emit('selectedData', item)
			uni.navigateBack({
				delta: 1
			})
		} else {		
			uni.navigateTo({
				url: '/pages/my-address-add/my-address-add?id=' + item.id
			})
		}
	}
	function getAddressList() {
		$http({
			url: '/api/address/list',
			method: 'GET'
		}).then(res => {
			if(res.code === 200) {
				store.setList(res.data)
			} else {
				uni.showToast({
					title: res.message,
					icon: 'none'
				})
			}
		})
	}
	onLoad(e => {
		if(e.source === 'order-confirm') {
			isSelect.value = true
		}
	})
	onShow(() => {
		getAddressList()
	})
</script>

<style lang="scss" scoped>
	.my-address-mgr {
		background-color: #fff;
		min-height: 100vh;
		padding: 20rpx;
		
		// 地址列表样式
		.address-list {
			margin-bottom: 30rpx;
			
			.address-item {
				padding: 20rpx;
				border-radius: 10rpx;
				border-bottom: 1px solid #F0F0F0;
				
				// 收货人信息样式
				.recipient-info {
					margin-bottom: 15rpx;
					height: 50rpx;
					line-height: 50rpx;
					.recipient-name {
						font-size: 30rpx;
						color: #333;
						margin-right: 30rpx;
					}
					.recipient-phone {
						font-size: 30rpx;
						color: #333;
					}
				}
				
				// 地址信息样式
				.address-detail {
					display: flex;
					align-items: flex-start;
					justify-content: flex-start;
					padding: 10rpx 0rpx;
					
					// 默认标签样式
					.default-tag {
						background-color: #1890ff;
						color: #fff;
						font-size: 24rpx;
						padding: 0rpx 12rpx;
						border-radius: 10rpx;
						margin-right: 15rpx;
						height: 40rpx;
    					line-height: 40rpx;
						margin-top: 5rpx;
						margin-bottom: 5rpx;
					}
					
					// 地址文字样式
					.address-text {
						flex: 1;
						font-size: 28rpx;
						color: #666;
    					line-height: 50rpx;
					}
				}
			}
		}
		
		// 新增地址按钮样式
		.add-address-btn {
			background-color: #fff;
			border: 1rpx solid #1890ff;
			border-radius: 50rpx;
			padding: 25rpx 100rpx;
			text-align: center;
			width: fit-content;
			margin: 0 auto;
			
			.btn-text {
				font-size: 30rpx;
				color: #1890ff;
			}
		}
	}
</style>
