<!-- src/components/FilterBar.vue -->
<template>
    <div class="filter-bar flex flex-col">
      <label>
        最低價格：
        <input type="number" v-model.number="localMinPrice" />
      </label>
      <label>
        最高價格：
        <input type="number" v-model.number="localMaxPrice" />
      </label>
      <label>
        出發日期：
        <input type="date" v-model="localSelectedDate" />
      </label>
    </div>
  </template>
  
  <script setup>
  import { watch, defineProps, defineEmits, ref } from 'vue'
  
  // 接收來自父層的初始值
  const props = defineProps({
    minPrice: Number,
    maxPrice: Number,
    selectedDate: String
  })
  
  // 傳出事件給父層
  const emit = defineEmits(['update:filters'])
  
  // 本地綁定值（不直接修改 props）
  const localMinPrice = ref(props.minPrice)
  const localMaxPrice = ref(props.maxPrice)
  const localSelectedDate = ref(props.selectedDate)
  
  // 監聽變化並向外 emit
  watch([localMinPrice, localMaxPrice, localSelectedDate], () => {
    emit('update:filters', {
      minPrice: localMinPrice.value,
      maxPrice: localMaxPrice.value,
      selectedDate: localSelectedDate.value
    })
  })
  </script>
  
  <style scoped>
  .filter-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  </style>
  