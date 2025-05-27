// composables/requireLogin.js
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'

export function requireLogin(callback) {
  const authStore = useAuthStore()

  if (!authStore.isLoggedIn) {
    ElMessage.warning('請先登入會員')
    authStore.triggerLoginModal()
    return
  }

  if (typeof callback === 'function') {
    callback()
  }
}

