<!-- Views/VisaPage.vue -->
<template>
  <!-- 上面的輪播圖 -->
  <div class="common-layout">
    <el-container>
      <el-header style="height: auto">
        <div style="margin-bottom: 20px">
          <el-carousel :interval="4000" type="card" height="300px">
            <el-carousel-item v-for="(img, index) in images" :key="index">
              <img :src="img" class="carousel-image" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </el-header>

      <el-container>
        <el-aside width="200px">
          <el-scrollbar>
            <el-menu :default-openeds="['1', '3']">
              <el-sub-menu index="1">
                <template #title>
                  <el-icon><message /></el-icon>亞洲簽證
                </template>
                <el-menu-item-group>
                  <template #title>台灣</template>
                  <el-menu-item index="1-1">台灣 1</el-menu-item>
                  <el-menu-item index="1-2">台灣 2</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="台灣">
                  <el-menu-item index="1-3">台灣 3</el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="1-4">
                  <template #title>台灣</template>
                  <el-menu-item index="1-4-1">台灣 4-1</el-menu-item>
                </el-sub-menu>
              </el-sub-menu>
              <el-sub-menu index="3">
                <template #title>
                  <el-icon><setting /></el-icon>歐洲簽證
                </template>
                <el-menu-item-group>
                  <template #title>歐洲 1</template>
                  <el-menu-item index="3-1">歐洲 1</el-menu-item>
                  <el-menu-item index="3-2">歐洲 2</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="歐洲 2">
                  <el-menu-item index="3-3">歐洲 3</el-menu-item>
                </el-menu-item-group>
                <el-sub-menu index="3-4">
                  <template #title>歐洲 4</template>
                  <el-menu-item index="3-4-1">歐洲 4-1</el-menu-item>
                </el-sub-menu>
              </el-sub-menu>
            </el-menu>
          </el-scrollbar>
        </el-aside>
        <el-container>
          <el-main><VisaInfoFooter /></el-main>

          <!-- <el-footer> -->
          <!-- <VisaInfoFooter /> -->
          <!-- </el-footer> -->
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
const images = [
  new URL("../assets/images/visa1.jpg", import.meta.url).href,
  new URL("../assets/images/visa2.jpg", import.meta.url).href,
  new URL("../assets/images/visa3.jpg", import.meta.url).href,
  new URL("../assets/images/visa4.jpg", import.meta.url).href,
  new URL("../assets/images/visa5.jpg", import.meta.url).href,
  new URL("../assets/images/visa6.jpg", import.meta.url).href,
];
import { ref } from "vue";
import { ArrowRight } from "@element-plus/icons-vue";
import VisaInfoFooter from "@/components/Visa/VisaInfoFooter.vue";
</script>

<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>
