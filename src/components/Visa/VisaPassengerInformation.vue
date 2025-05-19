<!-- 填寫旅客資訊 -->
<template>
  <el-row>
    <el-col :span="16">
      <el-card class="passenger-info">
        <template #header>
          <div class="card-header">
            <span>填寫旅客資訊</span>
          </div>
        </template>
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
    <!-- <el-col :span="8">
      <el-card class="order-summary">
        <template #header>
          <div class="card-header">
            <span>中華民國護照代辦-新辦/更換(14歲以上)</span>
            <el-tag size="small">商品明細</el-tag>
          </div>
        </template>
        <div class="item">
          中華民國護照代辦-新辦/更換(14歲以上) x 1
          <span class="price">TWD 1,700</span>
        </div>
        <div class="total">
          應付總額
          <span class="total-price">TWD 1,700</span>
        </div>
        <el-button type="primary" size="large" style="width: 100%;">送出訂單資料</el-button>
      </el-card>
    </el-col> -->
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
.passenger-info, .order-summary {
  margin: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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