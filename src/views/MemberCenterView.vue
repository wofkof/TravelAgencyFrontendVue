<template>
  <!-- 整體灰底區塊 -->
  <div class="flex justify-center bg-gray-100 min-h-screen py-8 px-4">
    <!-- 內層內容容器 -->
    <div class="flex w-full max-w-7xl gap-6">
      
      <!-- 左側側邊欄（卡片樣式） -->
      <div class="w-64 bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <MemberSidebar />
      </div>
  
      <!-- 右側主要內容（卡片樣式） -->
      <div class="flex-1">
        <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
           <!-- 動態切換內容元件 -->
           <component :is="currentComponent" />
        </div>
      </div>
  
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import MemberSidebar from '@/components/MemberCenter/MemberSidebar.vue'
import TravelerList from '@/components/MemberCenter/TravelerList.vue'
import Collection from '@/components/MemberCenter/Collection.vue'
import Comment from '@/components/MemberCenter/Comment.vue'
import AccountSetting from '@/components/MemberCenter/AccountSetting.vue'
import Order from '@/components/MemberCenter/OrderHistory.vue'
import StatusMain from '@/components/customtravel/StatusMain.vue'


const route = useRoute()
const currentView = ref('TravelerList')

const syncViewFromRoute = () => {
  const path = route.path.toLowerCase()
  const map = {
    '/member/profile': 'AccountSetting',
    '/member/orders': 'Order',
    '/member/favorite-travelers': 'TravelerList',
    '/member/favorites': 'Collection',
    '/member/comments': 'Comment',
    '/member/customtravel-status': 'StatusMain'
  }
  currentView.value = map[path] || 'TravelerList'
}

onMounted(syncViewFromRoute)
watch(() => route.path, syncViewFromRoute)

const currentComponent = computed(() => {
  return {
    TravelerList,
    Collection,
    Comment,
    AccountSetting,
    Order,
    StatusMain 
  }[currentView.value]
})
</script>
  