<template>
  <div class="max-w-7xl mx-auto p-4">
<!-- 大容器：有內距 + 水平置中 -->

<div class="flex gap-4">
  <!-- 使用 flex 建立左右兩欄，gap-4 代表區塊之間的間距 -->

  <!-- 左邊篩選器區塊 -->
  <div class="w-1/4 bg-gray-100 rounded-xl p-4 text-center text-gray-700">
    搜尋結果篩選器(暫)
    <FilterBar 
    v-model="budget"
    :min="0"
    :max="200000"
    :step="1000"/>
  </div>

  <!-- 右邊結果區塊 -->
  <div class="w-3/4">
    <SearchResultBlock />
  </div>
</div>
</div>


</template>

<script setup>
import FilterBar from "@/components/official/FilterBar.vue";
import SearchResultBlock from "@/components/official/SearchResultBlock.vue";

const budget = ref([10000, 100000]);
</script>