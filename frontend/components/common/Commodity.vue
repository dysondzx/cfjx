<template>
	<view class="commodity" :style="'flex-wrap: '+props.wrap+';'">
		<view class="commodity-item" :style="'width: ' + 100 / props.itemColNum + '%;'" 
			v-for="(item, index) in props.dataList" :key="index" @tap="toDetail(item.id)">
			<image class="item-img" :style="'height: ' + props.itemImgH" :src="item.imgUrl" mode="aspectFill"></image>
			<view class="item-content">
				<view class="item-name" :style="'font-size: ' + props.nameFontSize + ';'">{{item.name}}</view>
				<view class="item-price">
					<text class="cprice">¥{{item.cprice}}</text>
					<text class="oprice">¥{{item.oprice}}</text>
				</view>
				<view class="discount">{{item.discount}}折</view>
			</view>
		</view>
	</view>
</template>
<script setup>
	const props = defineProps({
		dataList: {
			type: Array,
			default(rawProps) {
				return []
			}
		},
		itemColNum: {
			type: Number,
			default: 2
		},
		itemImgH: {
			type: String,
			default: '350rpx'
		},
		wrap: {
			type: String,
			default: 'wrap'
		},
		nameFontSize: {
			type: String,
			default: '32rpx'
		}
	})
		
	const toDetail = (id) => {
		uni.navigateTo({
			url: '/pages/details/details?id=' + id
		})
	}
</script>

<style lang="scss" scoped>
	.commodity {
		display: flex;
		justify-content: flex-start; 
		align-items: center;
		box-sizing: border-box;
		.commodity-item {
			padding-bottom: 20rpx;
			box-sizing: border-box;
			.item-img {
				width: 100%;
				box-sizing: border-box;
				display: block;		
			}
			.item-content {
				text-align: center;
			}
			.item-name {
				padding: 6rpx 20rpx;
				color: #333;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				word-break: break-all;
			}
			.item-price {
				margin-bottom: 8rpx;
			}
			.cprice {
				font-size: 28rpx;
			}
			.oprice {
				font-size: 20rpx;
				text-decoration: line-through;
				color: #999;
				vertical-align: baseline;
				margin-left: 8rpx;
			}
			.discount {
				display: inline-block;
				color: #ff3333;
				padding: 2rpx 10rpx;
				border: 1rpx solid #ff3333;
				border-radius: 4rpx;
				font-size: 20rpx;
			}
		}
	}       
</style>