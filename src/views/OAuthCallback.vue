<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h2 class="text-xl mb-4">登入中，請稍候...</h2>
    <el-icon class="is-loading" size="32"><Loading /></el-icon>
  </div>
</template>

<script setup>
import { ref, onMounted  } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import api from "@/utils/api"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
// 將邏輯移到 onMounted 中執行
onMounted(async () => {
  const code = route.query.code
  
  if (code) {
    console.log('取得的 code：', code)
    
    try {
      const res = await api.post('/Account/GoogleLogin', { code })
      const name = res.data.name
      const memberId = res.data.memberId
      
      console.log('登入成功，寫入 authStore：', name, memberId)
      
      // 呼叫登入方法
      authStore.login(name, memberId, false)
      
      //ElMessage.success('Google 登入成功')
      
      // 觸發登入成功事件
      window.dispatchEvent(new CustomEvent('login-success'))
      
      // 延遲一下再跳轉，確保狀態更新完成
      setTimeout(() => {
        router.push('/').then(() => {
          console.log('✅ Google 登入後已導回首頁')
        })
      }, 100)
      
    } catch (err) {
      ElMessage.error('登入失敗，請重試')
      console.error('Google 登入錯誤：', err)
      router.push('/')
    } finally {
      loading.value = false
    }
  } else {
    ElMessage.warning('登入驗證碼遺失，請重新登入')
    router.push('/').then(() => {
      console.log('驗證碼缺失，導回首頁')
    })
    loading.value = false
  }
})
</script>
