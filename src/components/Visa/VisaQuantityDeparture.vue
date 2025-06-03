<!-- 選擇件數與出發日 -->
<template>
   <el-card class="order-detail-card">
     <h2 class="title">選擇件數與出發日</h2>
     <el-form label-width="80px">
         <el-form-item label="出發日期">
           <el-date-picker
             v-model="orderFormStore.data.DepartureDate" type="date"
             placeholder="請選擇日期"
             style="width: 100%;"
             value-format="YYYY-MM-DD"
             @change="handleDateChange"
            />
           </el-form-item>

         <el-form-item label="選擇件數">
           <el-input-number
           v-model="orderFormStore.data.ProcessingQuantity" :min="1"
           @change="handleQuantityChange"
          />
         </el-form-item>

         <el-form-item>
           <el-checkbox v-model="agreement">
             我已完整閱讀並同意本服務<a href="#">訂購須知</a> (包含退貨說  明)，並接受所有規定事項
           </el-checkbox>
         </el-form-item>
     </el-form>
   </el-card>
</template>

<!-- 套件來源 -->
<script setup>
import { ref } from 'vue'
import { useOrderFormStore } from '@/stores/orderForm'; // 引入 Pinia Store
import { ElMessage } from 'element-plus'; // ElMessage 可以在需要時用於組件內部驗證提示

import useVisaRouter from "@/utils/visaRouterHelp";
import api from '@/utils/api' // 假設你的 API 工具程式碼已正確引入
import { defineProps, defineEmits } from 'vue'; // 引入 defineProps 和 defineEmits

const orderFormStore = useOrderFormStore();
const agreement = ref(false);
const visaRouter = useVisaRouter();

const handleDateChange = (value) => {
  console.log('出發日期已更新:', orderFormStore.data.DepartureDate);
};

const handleQuantityChange = (value) => {
  console.log('辦理件數已更新:', orderFormStore.data.ProcessingQuantity);
};
</script>

<style scoped>
.order-detail-card {
  max-width: 1400px;/* 區塊的最大寬度 */
  margin: 0 auto;/* 頁面中水平置中 */
  padding: 20px;/* 這個區塊的內邊距 */
   border-radius: 8px; /* Element Plus card 通常會有圓角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* Element Plus card 的陰影效果 */
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133; /* 常用字體顏色 */
  border-bottom: 1px solid #EBEEF5; /* 輕微分隔線 */
  padding-bottom: 15px;
}

/* 確保 Element Plus 的 form-item 樣式正確應用 */
.el-form-item {
  margin-bottom: 22px;
}

/* 調整 input number 的寬度以適應佈局 */
.el-input-number {
    width: 100%; /* 讓它與日期選擇器對齊 */
}
</style>