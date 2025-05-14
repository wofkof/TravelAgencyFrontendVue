<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// 匯入需要的 Element Plus 圖標組件
import { ShoppingCart, Document, CircleCheck } from '@element-plus/icons-vue';

// --- 路由 ---
// 獲取當前路由資訊，以判斷處於哪個步驟
const route = useRoute();

// --- 計算屬性 ---
/**
 * 計算目前活動步驟的索引 (0-based)。
 * /ShoppingCart      -> 步驟 0
 * /order-form -> 步驟 1
 * /order-complete -> 步驟 2 (標示訂購完成步驟為當前或已完成)
 */
const activeStepIndex = computed(() => {
  switch (route.path) {
    case '/ShoppingCart': return 0;
    case '/order-form': return 1;
    case '/order-complete': return 2; // 完成步驟對應索引 2
    default: return 0; // 如果路由不匹配，默認顯示購物車步驟
  }
});

// Element Plus 組件和圖標通常在 main.js 全域註冊，此處無需導入 ElSteps, ElStep
// 但圖標因為是用 :icon 綁定變數，所以仍需在此導入
</script>

<template>
  <div class="checkout-steps-container" :class="`on-step-${activeStepIndex}`">
    <el-steps :active="activeStepIndex" finish-status="success" simple>
      <el-step :icon="ShoppingCart">
        <template #title>
          <router-link to="/ShoppingCart" class="step-link">購物車</router-link>
        </template>
      </el-step>
      <el-step :icon="Document">
        <template #title>
          <router-link to="/order-form" class="step-link">填寫資料與付款</router-link>
        </template>
      </el-step>
      <el-step :icon="CircleCheck">
         <template #title>
          <router-link to="/order-complete" class="step-link">訂購完成</router-link>
        </template>
      </el-step>
    </el-steps>
  </div>
</template>

<style scoped>
/* 步驟條容器樣式 */
.checkout-steps-container {
  max-width: 800px; /* 限制最大寬度 */
  margin: 180px auto 20px auto; 
  padding: 15px 15px; /* 內邊距 */
  background-color: #ffffff; /* 白色背景 */
  border-radius: 4px; /* 可選：小圓角 */
}

/* --- 基礎連結樣式 --- */
.step-link {
  color: #909399; /* 預設灰色 (Element Plus 次要文字顏色) */
  font-weight: normal;
  text-decoration: none; /* 去除底線 */
  transition: color 0.2s ease-in-out; /* 顏色變化動畫 */
  cursor: pointer; /* 顯示可點擊指標 */
}

/* --- 當前活動路由的連結樣式 --- */
/* 利用 Vue Router 自動添加的 class 來高亮當前步驟 */
.step-link.router-link-exact-active {
  color: #303133; /* 主要文字顏色 */
  font-weight: bold; /* 加粗 */
}

/* --- 滑鼠懸停在連結上的樣式 (非禁用狀態下) --- */
.step-link:hover {
  color: #409EFF; /* Element Plus 主題藍色 */
}

/* --- 新增：禁用未來步驟的樣式 --- */

/* 當處於步驟 0 (購物車頁面) 時 */
.checkout-steps-container.on-step-0 .el-step:nth-child(n+2) .step-link {
  /* :nth-child(n+2) 選取第 2 個及之後的所有 el-step */
  color: #c0c4cc !important; /* 強制設為禁用灰色 (Element Plus 禁用文字顏色) */
  cursor: not-allowed; /* 顯示禁止圖示 */
  pointer-events: none; /* 禁用滑鼠事件，使其不可點擊 */
}

/* 當處於步驟 1 (填寫資料頁面) 時 */
.checkout-steps-container.on-step-1 .el-step:nth-child(3) .step-link {
  /* :nth-child(3) 選取第 3 個 el-step (訂購完成) */
  color: #c0c4cc !important; /* 強制設為禁用灰色 (Element Plus 禁用文字顏色) */
  cursor: not-allowed; /* 顯示禁止圖示 */
  pointer-events: none; /* 禁用滑鼠事件，使其不可點擊 */
}

</style>