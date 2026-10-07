<script>
	import {useUserStore} from '@/store/user.js'
	export default {
		onLaunch: function() {
			console.log('App Launch')
			const userStore = useUserStore()
			const userInfo = uni.getStorageSync('userInfo')
			const token = uni.getStorageSync('token')
			if(userInfo) {
				userStore.login({
					userInfo: userInfo,
    				token: token
				})
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import 'common/css/uni.css';
	@import 'common/css/iconfont.css';
	@import 'common/css/common.css';
</style>
