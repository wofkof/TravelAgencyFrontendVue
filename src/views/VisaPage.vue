<!-- Views/VisaPage.vue -->
<template>
   <el-carousel :interval="4000" type="card" height="300px">
    <el-carousel-item v-for="(img, index) in images" :key="index">
      <img :src="img" class="carousel-image" />
    </el-carousel-item>
  </el-carousel>

  <VisaTabs /><!-- 這是 tab 元件 -->
</template>


<script setup>
const images = [
   new URL('../assets/images/visa1.jpg', import.meta.url).href,
   new URL('../assets/images/visa2.jpg', import.meta.url).href,
   new URL('../assets/images/visa3.jpg', import.meta.url).href,
   new URL('../assets/images/visa4.jpg', import.meta.url).href,
   new URL('../assets/images/visa5.jpg', import.meta.url).href,
   new URL('../assets/images/visa6.jpg', import.meta.url).href,
]

import VisaTabs from '@/components/Visa/VisaTabs.vue'
</script>


<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>
