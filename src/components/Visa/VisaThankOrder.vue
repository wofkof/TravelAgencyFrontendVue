<!-- 感謝您的訂購 -->
<template>
  <el-card class="thank-order-card">
  <h2 class="title">感謝您的訂購</h2>
  <el-form label-width="80px">
  <el-row :gutter="20">
    <el-col :span="15">
      <el-alert
        title="您的訂單已經成立，感謝訂購！"
        type="success"
        show-icon
        center
      >
      </el-alert> 
      <el-card class="total-amount" style="margin-top: 20px;">
        <div class="amount-header">
          <span>總金額</span>
          <span class="amount">
            NT$970
          </span>
          <el-icon><ArrowUp /></el-icon>
        </div>

        <el-collapse>
          <el-collapse-item>

            <template #title>
              申請明細
            </template>
            <el-row>
          <el-col :span="6">申請類型：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">申辦項目：</el-col>
          <el-col :span="18">日本簽證 - 日本單次觀光簽證</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">案件類型：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">費用：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">中文姓：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">中文名：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">英文姓：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">英文名：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">取件方式：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
          </el-collapse-item>
        </el-collapse>

      </el-card>

      <div class="actions" style="margin-top: 20px; display: flex; gap: 10px;">
        <el-button type="primary" size="large">
            返回首頁
        </el-button>
      </div>
    </el-col>
  </el-row>

  <el-carousel height="200px" style="margin-top: 20px;">
    <el-carousel-item>
      <!-- <img src="/usa.jpg" style="width: 100%; height: 100%; object-fit: cover;"> -->
    </el-carousel-item>
    <el-carousel-item>
      <!-- <img src="/china.jpg" style="width: 100%; height: 100%; object-fit: cover;"> -->
    </el-carousel-item>
  </el-carousel>

</el-form>
 </el-card>
</template>

<script setup>
import { ElAlert, ElCard, ElRow, ElCol, ElCollapse, ElCollapseItem, ElButton, ElCarousel, ElCarouselItem, ElIcon } from 'element-plus';
import { ArrowUp } from '@element-plus/icons-vue';

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
// import chinaImage from '@/assets/china.jpg';
// import usaImage from '@/assets/usa.jpg'
</script>

<style scoped>
.thank-order-card {
  /* 區塊的最大寬度 */
  max-width: 1400px;
  /* 頁面中水平置中 */
  margin: 0 auto;
  /* 這個區塊的內邊距 */
  padding: 20px;
}

.title {
  font-size: 64px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>