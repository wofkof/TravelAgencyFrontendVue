<!-- Views/VisaPage.vue -->
<template>
    <!-- 上面的輪播圖 -->
  <div class="common-layout">
    <el-container>
      <el-header style="height: auto;">
        <div style="margin-bottom: 20px">
          <el-carousel :interval="4000" type="card" height="300px">
            <el-carousel-item v-for="(img, index) in images" :key="index">
              <img :src="img" class="carousel-image" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </el-header>

      <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-container>
          <el-main>Main Content Here</el-main>

          <el-footer>
            <VisaInfoFooter/>
          </el-footer>
          
        </el-container>
      </el-container>
    </el-container>

  </div>
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
import { ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue'; 
import VisaInfoFooter from '@/components/Visa/VisaInfoFooter.vue'; 

</script>

<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

</style>
