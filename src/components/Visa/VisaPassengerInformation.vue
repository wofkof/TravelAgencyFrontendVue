<!-- 填寫旅客資訊 -->
<template>
  <el-row  style="justify-content: center;">
    <el-col :span="18">
      <el-card class="passenger-info">
         <h2 class="title">填寫旅客資訊</h2>
         <el-form label-width="80px">
          <el-form-item label="旅客 1">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="中文姓名">
                  <el-input placeholder="姓"></el-input>
                  <el-input placeholder="名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="性別">
                  <el-select placeholder="請選擇">
                    <el-option label="男" value="male"></el-option>
                    <el-option label="女" value="female"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="英文姓名">
                  <el-input placeholder="姓 (例) LEE"></el-input>
                  <el-input placeholder="名 (例) DATUNG"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <div class="passport-note">
              同護照拼音，無須符號或空格 <el-link type="primary" :underline="false">護照範例</el-link>
            </div>
          </el-form-item>

          <el-form-item label="出生日期">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-select placeholder="西元年">
                  <el-option v-for="year in years" :key="year" :label="year" :value="year"></el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select placeholder="月">
                  <el-option v-for="month in months" :key="month" :label="month" :value="month"></el-option>
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select placeholder="日">
                  <el-option v-for="day in days" :key="day" :label="day" :value="day"></el-option>
                </el-select>
              </el-col>
            </el-row>
           </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, computed } from 'vue';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const days = computed(() => {
  const selectedYear = parseInt(year.value);
  const selectedMonth = parseInt(month.value);
  if (selectedYear && selectedMonth) {
    return Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, index) => index + 1);
  }
  return [];
});

const year = ref('');
const month = ref('');
const day = ref('');

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
.passenger-info {
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

.passport-note {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}

.order-summary .item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-summary .price {
  font-weight: bold;
}

.order-summary .total {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.order-summary .total-price {
  font-size: 1.5em;
  color: #f56c6c;
  font-weight: bold;
}
</style>