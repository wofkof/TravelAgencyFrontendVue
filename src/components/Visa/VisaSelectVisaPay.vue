<!-- 選擇付款方式:信用卡, line pay, google pay 付款 -->
<template>
  <el-card class="selet-visapay-card">
     <h2 class="title">選擇付款方式</h2>
       <el-form label-width="80px">
       <el-radio-group v-model="selectedPaymentMethod">
         <el-radio label="credit_card">
           <div style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 150px; text-align: center;">
             <el-icon><CreditCard /></el-icon>
             信用卡
           </div>
        <div v-if="selectedPaymentMethod === 'credit_card'" style="margin-top: 10px; padding-left: 20px;">
          <h3>信用卡選項</h3>
          <el-radio-group v-model="selectedInstallment">
            <el-radio label="一次付清">一次付清</el-radio>
            <el-radio label="3期零利率">3期零利率</el-radio>
            <el-radio label="6期零利率">6期零利率</el-radio>
            </el-radio-group>
        </div>
      </el-radio>
      <el-radio label="mobile_payment">
        <div style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; width: 200px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <el-icon><Smartphone /></el-icon>
            行動電子支付
          </div>
          <el-icon v-if="selectedPaymentMethod === 'mobile_payment'" color="#67C23A"><Check /></el-icon>
        </div>
        <div v-if="selectedPaymentMethod === 'mobile_payment'" style="margin-top: 10px; padding-left: 20px;">
           <h3>選擇支付平台</h3>
          <el-radio-group v-model="selectedMobilePayment">
            <el-radio label="line_pay">
               <div style="display: flex; align-items: center;">
                 <el-icon color="#00C300"><Coin /></el-icon>
                 LINE Pay <el-tag type="success" size="small">LINE Pay</el-tag>
               </div>
            </el-radio>
               <el-radio label="google_pay">
                 <div style="display: flex; align-items: center;">
                 <el-icon><Google /></el-icon>
                 Google Pay <el-tag type="info" size="small">G Pay</el-tag>
                 </div>
               </el-radio>
             </el-radio-group>
           </div>
         </el-radio>
       </el-radio-group>
       <p style="color: #f56c6c; font-size: 12px; margin-top: 10px;">
       僅接受台灣發行之信用卡。
       </p>
       <div style="margin-top: 20px;">
         <el-button>回訂單明細</el-button>
         <el-button
         v-if="selectedPaymentMethod === 'mobile_payment' && selectedMobilePayment === 'line_pay'"
         type="primary"
         style="background-color: #00C300; border-color: #00C300;"
         >
         <div style="display: flex; align-items: center;">
           <el-icon><Coin /></el-icon>
           使用 LINE Pay 付款
         </div>
         </el-button>
         <el-button v-if="selectedPaymentMethod === 'mobile_payment' && selectedMobilePayment === 'google_pay'" type="primary">
         <div style="display: flex; align-items: center;">
           <el-icon><Google /></el-icon>
           使用 Google Pay 付款
         </div>
         </el-button>
           <el-button v-if="selectedPaymentMethod === 'credit_card'" type="primary">
           使用信用卡付款 ({{ selectedInstallment }})
         </el-button>
       </div>
     </el-form>
   </el-card>
</template>

<script setup>
import { ref } from 'vue';
// import { CreditCard, Smartphone, Check, Coin, Google } from '@element-plus/icons-vue';
import { ElTag } from 'element-plus';

const selectedPaymentMethod = ref(''); // 用於追蹤主要的付款方式選擇
const selectedMobilePayment = ref(''); // 用於追蹤行動支付的平台選擇
const selectedInstallment = ref('一次付清'); // 用於追蹤信用卡分期選擇

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
/* 您可以根據需要添加自定義樣式 */
</style>

<style scoped>
.select-visapay-card {
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