<!-- 主要頁面結構 包含標題、選單、內容區域等-->
<template>
  <div class="visa-page visaView">
    <!-- 整個護照簽證頁面的最外層容器，用來包裹所有相關的內容。 -->
    <div class="visa-bg_ilNvD">
      <!-- 這個 div 可能是用來設定頁面頂部的背景樣式。 -->
      <div class="container">
         <!-- 這個 div 通常用作一個容器，將其內部的內容水平居中並限制最大寬度，以確保在不同螢幕尺寸上的良好閱讀體驗。 -->
        <h1 class="visa title_UUrw">護照、簽證</h1>
         <!-- 這是一個標題 (<h1>)，顯示頁面的主要內容是關於「護照、簽證」。 -->
      </div>
    </div>

    <div class="visa menuBg_B2ne">
      <!-- 這個 div 可能是用來設定選單區域的背景樣式。 -->
      <div class="container">
        <!-- 同樣是用來水平居中和限制選單內容寬度的容器。 -->
        <div class="visa menuWrapper_dWDZK">
          <!-- 這個 div 包裹著選單的內容。 -->
          <div class="visa tabWrapper_qDIAX flex">
            <!-- 這個 div 看起來是用來包含標籤頁 (el-tabs)，並且使用了 Flexbox 佈局 (flex) 來排列標籤。 -->
            <el-tabs type="border-card">
              <!-- 這是一個 Element UI 的標籤頁組件，樣式設定為帶邊框的卡片風格。 -->
              <el-tab-pane label="護照申辦"></el-tab-pane>
              <el-tab-pane label="各國簽證"></el-tab-pane>
              <!-- 這些是標籤頁的窗格，每個窗格都有一個標籤（選項一、選項二、選項三），點擊這些標籤可能會顯示不同的護照或簽證相關資訊。 -->
              </el-tabs>
          </div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: center; align-items: center;">
      <img
        src="@/assets/images/passport-icon.png"
        alt="World Map"
        style="width: 200px; margin-left: 300px; margin: auto;">
      <div class="world-map-container">
        <WorldMap />
      </div>
    </div>
      <!-- 這是一個 HTML 的 <div> 元素，它作為一個容器，用來包裹世界地圖的元件。class="world-map-container" 是一個 CSS 類別名稱，可以用於設定這個容器的樣式，例如寬度、高度、邊框等等，以便控制世界地圖的顯示方式。 -->

    <div class="container">
      <div class="visa listWrapper__WFGpm">
        <div style="opacity: 1; transform: translate3d(0px, 0px, 0px);">
          <h2>列表內容</h2>
          <el-card class="box-card" style="margin-bottom: 20px;">
            <template #header>
              <div class="card-header">
                <span>標題一</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容一</div>
          </el-card>

          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

<el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>標題二</span>
                <el-button class="button" text>操作</el-button>
              </div>
            </template>
            <div>內容二</div>
          </el-card>

          </div>
      </div>
    </div>
  </div>
</template>



<script setup>
import WorldMap from '@/components/Visa/WorldMap.vue'; // 確保 WorldMap 組件已正確引入
import BaseButton from '@/components/Visa/BaseButton.vue';
import BaseForm from '@/components/Visa/BaseForm.vue';
import { ref } from 'vue';
// 你可以在這裡處理頁面的邏輯
const formData = ref({});

const handleButtonClick = () => {
  alert('按鈕被點擊了！');
};

const handleFormSubmit = (data) => {
  console.log('表單提交的資料：', data);
};
</script>





<style scoped>
.visaView {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.world-map-container {
  width: 700px; /* 設定寬度為 300 像素 */
  /* 設定高度為 200 像素 */
   margin: auto;
   ;/* 或者 absolute 或 fixed */
  /* 相對於其原始位置向右移動 20 像素 */
  /* 你也可以使用百分比或其他 CSS 單位 */
  /* left: 8%; */
}

.visa-page {
  /* 你的頁面通用樣式 */
}

.visa-bg_ilNvD {
  background-color: #f0f2f5; /* 示例背景色 */
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.visa.title_UUrw {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.visa.menuBg_B2ne {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, .1);
  padding: 10px 0;
  margin-bottom: 20px;
}

.visa.menuWrapper_dWDZK {
  /* 選單容器樣式 */
}

.visa.tabWrapper_qDIAX {
  /* Tab 選單容器樣式 */
}

.visa.mapWrapper_Z1NDS {
  margin-bottom: 20px;
}

.konvajs-content {
  border: 1px solid #ccc; /* 示例樣式 */
}

.visa.listWrapper__WFGpm {
  /* 列表容器樣式 */
}

.box-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>