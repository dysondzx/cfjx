<template>
	<view class="my-address-add">
		<!-- 收件人 -->
		<view class="form-item">
			<text class="label">收货人</text>
			<input type="text" v-model="receiverName" class="input" placeholder="收件人姓名，2到15位字符" />
		</view>
		
		<!-- 手机号 -->
		<view class="form-item">
			<text class="label">手机号</text>
			<input type="number" v-model="receiverPhone" class="input" placeholder="11位手机号" />
		</view>
		
		<!-- 所在地区 -->
		<view class="form-item region-item">
			<text class="label">所在地区</text>
			<view class="region-select" @tap="openCityPicker">
				<text class="select-text">
					{{ province + city + area || '请选择' }}
				</text>
				<text class="iconfont icon-gengduo"></text>
			</view>
			<cityPicker 
				:column="column" 
				:default-value="[province, city, area]" 
				:mask-close-able="maskCloseAble" 
				@confirm="confirm" 
				@cancel="cancel" 
				:visible="visible"
			/>
		</view>
		
		<!-- 详细地址 -->
		<view class="form-item">
			<text class="label">详细地址</text>
			<input type="text" v-model="fullAddress" class="input" placeholder="5到60个字符" />
		</view>
		
		<!-- 设为默认地址 -->
		<view class="form-item default-item">
			<text class="label">设为默认地址</text>
			<radio class="radio" :checked="isDefault === 1" @tap="isDefault = isDefault === 1? 0: 1" />
		</view>
		<!-- #ifdef MP-WEIXIN -->
		<!-- 固定在页面底部的保存按钮 -->
		<view class="fixed-bottom">
			<view class="save-btn" @tap="saveAddress">保存</view>
		</view>
		<!-- #endif -->
	</view>
</template>

<script setup>
	import {ref} from 'vue'
	import {onNavigationBarButtonTap, onLoad} from '@dcloudio/uni-app'
	import {useAddressStore} from '@/store/address'
	import cityPicker from '@/uni_modules/piaoyi-cityPicker/components/piaoyi-cityPicker/piaoyi-cityPicker'
	import $http from '@/common/js/request.js'
	const store = useAddressStore()
	const id = ref(null)
	const visible = ref(false)
	const maskCloseAble = ref(true)
	const receiverName = ref('')
	const receiverPhone = ref('')
	const province = ref('河北省')
	const city = ref('唐山市')
	const area = ref('丰南区')
	const fullAddress = ref('')
	const isDefault = ref(0)
	const column = ref(3)
	function openCityPicker() {
		visible.value = true
	}
	function confirm(e) {
		province.value=e.provinceName
		city.value=e.cityName
		area.value=e.areaName
		visible.value = false
	}
	function cancel(e) {
		visible.value = false
	}
	
	// 微信小程序保存地址函数
	function saveAddress() {
		// 验证必填字段
		if (!receiverName.value || !receiverPhone.value || !province.value || !city.value || !area.value || !fullAddress.value) {
			uni.showToast({
				title: '请填写完整的收货信息',
				icon: 'none'
			})
			return
		}
		const address = {
			receiverName: receiverName.value,
			receiverPhone: receiverPhone.value,
			province: province.value,
			city: city.value,
			area: area.value,
			fullAddress: fullAddress.value,
			isDefault: isDefault.value,
		}
		if(id.value != null) {
			address.id = id.value
			$http({
				url: '/api/address/update',
				method: 'POST',
				data: address
			}).then(res => {
				if(res.code === 200) {				
					uni.showToast({
						title: '修改成功',
						icon: 'success',
						duration: 2000
					})
					// 延迟返回上一页，确保Toast显示完整
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						})
					}, 1500)
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none'
					})
				}
			})
		} else {
			$http({
				url: '/api/address/add',
				method: 'POST',
				data: address
			}).then(res => {
				if(res.code === 200) {				
					uni.showToast({
						title: '添加成功',
						icon: 'success',
						duration: 2000
					})
					// 延迟返回上一页，确保Toast显示完整
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						})
					}, 1500)
				} else {
					uni.showToast({
						title: res.message,
						icon: 'none'
					})
				}
			})
		}
	}
	
	onNavigationBarButtonTap(e => {
		if(e.float === 'right') { // 保存按钮
			saveAddress()
		}
	})
	
	onLoad(e => {
		if(e.id != null) {
			uni.setNavigationBarTitle({
			  title: "修改地址",
			});
			const address = store.queryAddressById(e.id)
			if(address) {				
				id.value = address.id
				receiverName.value = address.receiverName
				receiverPhone.value = address.receiverPhone
				province.value = address.province
				city.value = address.city
				area.value = address.area
				fullAddress.value = address.fullAddress
				isDefault.value = address.isDefault
			}
		}
	})

</script>

<style lang="scss" scoped>
	.my-address-add {
		background-color: #f5f5f5;
		min-height: 100vh;
		
		// 表单项样式
		.form-item {
			padding: 0 30rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			height: 100rpx;
			border-bottom: 1rpx solid #e8e8e8;
			
			// 标签样式
			.label {
				font-size: 30rpx;
				color: #333;
				margin-right: 40rpx;
			}
			
			// 输入框样式
			.input {
				flex: 1;
				font-size: 30rpx;
				color: #333;
				height: 100%;
				padding: 0;
			}
			
			// 地区选择样式
			&.region-item {
				.region-select {
					flex: 1;
					display: flex;
					align-items: center;
					justify-content: space-between;
					.select-text {
						font-size: 30rpx;
						color: #999;
					}
					.iconfont {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
			
			// 默认地址选项样式
			&.default-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				.radio {
					transform: scale(1.1);
				}
			}
		}
		
		// 固定在页面底部的保存按钮容器
		.fixed-bottom {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: #fff;
			padding: 20rpx 30rpx;
			border-top: 1rpx solid #e8e8e8;
			z-index: 999;
			
			// 保存按钮样式
			.save-btn {
				height: 80rpx;
				background-color: #007aff;
				color: #fff;
				border-radius: 40rpx;
				font-size: 32rpx;
				font-weight: 500;
				display: flex;
				align-items: center;
				justify-content: center;
				
				&:active {
					background-color: #0056cc;
				}
			}
		}
	}
	
	// 为微信小程序环境添加底部安全区域
	// #ifdef Wx
	.my-address-add {
		padding-bottom: 120rpx; // 为固定按钮预留空间
	}
	// #endif
</style>
