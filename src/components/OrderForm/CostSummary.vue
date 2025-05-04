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
  
      <div class="summary-item payment-info" @click="handlePaymentInfoClick" title="點擊可重新選擇付款方式">
        <span>{{ paymentInfoText }}</span>
      </div>
  
      <div class="submit-button-area">
          <button type="submit" :disabled="isCheckoutDisabled">
              {{ isSubmitting ? '提交中...' : '確認付款' }} </button>
           </div>
  
    </div>
  </template>
  
  <script setup>
  import { defineProps, computed } from 'vue';
  
  const props = defineProps({
    itemCount: { // **新增：商品總件數**
      type: Number,
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    selectedPaymentMethod: { // **新增：選擇的付款方式值**
      type: String, // 或 null
      default: null
    },
    scrollToPayment: { // **新增：滾動到付款方式的函式**
      type: Function,
      required: true
    },
      // --- **新增 props** ---
    isSubmitting: { // 是否正在提交
        type: Boolean,
        default: false
    },
    isCheckoutDisabled: { // 按鈕是否禁用
        type: Boolean,
        default: true // 預設禁用
    }
  });
  
  // 付款方式顯示名稱映射
  const paymentMethodNames = {
      CreditCard: '信用卡',
      BankTransfer: '銀行轉帳'
      // 可以添加更多...
  };
  
  // 計算支付方式提示文字
  const paymentInfoText = computed(() => {
      const selectedMethodName = props.selectedPaymentMethod ? paymentMethodNames[props.selectedPaymentMethod] || props.selectedPaymentMethod : ''; // 如果找不到映射，直接顯示值
      if (selectedMethodName) {
          return `支付方式為 ${selectedMethodName}，您可以重選付款方式。`;
      } else {
          return '支付方式為 ，您可以重選付款方式。';
      }
  });
  
  // 點擊支付方式文字時觸發父元件傳來的滾動函式
  const handlePaymentInfoClick = () => {
      props.scrollToPayment();
  };
  
  </script>
  
  <style scoped>
  .cost-summary-card {
    background-color: #ffffff; /* 卡片背景色 */
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    /* margin-bottom: 20px; */ /* 由父元件控制 */
  }
  
  .summary-header {
  display: flex;
  justify-content: space-between;
  font-weight: 500; /* 稍微加粗 */
  margin-bottom: 15px;
  color: #333; /* 標題顏色深一點 */
}
.summary-header span:last-child {
    font-weight: bold; /* 金額加粗 */
}
  
  .summary-divider {
    border: none;
    border-top: 1px solid #eee; /* 分隔線用實線 */
    margin: 15px 0;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center; /* 垂直居中 */
    margin-bottom: 15px;
    font-size: 1em;
    color: #333;
  }
  
  .summary-item span:first-child {
      color: #555; /* 標題顏色稍淡 */
  }
  
  .payment-amount .amount-value {
    font-size: 1.5em; /* 付款金額字體加大 */
    font-weight: bold;
    color: #dc3545; /* 付款金額用醒目顏色 */
  }
  .payment-info {
      font-size: 0.9em;
      color: #666;
      cursor: pointer; /* 提示可點擊 */
      margin-top: 20px; /* 與上方元素間隔 */
      padding-top: 15px; /* 頂部內邊距 */
      border-top: 1px dashed #ccc; /* 用虛線分隔 */
      text-align: left;
  }
  .payment-info:hover {
      color: #007bff; /* 滑鼠懸停時變色 */
  }
  /* --- **新增：按鈕區域樣式** --- */
.submit-button-area {
    margin-top: 25px; /* 與上方元素間隔 */
    padding-top: 20px; /* 頂部內邊距 */
    border-top: 1px solid #eee; /* 頂部分隔線 */
    text-align: center;
}

/* 按鈕樣式 (從 OrderForm 移過來) */
.submit-button-area button {
    width: 100%; /* 按鈕寬度 100% */
    padding: 12px 20px;
    cursor: pointer;
    background-color: #007bff; /* 主題藍色 */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1em; /* 按鈕文字稍大 */
    font-weight: bold;
    transition: background-color 0.2s ease;
}
.submit-button-area button:hover {
    background-color: #0056b3;
}
.submit-button-area button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: #aaa;
}
  </style>