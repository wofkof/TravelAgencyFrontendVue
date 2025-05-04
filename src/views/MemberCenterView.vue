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
          <TravelerList :travelers="travelerList" @delete="removeTraveler" />
        </div>
      </div>
  
    </div>
  </div>
</template>

    
    <script setup>
    // import TravelerFormModal from '@/components/MemberCenter/TravelerFormModal.vue'
    import TravelerList from '@/components/MemberCenter/TravelerList.vue'
    import MemberSidebar from '@/components/MemberCenter/MemberSidebar.vue'
    import { ref } from 'vue'
    
    const travelerList = ref([])
    
    function addTraveler(traveler) {
      travelerList.value.push(traveler)
    }
    
    function removeTraveler(index) {
      travelerList.value.splice(index, 1)
    }
    </script>
  