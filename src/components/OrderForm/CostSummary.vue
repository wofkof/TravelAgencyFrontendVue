<template>
  <div class="cost-summary-card cost-summary-component">
    <div class="summary-header">
      <span>訂單總金額 ({{ itemCount }}件商品)</span>
      <span>NT$ {{ totalAmount }}</span>
    </div>

    <hr class="summary-divider">

    <div class="summary-item payment-amount">
      <span>付款金額</span>
      <span class="amount-value">NT$ {{ totalAmount }}</span>
    </div>

    <div class="summary-item view-items-link" @click="handleViewItemsClick" title="點擊可查看訂單商品明細">
         <span>訂購商品明細</span>
         <el-link type="primary" :underline="false">點此查看 <el-icon><DArrowRight /></el-icon></el-link>
     </div>
    <hr class="summary-divider"> <div class="summary-status-area">
         <div class="status-item">
             <span>訂購人資料</span>
             <span :class="{'status-complete': isOrdererBasicInfoFilled, 'status-incomplete': !isOrdererBasicInfoFilled}">
                 <el-icon v-if="isOrdererBasicInfoFilled"><CircleCheck /></el-icon>
                 <el-icon v-else><CircleClose /></el-icon>
                 {{ ordererStatusMessage }}
             </span>
         </div>
         <div class="status-item">
             <span>旅客資料</span>
             <span :class="{'status-complete': areAllParticipantQuantitiesFilled && allTravelersValid, 'status-incomplete': !areAllParticipantQuantitiesFilled || !allTravelersValid}">
                 <el-icon v-if="areAllParticipantQuantitiesFilled && allTravelersValid"><CircleCheck /></el-icon>
                 <el-icon v-else><CircleClose /></el-icon>
                 {{ participantsStatusMessage }}
             </span>
         </div>
          </div>
     <hr class="summary-divider"> <div class="summary-item payment-info-area" @click="handlePaymentInfoClick" title="點擊可重新選擇付款方式">
        <span>支付方式</span> <span class="payment-info-text">{{ paymentInfoText }}</span>
    </div>


    <div class="submit-button-area">
      <el-button
        type="primary"
        native-type="submit"
        :loading="isSubmitting"
        :disabled="isCheckoutDisabled"
        size="large"
        style="width: 100%;"
      >
        {{ isSubmitting ? '提交中...' : '確認付款' }}
      </el-button>

      <div class="important-notes">
           <p>請注意：</p>
           <ul>
               <li>點擊「確認付款」即表示您已閱讀並同意本站的 <a href="#" target="_blank">訂購條款</a> 與 <a href="#" target="_blank">服務約定</a>。</li>
               <li>請在 <span class="timer">30</span> 分鐘內完成支付流程，逾時訂單可能自動取消。</li>
               </ul>
      </div>
    </div>

  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { DArrowRight, CircleCheck, CircleClose } from '@element-plus/icons-vue'; // 引入圖標


const props = defineProps({
  itemCount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  selectedPaymentMethod: { type: String, default: null },
  scrollToPayment: { type: Function, required: true },
  isSubmitting: { type: Boolean, default: false },
  isCheckoutDisabled: { type: Boolean, default: true },
  // **新增 props**
  orderItems: { type: Array, default: () => [] }, // 訂單商品列表 (用於滾動連結)
  ordererStatusMessage: { type: String, default: '請填寫訂購人資料' }, // 訂購人狀態訊息
  participantsStatusMessage: { type: String, default: '請填寫旅客資料' }, // 旅客狀態訊息
  scrollToItems: { type: Function, required: true }, // 滾動到商品區塊的函式

  // 從 OrderForm 獲取更精確的驗證狀態
  isOrdererBasicInfoFilled: { type: Boolean, default: false },
  areAllParticipantQuantitiesFilled: { type: Boolean, default: false },
  allTravelersValid: { type: Boolean, default: false }, // 旅客資料是否通過 ItemParticipantForm 的所有驗證
});

// 擴充付款方式顯示名稱映射
const paymentMethodMap = {
  'NewebPay_CreditCard': '藍新金流(信用卡)',
  'ECPay_CreditCard': '綠界科技(信用卡)',
  'LINEPay': 'LINE Pay',
  // ... 其他支付方式
};

// 計算支付方式顯示文字
const paymentInfoText = computed(() => {
    const selectedMethodLabel = paymentMethodMap[props.selectedPaymentMethod] || '尚未選擇';
    return selectedMethodLabel;
});

// 點擊支付方式文字區域時觸發父元件傳來的滾動函式
const handlePaymentInfoClick = () => {
    if (props.selectedPaymentMethod) {
       props.scrollToPayment();
    }
};

