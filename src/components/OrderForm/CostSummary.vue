<template>
  <div class="cost-summary-card cost-summary-component">
    <div class="summary-header">
      <span>訂單總金額 ({{ itemCount }}件商品)</span>
      <span>NT$ {{ totalAmount === null || totalAmount === undefined ? '0' : totalAmount.toLocaleString() }}</span>
    </div>
    <hr class="summary-divider">

    <div class="summary-item payment-amount">
      <span>付款金額</span>
      <span class="amount-value">NT$ {{ totalAmount === null || totalAmount === undefined ? '0' : totalAmount.toLocaleString() }}</span>
    </div>
    <div class="summary-item view-items-link" @click="handleViewItemsClick" title="點擊可查看訂單商品明細">
      <span>訂購商品明細</span>
      <el-link type="primary" :underline="false">點此查看 <el-icon><DArrowRight /></el-icon></el-link>
    </div>
    <hr class="summary-divider">
    <div class="summary-status-area">
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

    <template v-if="showPaymentInfo">
      <hr class="summary-divider">
      <div class="summary-item payment-info-area" @click="handlePaymentInfoClick" title="點擊可重新選擇付款方式">
        <span>支付方式</span> <span class="payment-info-text">{{ paymentInfoText }}</span>
      </div>
    </template>

    <div class="submit-button-area">
      <el-button
        type="primary"
        :loading="isSubmitting"
        :disabled="isCheckoutDisabled"
        size="large"
        style="width: 100%;"
        @click="onButtonClick" >
        {{ isSubmitting ? '處理中...' : buttonText }} </el-button>

      <div class="important-notes">
        <p>請注意：</p>
        <ul>
          <li>點擊「{{ buttonText }}」即表示您已閱讀並同意本站的 <a href="/terms" target="_blank">訂購條款</a> 與 <a href="/privacy" target="_blank">服務約定</a>。</li> <li>請在 <span class="timer">{{ paymentTimerDisplay }}</span> 內完成支付流程，逾時訂單可能自動取消。</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed, defineEmits } from 'vue'; // << 新增 defineEmits >>
import { DArrowRight, CircleCheck, CircleClose } from '@element-plus/icons-vue';

const props = defineProps({
  itemCount: { type: Number, required: true, default: 0 },
  totalAmount: { type: Number, required: true, default: 0 },
  selectedPaymentMethod: { type: String, default: null },
  // scrollToPayment: { type: Function, required: true }, // << 在第一階段不再強制需要 >>
  scrollToPayment: { type: Function, default: () => {} }, // << 改為非必須，並提供預設空函數 >>
  isSubmitting: { type: Boolean, default: false },
  isCheckoutDisabled: { type: Boolean, default: true },
  orderItems: { type: Array, default: () => [] },
  ordererStatusMessage: { type: String, default: '請填寫訂購人資料' },
  participantsStatusMessage: { type: String, default: '請填寫旅客資料' },
  scrollToItems: { type: Function, required: true },
  isOrdererBasicInfoFilled: { type: Boolean, default: false },
  areAllParticipantQuantitiesFilled: { type: Boolean, default: false },
  allTravelersValid: { type: Boolean, default: false },

  // << 新增/修改 Props 以適應不同階段 >>
  buttonText: { type: String, default: '前往付款' }, // 按鈕文字，由父組件提供
  showPaymentInfo: { type: Boolean, default: true }, // 是否顯示支付方式區域，預設顯示 (用於付款頁)
  paymentTimerSeconds: { type: Number, default: 30 * 60 } // 支付時限（秒），預設30分鐘
});

// << 新增 emit，因為 native-type="submit" 的按鈕會觸發 form 的 submit 事件，但我們通常在父組件處理 >>
const emit = defineEmits(['submit-order']);

const paymentMethodMap = {
  'NewebPay_CreditCard': '藍新金流(信用卡)',
  'ECPay_CreditCard': '綠界科技(信用卡)',
  'LINEPay': 'LINE Pay',
};

const paymentInfoText = computed(() => {
  if (!props.showPaymentInfo) return ''; // 如果不顯示支付方式，則返回空
  return paymentMethodMap[props.selectedPaymentMethod] || '尚未選擇';
});

const handlePaymentInfoClick = () => {
  if (props.showPaymentInfo && props.selectedPaymentMethod) { // 只有在顯示且已選擇時才觸發滾動
    props.scrollToPayment();
  }
};

const handleViewItemsClick = () => {
  props.scrollToItems();
};

// 新增：用於提交按鈕的點擊事件，它會 emit 一個事件給父組件
const onButtonClick = () => {
  emit('submit-order');
}

// 將秒轉換為 "xx 分鐘" 或 "xx 秒"
const paymentTimerDisplay = computed(() => {
  const minutes = Math.floor(props.paymentTimerSeconds / 60);
  const seconds = props.paymentTimerSeconds % 60;
  if (minutes > 0) {
    return `${minutes} 分鐘` + (seconds > 0 ? ` ${seconds} 秒` : '');
  }
  return `${seconds} 秒`;
});

</script>

<style scoped>

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