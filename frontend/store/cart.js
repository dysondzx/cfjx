import {ref, computed} from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  // const cartDatas = ref([
	 //  {
	 	// id: 1,	
		// shopId: 1,
		// shopName: '津维佳达成人用品专营店',
		// checked: false,
		// shopGoods: [
		// 	{
		// 		id: 1,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '爆款睡衣蕾丝睡衣内衣睡裙情趣内衣性感ebay 1553',
		// 		goodsSpec: '颜色分类: 浅紫色-高弹色丁',
		// 		checked: false,
		// 		cprice: 26,
		// 		num: 1  
		// 	}, {
		// 		id: 2,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '爆款睡衣蕾丝睡衣内衣睡裙情趣内衣性感ebay 1553',
		// 		goodsSpec: '颜色分类: 卡其色-高弹色丁',
		// 		checked: false,
		// 		cprice: 26,
		// 		num: 1 
		// 	}, {
		// 		id: 3,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '性感仿冰丝大码睡裙情趣内衣性感3002',
		// 		goodsSpec: '颜色分类: 黑色',
		// 		checked: false,
		// 		cprice: 49,
		// 		num: 1 
		// 	}, {
		// 		id: 4,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '吊带睫毛透视蕾丝情趣睡裙4414',
		// 		goodsSpec: '颜色分类: 红色',
		// 		checked: false,
		// 		cprice: 29,
		// 		num: 1 
		// 	},
		// ]
		   
	 //  }, 
	 //  {
	 	// id: 2,
		// shopId: 2,
		// shopName: '太湖雪床上用品专卖店',
		// checked: false,
		// shopGoods: [
		// 	 {
		// 		 id: 5,
		// 		 imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		 name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
		// 		 goodsSpec: '颜色分类: 原色',
		// 		 checked: false,
		// 		 cprice: 39,
		// 		 num: 1				 
		// 	 },
		// 	 {
		// 		id: 6,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
		// 		goodsSpec: '颜色分类: 原色',
		// 		checked: false,
		// 		cprice: 39,
		// 		num: 1 
		// 	 },
		// 	 {
		// 		id: 7,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
		// 		goodsSpec: '颜色分类: 原色',
		// 		checked: false,
		// 		cprice: 39,
		// 		num: 1 
		// 	 },
		// 	 {
		// 		id: 8,
		// 		imgUrl: '/static/image/index/recommend/Children1.jpg',
		// 		name: '夏季凉席坐垫办公室椅垫透气电脑椅子汽车沙发座垫女麻将竹凉垫夏ebay 1553',
		// 		goodsSpec: '颜色分类: 原色',
		// 		checked: false,
		// 		cprice: 39,
		// 		num: 1 
		// 	 }
		//  ]
	 //  }
  // ])
  const cartDatas = ref([])
  const selectGoodIds = ref([])
  const selectShopIds = ref([])
  const allChecked = computed(() => selectShopIds.value.length === cartDatas.value.length)
  const sumCount = computed(() => {
	let num = 0
	let sumAmout = 0
    cartDatas.value.forEach(shop => {
		shop.shopGoods.forEach(good => {
			if(selectGoodIds.value.includes(good.id)) {
				num++
				sumAmout += good.cprice * good.num
			}
		})
	})
	return {
		num,
		sumAmout
	}
  })

  function setCartList(cartList) {
	selectGoodIds.value = []
	selectShopIds.value = []
	cartDatas.value = cartList
	cartDatas.value.forEach(shop => {
		if(shop.shopGoods.length > 0) {
			// 如果这个店铺下的所有商品都勾选，则店铺也勾选
			shop.checked = shop.shopGoods.every(good => good.checked)
			if(shop.checked) {
				if(!selectShopIds.value.includes(shop.shopId)) {
					selectShopIds.value.push(shop.shopId)
				}
			}
		} else {
			shop.checked = false
		}
		shop.shopGoods.forEach(good => {
			if(good.checked) {
				if(!selectGoodIds.value.includes(good.id)) {
					selectGoodIds.value.push(good.id)
				}
			}
		})
	})
  }

  return { cartDatas, allChecked, sumCount, selectGoodIds,setCartList }
})