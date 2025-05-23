<!-- 感謝您的訂購 -->
<template>
  <el-row :gutter="20">
    <el-col :span="16">
      <el-alert
        title="您的訂單已經成立，感謝訂購！"
        type="success"
        show-icon
        center
      >
        <template #default>
          我們會為您保留訂單內商品，請在 2025/05/07 (三) 14:48 前完成付款
        </template>
      </el-alert>

      <el-card class="order-info" style="margin-top: 20px;">
        <el-row>
          <el-col :span="6">訂單編號：</el-col>
          <el-col :span="18">15291944</el-col>
        </el-row>
        <el-row>
          <el-col :span="6">訂購項目：</el-col>
          <el-col :span="18">日本簽證 - 日本單次觀光簽證</el-col>
        </el-row>
      </el-card>

      <el-card class="total-amount" style="margin-top: 20px;">
        <div class="amount-header">
          <span>總金額</span>
          <span class="amount">NT$970</span>
          <el-icon><ArrowUp /></el-icon>
        </div>
        <el-collapse>
          <el-collapse-item>
            <template #title>
              日本簽證代辦
            </template>
            <div>$970 x 1 (含運費)</div>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <div class="actions" style="margin-top: 20px; display: flex; gap: 10px;">
        <el-button type="danger" size="large">立即付款</el-button>
        <el-button type="primary" size="large">訂單明細</el-button>
        <el-button size="large">聯絡客服</el-button>
      </div>
    </el-col>
    <el-col :span="8">
      <div class="customer-service">
        <p class="title">您的專屬客服</p>
        <p>薇薇 (02)25221000 分機2611</p>
        <p>週一～週五 08:30 ~ 18:00</p>
        <p>週六～日及國定假日 08:30 ~ 17:00</p>
      </div>
    </el-col>
  </el-row>

  <el-carousel height="200px" style="margin-top: 20px;">
    <el-carousel-item>
      <!-- <img src="url_to_image1.jpg" style="width: 100%; height: 100%; object-fit: cover;"> -->
    </el-carousel-item>
    <el-carousel-item>
      <!-- <img src="url_to_image2.jpg" style="width: 100%; height: 100%; object-fit: cover;"> -->
    </el-carousel-item>
  </el-carousel>
</template>

<script setup>
import { ElAlert, ElCard, ElRow, ElCol, ElCollapse, ElCollapseItem, ElButton, ElCarousel, ElCarouselItem, ElIcon } from 'element-plus';
import { ArrowUp } from '@element-plus/icons-vue';

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
/* 您可以在這裡添加更多的樣式 */
</style>