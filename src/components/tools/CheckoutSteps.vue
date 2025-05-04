<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// 匯入需要的圖標
import { ShoppingCart, Document, CircleCheck } from '@element-plus/icons-vue';

// 在這個元件內部取得路由資訊
const route = useRoute();

// 計算目前活動步驟的索引 (邏輯與之前在 App.vue 中相同)
const activeStepIndex = computed(() => {
  switch (route.path) {
    case '/cart': return 0;
    case '/order-form': return 1;
    case '/order-complete': return 3; // 完成狀態
    default: return 0;
  }
});

</script>

<template>
  <div class="checkout-steps-container">
    <el-steps :active="activeStepIndex" finish-status="success" simple>
      <el-step :icon="ShoppingCart">
        <template #title>
          <router-link to="/cart" class="step-link">購物車</router-link>
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
/* 將之前 App.vue 中與步驟條相關的樣式移到這裡 */
.checkout-steps-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 15px;
  background-color: #ffffff;
  /* 可以在這裡保留 border 或 shadow，或者在 App.vue 中控制外層樣式 */
  /* border-bottom: 1px solid #eee; */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); */
}

:deep(.el-step__title) {
  cursor: pointer;
}

.step-link {
  color: #909399;
  font-weight: normal;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

:deep(.el-step__title) .step-link.router-link-exact-active {
  color: #303133;
  font-weight: bold;
}

:deep(.el-step__title) .step-link:hover {
  color: #409EFF;
}
</style>