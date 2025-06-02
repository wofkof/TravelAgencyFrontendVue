<!-- 填寫信用卡資料 -->
<template>
  <el-card class="credit-card">
  <h2 class="title">填寫信用卡資料</h2>
  <el-form label-width="80px">
    <el-form-item label="持卡人卡號">
      <el-input v-model="formData.cardNumberPart1" maxlength="4" style="width: 80px"></el-input>
      -
      <el-input v-model="formData.cardNumberPart2" maxlength="4" style="width: 80px"></el-input>
      -
      <el-input v-model="formData.cardNumberPart3" maxlength="4" style="width: 80px"></el-input>
      -
      <el-input v-model="formData.cardNumberPart4" maxlength="4" style="width: 80px"></el-input>
    </el-form-item>

    <el-form-item label="有效期限">
      <el-select v-model="formData.expiryMonth" placeholder="月份" style="width: 120px">
        <el-option
          v-for="month in months"
          :key="month"
          :label="month"
          :value="month"
        ></el-option>
      </el-select>
      <el-select v-model="formData.expiryYear" placeholder="年份" style="width: 120px; margin-left: 10px;">
        <el-option
          v-for="year in years"
          :key="year"
          :label="year"
          :value="year"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="安全碼">
      <el-input v-model="formData.cvv" maxlength="4" style="width: 100px"></el-input>
      <el-tooltip content="信用卡背面的三位或四位數字" placement="top">
        <el-icon><QuestionFilled /></el-icon>
      </el-tooltip>
    </el-form-item>

    <el-form-item>
      <el-button @click="goBack">返回訂單明細</el-button>

      <el-button type="primary" 
      
      @click="visaRouter.CompletedOrderDetailView"
      
      >確認送出</el-button>

    </el-form-item>
  </el-form>
</el-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const formData = ref({
  cardNumberPart1: '',
  cardNumberPart2: '',
  cardNumberPart3: '',
  cardNumberPart4: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
});

const currentYear = new Date().getFullYear();
const years = computed(() => {
  const yearOptions = [];
  for (let i = 0; i < 10; i++) {
    yearOptions.push(currentYear + i);
  }
  return yearOptions;
});

const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

const goBack = () => {
  console.log('返回訂單明細');
  // 在這裡處理返回邏輯
};

const submitForm = () => {
  console.log('提交表單', formData.value);
  // 在這裡處理提交表單的邏輯，例如驗證資料、發送 API 請求等
  ElMessage.success('付款成功！');
};

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
.credit-card {
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