// **新增：點擊查看商品明細時觸發父元件傳來的滾動函式**
const handleViewItemsClick = () => {
    props.scrollToItems();
};

</script>

<style scoped>
/* **套用 Element Plus CSS 變數和組件樣式** */

/* 整體卡片容器 */
.cost-summary-card {
  background-color: var(--el-fill-color-blank, #ffffff);
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: var(--el-border-radius-base, 4px);
  padding: 20px;
  box-shadow: var(--el-box-shadow-light, 0 2px 12px 0 rgba(0,0,0,0.1));
}

/* 標題區塊 */
.summary-header {
  display: flex;
  justify-content: space-between;
  font-weight: var(--el-font-weight-primary, 500);
  margin-bottom: 15px;
  color: var(--el-text-color-primary, #303133);
}
.summary-header span:last-child {
  font-weight: var(--el-font-weight-bold, bold);
}

/* 分隔線 */
.summary-divider {
  border: none;
  border-top: 1px solid var(--el-border-color-extra-light, #f0f2f5);
  margin: 15px 0;
}

/* 單個摘要項目 (如付款金額) */
.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: var(--el-font-size-base, 14px);
  color: var(--el-text-color-regular, #606266);
}

/* 摘要項目的標籤 */
.summary-item span:first-child {
    color: var(--el-text-color-secondary, #909399);
}

/* 付款金額的值 */
.payment-amount .amount-value {
  font-size: 1.5em;
  font-weight: var(--el-font-weight-bold, bold);
  color: var(--el-color-danger, #f56c6c);
}

/* **新增：查看商品明細連結樣式** */
.view-items-link {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
    cursor: pointer;
    margin-bottom: 15px;
    /* 可以添加 border-bottom 或其他樣式與上方分隔 */
}
.view-items-link .el-link {
    font-size: inherit; /* 繼承父容器字體大小 */
}
.view-items-link .el-link .el-icon {
    /* 微調圖標與文字對齊 */
    vertical-align: -0.15em; /* 根據字體調整 */
    margin-left: 2px;
}


/* **新增：訂購人/旅客資料狀態區塊樣式** */
.summary-status-area {
    margin-top: 15px;
    margin-bottom: 15px;
    padding-top: 15px;
    border-top: 1px dashed var(--el-border-color-light);
}
.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-regular);
    margin-bottom: 8px;
}
.status-item:last-child {
    margin-bottom: 0;
}
.status-item span:first-child {
     color: var(--el-text-color-secondary); /* 狀態項目的標籤顏色 */
}
.status-item span:last-child {
     font-weight: var(--el-font-weight-primary); /* 狀態文字加粗 */
     display: flex; /* 讓圖標和文字並排 */
     align-items: center;
     gap: 4px; /* 圖標和文字間距 */
}
.status-complete {
    color: var(--el-color-success, #67c23a); /* 完成狀態用綠色 */
}
.status-incomplete {
    color: var(--el-color-warning, #e6a23c); /* 待填寫/有誤狀態用黃色 */
}


/* 支付方式資訊區域 (可點擊) */
.payment-info-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-regular);
    cursor: pointer;
    margin-top: 20px; /* 調整與上方分隔線的距離 */
    padding-top: 15px;
    border-top: 1px dashed var(--el-border-color-light);
    text-align: right;
}

.payment-info-text {
    font-weight: var(--el-font-weight-primary);
    color: var(--el-color-primary);
}

.payment-info-area:hover {
    color: var(--el-color-primary-light-1);
}


/* 按鈕區域樣式 */
.submit-button-area {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
  text-align: center;
}

/* **新增：重要提示區塊樣式** */
.important-notes {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dashed var(--el-border-color-extra-light); /* 提示區用更淺的虛線 */
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
    text-align: left;
}
.important-notes p {
    margin-top: 0;
    margin-bottom: 8px;
    font-weight: var(--el-font-weight-primary); /* 提示標題加粗 */
    color: var(--el-text-color-regular);
}
.important-notes ul {
    list-style: disc; /* 列表使用圓點 */
    padding-left: 20px; /* 列表縮進 */
    margin: 0;
}
.important-notes li {
    margin-bottom: 5px;
    line-height: 1.4; /* 行高 */
}
.important-notes li:last-child {
    margin-bottom: 0;
}
.important-notes a {
    color: var(--el-color-primary); /* 連結顏色 */
    text-decoration: none; /* 無下劃線 */
}
.important-notes a:hover {
    text-decoration: underline; /* 懸停時加下劃線 */
}
.important-notes .timer {
    color: var(--el-color-danger); /* 計時器數字用紅色 */
    font-weight: var(--el-font-weight-bold);
}

</style>