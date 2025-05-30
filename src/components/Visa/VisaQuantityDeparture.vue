<!-- 選擇件數與出發日 -->
<template>
  <el-card class="order-detail-card">
    <h2 class="title">選擇件數與出發日</h2>
    <el-form label-width="80px">
      <el-form-item label="出發日期">
        <el-date-picker
          v-model="departureDate"
          type="date"
          placeholder="請選擇日期"
        />
      </el-form-item>

      <el-form-item label="選擇件數">
        <el-input-number v-model="quantity" :min="1" />
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="agreement">
          我已完整閱讀並同意本服務<a href="#">訂購須知</a> (包含退貨說明)，並接受所有規定事項
        </el-checkbox>
      </el-form-item>

      <el-form-item>
        <!-- <el-button type="primary" :disabled="!agreement">會員購買</el-button> -->
        <!-- <el-button type="primary" @click="visaRouter.PaymentView">購買</el-button> -->
      </el-form-item>
    </el-form>
  </el-card>
</template>

<!-- 套件來源 -->
<script setup>
import { ref } from 'vue';
const departureDate = ref(null);
const quantity = ref(1);
const agreement = ref(false);

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

</script>


<style scoped>
.order-detail-card {
  /* 區塊的最大寬度 */
  max-width: 1400px;
  /* 頁面中水平置中 */
  margin: 0 auto;
  /* 這個區塊的內邊距 */
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>