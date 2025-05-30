<!-- 我是證件選單第一頁 -->
<template>
  <div class="common-layout" style="height:1300px;"> 
    <el-container>
      <el-header style="height: auto"> <!-- 上面的輪播圖 -->
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
        <el-aside width="500px" style="background-color: #EEDACB;height:1300">
          <el-scrollbar>
            <el-menu>
              <el-sub-menu index="1">
                <template #title>
                  <el-icon><Avatar /></el-icon>護照申辦
                </template>
                <el-sub-menu index="1-1">
                  <template #title>新辦/更換</template>
                  <el-menu-item index="1-1-1" @click="activeMenu = 'newchangeup'">14歲以上</el-menu-item>
                  <el-menu-item index="1-1-2" @click="activeMenu = 'newchangedown'">14歲以下</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="1-2">
                  <template #title>國外遺失</template>
                  <el-menu-item index="1-2-1" @click="activeMenu = 'foreignlostup'">14歲以上</el-menu-item>
                  <el-menu-item index="1-2-2" @click="activeMenu = 'foreignlostdown'">14歲以下</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="1-3">
                  <template #title>國內遺失</template>
                  <el-menu-item index="1-3-1" @click="activeMenu = 'domesticlostup'">14歲以上</el-menu-item>
                  <el-menu-item index="1-3-2" @click="activeMenu = 'domesticlostdown'">14歲以下</el-menu-item>
                </el-sub-menu>
              </el-sub-menu>

              <el-sub-menu index="2">
                <template #title>
                  <el-icon><Document /></el-icon>各國簽證
                </template>
                <el-sub-menu index="3-4">
                  <template #title>港澳大陸</template>
                  <el-menu-item index="3-4-1" @click="activeMenu = 'china'">中國</el-menu-item>
                  <el-menu-item index="3-4-2" @click="activeMenu = 'hongkong'">香港</el-menu-item>
                  <el-menu-item index="3-4-3" @click="activeMenu = 'mongolia'">蒙古</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="3-5">
                  <template #title>東南亞</template>
                  <el-menu-item index="3-5-1" @click="activeMenu = 'brunei'">汶萊</el-menu-item>
                  <el-menu-item index="3-5-2" @click="activeMenu = 'philippines'">菲律賓</el-menu-item>
                  <el-menu-item index="3-5-3" @click="activeMenu = 'thailand'">泰國</el-menu-item>
                  <el-menu-item index="3-5-4" @click="activeMenu = 'vietnam'">越南</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="3-6">
                  <template #title>印度周邊</template>
                  <el-menu-item index="3-6-1" @click="activeMenu = 'india'">印度</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="3-7">
                  <template #title>美加</template>
                  <el-menu-item index="3-7-1" @click="activeMenu = 'canada'">加拿大</el-menu-item>
                  <el-menu-item index="3-7-2" @click="activeMenu = 'usa'">美國</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="3-8">
                  <template #title>中南美洲</template>
                  <el-menu-item index="3-8-1" @click="activeMenu = 'brazil'">巴西聯邦共和國</el-menu-item>
                </el-sub-menu>
                <el-sub-menu index="3-9">
                  <template #title>西亞</template>
                  <el-menu-item index="3-9-1" @click="activeMenu = 'turkiye'">土耳其共和國</el-menu-item>
                  <el-menu-item index="3-9-2" @click="activeMenu = 'Arabemirates'">阿拉伯聯合大公國</el-menu-item>
                </el-sub-menu>
              </el-sub-menu>
            </el-menu>
          </el-scrollbar>
        </el-aside>


        <el-container>
          <NewChangeup v-if="activeMenu === 'newchangeup'" />
          <NewChangedown v-if="activeMenu === 'newchangedown'" />
          <Foreignlostup v-if="activeMenu === 'foreignlostup'" />
          <Foreignlostdown v-if="activeMenu === 'foreignlostdown'" />
          <Domesticlostup v-if="activeMenu === 'domesticlostup'" />
          <Domesticlostdown v-if="activeMenu === 'domesticlostdown'" />
          <China v-if="activeMenu === 'china'" />
          <Hongkong v-if="activeMenu === 'hongkong'" />
          <Mongolia v-if="activeMenu === 'mongolia'" />
          <Brunei v-if="activeMenu === 'brunei'" />
          <Philippines v-if="activeMenu === 'philippines'" />
          <Thailand v-if="activeMenu === 'thailand'" />
          <Vietnam v-if="activeMenu === 'vietnam'" />
          <India v-if="activeMenu === 'india'" />
          <Canada v-if="activeMenu === 'canada'" />
          <USA v-if="activeMenu === 'usa'" />
          <Brazil v-if="activeMenu === 'brazil'" />
          <Turkiye v-if="activeMenu === 'turkiye'" />
          <ArabEmirates v-if="activeMenu === 'Arabemirates'" />

          <el-main>
            <div class="main-content-area">
              <div v-if="currentImage">
                <img :src="currentImage" alt="文件資訊" class="main-content-image" />
              </div>
              <div v-else>
                <p>請從左側選單選擇一個項目以查看詳細資訊。</p>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from "vue"; // 注意這裡需要引入 onMounted
