import {ref, computed} from 'vue'
import { defineStore } from 'pinia'

export const useAddressStore = defineStore('address', () => {
    const list = ref([])
	function queryAddressById(id) {
		// 确保id类型与数组中id类型匹配
		const targetId = typeof id === 'string' ? parseInt(id) : id;
		const result = list.value.find(item => item.id === targetId);
		return result;
	}
	function getDefaultAddresses() {
		return list.value.filter(item => item.isDefault === 1)
	}
	function setList(addressList) {
		list.value = addressList
	}
    return {list, queryAddressById, getDefaultAddresses, setList}
})
