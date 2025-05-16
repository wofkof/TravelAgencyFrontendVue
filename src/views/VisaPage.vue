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

      <!-- 側邊Aside -->
      <el-container>
        <el-aside width="200px">
          <el-scrollbar>
            <el-menu>


              <el-sub-menu index="1"@click="activeMenu = 'passport'">
                <template #title >
                  <el-icon><Avatar /></el-icon>護照申辦
                </template>
                <el-menu-item-group>
                  <template #title>新辦/更換</template>
                  <el-menu-item index="1-1">14歲以上</el-menu-item>
                  <el-menu-item index="1-2">14歲以下</el-menu-item>
                </el-menu-item-group>
                <el-menu-item-group title="國外遺失">
                  <el-menu-item index="1-3">14歲以上</el-menu-item>
                  <el-menu-item index="1-3">14歲以下</el-menu-item>
                </el-menu-item-group>
              </el-sub-menu>




              <el-sub-menu index="3"@click="activeMenu = 'visa'">
                <template #title>
                  <el-icon><Document /></el-icon>各國簽證
                </template>

                <el-sub-menu index="3-4">
                  <template #title>港澳大陸</template>
                  <el-menu-item index="3-4-1" @click="activeMenu = 'china_visa'">中國</el-menu-item>
                  <el-menu-item index="3-4-2"@click="activeMenu = 'hongkong_visa'">香港</el-menu-item>
                  <el-menu-item index="3-4-3"@click="activeMenu = 'mongolia_visa'">蒙古</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="3-5">
                  <template #title>東南亞</template>
                  <el-menu-item index="3-5-1">汶萊</el-menu-item>
                  <el-menu-item index="3-5-2">菲律賓</el-menu-item>
                  <el-menu-item index="3-5-3">泰國</el-menu-item>
                  <el-menu-item index="3-5-4">越南</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="3-6">
                  <template #title>印度周邊</template>
                  <el-menu-item index="3-6-1">印度周邊</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="3-7">
                  <template #title>美加</template>
                  <el-menu-item index="3-7-1">加拿大</el-menu-item>
                  <el-menu-item index="3-7-2">美國</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="3-8">
                  <template #title>中南美洲</template>
                  <el-menu-item index="3-8-1">巴西聯邦共和國</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="3-9">
                  <template #title>西亞</template>
                  <el-menu-item index="3-9-1">土耳其共和國</el-menu-item>
                  <el-menu-item index="3-9-2">阿拉伯聯合大公國</el-menu-item>
                </el-sub-menu>

              </el-sub-menu>
            </el-menu>
          </el-scrollbar>
        </el-aside>


        <el-container>
           <PassportFooter v-if="activeMenu === 'passport'" />
           <VisaInfoFooter v-if="activeMenu === 'visa'" />

           
          <HongKongVisaInfoFooter v-if="activeMenu === 'hongkong_visa'" />
          <ChinaVisaInfoFooter v-if="activeMenu === 'china_visa'" />
          
         

          <el-main>
            <VueWorldMap />
          </el-main>
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
import PassportFooter from "@/components/Visa/PassportFooter.vue";
import VisaInfoFooter from "@/components/Visa/VisaInfoFooter.vue";

import ChinaVisaInfoFooter from "@/components/Visa/ChinaVisaInfoFooter.vue";
import HongKongVisaInfoFooter from "@/components/Visa/HongKongVisaInfoFooter.vue";





const activeMenu = ref('passport'); // 預設顯示護照申辦z

</script>

<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}
</style>
