import {ref, computed} from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
	const userInfo = ref(null)
	const loginStatus = ref(false)
	const token = ref(null)
	function login(data) {
		userInfo.value = data.userInfo
		loginStatus.value = true
		token.value = data.token
		uni.setStorageSync('userInfo', userInfo.value)
		uni.setStorageSync('token', token.value);
	}
	function logout() {
		userInfo.value = null
		loginStatus.value = false
		token.value = null
		uni.removeStorageSync('userInfo')
		uni.removeStorageSync('token');
	}
	return {
		userInfo,
		loginStatus,
		token,
		login,
		logout
	}
	
})