import { useDocumentMenuStore } from '@/stores/documentMenuStore'; // 引入你的 Pinia Store



// 上方輪播圖圖片
const images = [
  new URL("../assets/images/visa1.jpg", import.meta.url).href,
  new URL("../assets/images/visa2.jpg", import.meta.url).href,
  new URL("../assets/images/visa3.jpg", import.meta.url).href,
  new URL("../assets/images/visa4.jpg", import.meta.url).href,
  new URL("../assets/images/visa5.jpg", import.meta.url).href,
  new URL("../assets/images/visa6.jpg", import.meta.url).href,
];

// 左側引用到的component元件
// import { ref, computed } from "vue";
import NewChangeup from "@/components/Visa/NewChangeup.vue";
import NewChangedown from "@/components/Visa/NewChangedown.vue";
import Foreignlostup from "@/components/Visa/Foreignlostup.vue";
import Foreignlostdown from "@/components/Visa/Foreignlostdown.vue";
import Domesticlostup from "@/components/Visa/Domesticlostup.vue";
import Domesticlostdown from "@/components/Visa/Domesticlostdown.vue";
import China from "@/components/Visa/China.vue";
import Hongkong from "@/components/Visa/Hongkong.vue";
import Mongolia from "@/components/Visa/Mongolia.vue";
import Brunei from "@/components/Visa/Brunei.vue";
import Philippines from "@/components/Visa/Philippines.vue";
import Thailand from "@/components/Visa/Thailand.vue";
import Vietnam from "@/components/Visa/Vietnam.vue";
import India from "@/components/Visa/India.vue";
import Canada from "@/components/Visa/Canada.vue";
import USA from "@/components/Visa/USA.vue";
import Brazil from "@/components/Visa/Brazil.vue";
import Turkiye from "@/components/Visa/Turkiye.vue";
import ArabEmirates from "@/components/Visa/ArabEmirates.vue";


// 主要內容區的選單圖片
const menuImages = {
  newchangeup: new URL("../assets/images/newchangeup.jpg", import.meta.url).href,
  newchangedown: new URL("../assets/images/newchangedown.jpg", import.meta.url).href,
  foreignlostup: new URL("../assets/images/foreignlostup.jpg", import.meta.url).href,
  foreignlostdown: new URL("../assets/images/foreignlostdown.jpg", import.meta.url).href,
  domesticlostup: new URL("../assets/images/domesticlostup.jpg", import.meta.url).href,
  domesticlostdown: new URL("../assets/images/domesticlostdown.jpg", import.meta.url).href,
  china: new URL("../assets/images/china.jpg", import.meta.url).href,
  hongkong: new URL("../assets/images/hongkong.jpg", import.meta.url).href,
  mongolia: new URL("../assets/images/mongolia.jpg", import.meta.url).href,
  brunei: new URL("../assets/images/brunei.jpg", import.meta.url).href,
  philippines: new URL("../assets/images/philippines.jpg", import.meta.url).href,
  thailand: new URL("../assets/images/thailand.jpg", import.meta.url).href,
  vietnam: new URL("../assets/images/vietnam.jpg", import.meta.url).href,
  india: new URL("../assets/images/india.jpg", import.meta.url).href,
  canada: new URL("../assets/images/canada.jpg", import.meta.url).href,
  usa: new URL("../assets/images/usa.jpg", import.meta.url).href,
  brazil: new URL("../assets/images/brazil.jpg", import.meta.url).href,
  turkiye: new URL("../assets/images/turkiye.jpg", import.meta.url).href,
  Arabemirates: new URL("../assets/images/arab_emirates.jpg", import.meta.url).href,
};



// --- 響應式狀態和邏輯 ---
const activeMenu = ref('newchangeup'); // 預設顯示護照申辦 
const currentImage = computed(() => {
  return menuImages[activeMenu.value];
});// 計算屬性，用於獲取當前圖片的路徑
const documentMenuStore = useDocumentMenuStore();// 存取 Pinia Store
onMounted(() => {
  documentMenuStore.fetchAllDocumentMenus();
});
</script>



<style scoped>
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.main-content-image {
  width: 1500px;
  /* 設定圖片的固定寬度 */
  height: 1000px;
  /* 設定圖片的固定高度 */
  object-fit: cover;
  /* 關鍵：控制圖片如何適應這個固定尺寸 */
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

</style>
