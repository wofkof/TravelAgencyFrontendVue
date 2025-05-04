<template>
    <div class="max-w-7xl mx-auto p-4">
  <!-- 大容器：有內距 + 水平置中 -->
  
  <div class="flex gap-4">
    <!-- 使用 flex 建立左右兩欄，gap-4 代表區塊之間的間距 -->

    <!-- 左邊篩選器區塊 -->
    <div class="w-1/4 bg-gray-100 rounded-xl p-4 text-center text-gray-700">
      搜尋結果篩選器(暫)
      <FilterBar />
    </div>

    <!-- 右邊結果區塊 -->
    <div class="w-3/4 bg-white rounded-xl p-4 text-center text-gray-700 shadow">
      搜尋結果(未元件化)
      <router-link to="/Trip">
        <div class="bg-blue-100 rounded-lg p-4 mb-4">
        內容 01
        </div>
      </router-link>
        

        <div class="bg-blue-100 rounded-lg p-4 mb-4">
        內容 02
        </div>

        <div class="bg-blue-100 rounded-lg p-4 mb-4">
        內容 03
        </div>

        <div class="bg-blue-100 rounded-lg p-4">
        內容 04
        </div>
    </div>
  </div>
</div>


</template>

<script setup>
import FilterBar from "@/components/official/FilterBar.vue";

</script>