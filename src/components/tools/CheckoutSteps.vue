<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { ShoppingCart, Document, CircleCheck, Wallet } from '@element-plus/icons-vue';

// --- 路由 ---
const route = useRoute();

// --- 計算屬性 ---
const activeStepIndex = computed(() => {
  const currentPath = route.path; // 獲取當前完整路徑

  if (currentPath === '/ShoppingCart') {
    return 0;
  } else if (currentPath === '/order-form') {
    return 1;
  } else if (currentPath === '/order-payment') { // 確認付款步驟
    return 2;
  } else if (currentPath.startsWith('/order-complete')) { // 訂購完成步驟調整索引
    return 3;
  }

  return 0;
});

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
          <router-link to="/order-form" class="step-link">填寫資料</router-link>
        </template>
      </el-step>
      <el-step :icon="Wallet">
        <template #title>
          <router-link to="/order-payment" class="step-link">確認付款</router-link>
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
  max-width: 800px;
  margin: 180px auto 20px auto; 
  padding: 15px 15px;
  background-color: #ffffff;
  border-radius: 4px;
}

/* --- 基礎連結樣式 --- */
.step-link {
  color: #909399;
  font-weight: normal;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  cursor: pointer;
}

/* --- 當前活動路由的連結樣式 --- */
.step-link.router-link-exact-active {
  color: #303133;
  font-weight: bold;
}

/* --- 滑鼠懸停在連結上的樣式 (非禁用狀態下) --- */
.step-link:hover {
  color: #409EFF;
}

/* --- 修改點 5：更新禁用未來步驟的 CSS 樣式 (以適應4個步驟) --- */

/* 當處於步驟 0 (購物車頁面) 時 - activeStepIndex = 0 */
.checkout-steps-container.on-step-0 .el-step:nth-child(n+2) .step-link {
  /* 選取第 2, 3, 4 個 el-step */
  color: #c0c4cc !important;
  cursor: not-allowed;
  pointer-events: none;
}

/* 當處於步驟 1 (填寫資料頁面) 時 - activeStepIndex = 1 */
.checkout-steps-container.on-step-1 .el-step:nth-child(n+3) .step-link {
  /* 選取第 3, 4 個 el-step (確認付款, 訂購完成) */
  color: #c0c4cc !important;
  cursor: not-allowed;
  pointer-events: none;
}

/* 當處於步驟 2 (確認付款頁面) 時 - activeStepIndex = 2 */
.checkout-steps-container.on-step-2 .el-step:nth-child(4) .step-link {
  /* 選取第 4 個 el-step (訂購完成) */
  color: #c0c4cc !important;
  cursor: not-allowed;
  pointer-events: none;
}

/* 當處於步驟 3 (訂購完成頁面) 時 - activeStepIndex = 3 */
.checkout-steps-container.on-step-3 .el-step:nth-child(1) .step-link,
.checkout-steps-container.on-step-3 .el-step:nth-child(2) .step-link,
.checkout-steps-container.on-step-3 .el-step:nth-child(3) .step-link {
  /* 選取第 1, 2, 3 個 el-step (購物車, 填寫資料, 確認付款) */
  color: #c0c4cc !important; 
  cursor: not-allowed;
  pointer-events: none;
}

</style>