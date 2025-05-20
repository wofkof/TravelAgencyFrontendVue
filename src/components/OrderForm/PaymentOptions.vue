<template>
  <div class="payment-options-component">
    <el-radio-group :model-value="modelValue" @update:modelValue="handleChange" class="payment-radio-group">
      <el-radio
        v-for="option in paymentMethods"
        :key="option.value"
        :label="option.value"
        border
        class="payment-radio-card"
        :class="{ 'is-selected-style': modelValue === option.value }"
      >
        <div class="payment-option-content">
          <img v-if="option.imgSrc" :src="option.imgSrc" :alt="option.label" class="payment-icon" />
          <el-icon v-else-if="option.icon" :size="24" class="payment-icon"><component :is="option.icon" /></el-icon>
          <span class="payment-label">{{ option.label }}</span>
        </div>
        <el-icon v-if="modelValue === option.value" class="selected-checkmark"><SuccessFilled /></el-icon>
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue';// 引入 Element Plus 圖標
import { SuccessFilled } from '@element-plus/icons-vue'; // 打勾圖示

// 有一個信用卡表單組件
// import CreditCardForm from './CreditCardForm.vue';

const props = defineProps({
  modelValue: { // 從父組件的 v-model="formData.paymentMethod" 傳入
    type: String,
    default: null,
  },
  // 如果信用卡數據也需要由父組件管理，可以通過 props 傳入並 emit 更新
  // creditCardInfo: {
  //   type: Object,
  //   default: () => ({ cardHolderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvc: '' }),
  //   required: true
  // }
});

const emits = defineEmits(['update:modelValue']);

const paymentMethods = ref([
  {
    value: 'ECPay_CreditCard',
    label: '綠界科技(信用卡)',
    imgSrc: '/images/Ecpay.png',
  },
  {
    value: 'LINEPay',
    label: 'LINE Pay',
    icon: null,
  }
]);

// // 信用卡表單數據模型
// const creditCardData = reactive({
//   cardHolderName: '',
//   cardNumber: '',
//   expiryMonth: '',
//   expiryYear: '',
//   cvc: ''
// });

// // 監聽內部 creditCardData 的變化，並通知父組件 (如果需要)
// watch(creditCardData, (newValue) => {
//   // 如果 OrderForm.vue 需要這些數據，則 emit
//   emits('update:creditCardInfo', newValue);
// });


// const getImageUrl = (name) => {
//   const pathPrefix = name.startsWith('payment/') ? '/images/' : '/images/payment/';
//   return `${pathPrefix}${name.replace('payment/', '')}`;
// };

const handleChange = (value) => {
  emits('update:modelValue', value);
};

// // 計算是否顯示信用卡表單
// const showCreditCardForm = computed(() => {
//   if (!props.modelValue) return false;
//   // 檢查選擇的支付方式是否為信用卡類型
//   return props.modelValue.endsWith('CreditCard');
// });

// // 處理信用卡表單驗證狀態變化的事件
// const handleCreditCardFormValidity = (isValid) => {
//   emits('creditCardFormValidityChanged', isValid);
// };

</script>

<style scoped>
.payment-options-component {
  padding: 10px 0;
}

.payment-radio-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-radio-card {
  width: 100%;
  height: auto;
  margin-right: 0 !important;
  padding: 15px 20px; /* 增加內邊距以容納打勾圖示 */
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent; /* 預設透明邊框，方便選中時變色 */
  position: relative; /* 為了打勾圖示的絕對定位 */
}

/* Element Plus radio 的 label 區域，我們用來放自訂內容 */
.payment-radio-card:deep(.el-radio__label) {
  padding-left: 0;
  width: 100%; /* 確保我們的內容能撐開 */
}
/* 隱藏原生的 radio input 圓點，因為我們用卡片選中效果 */
.payment-radio-card:deep(.el-radio__inner) {
  display: none;
}


.payment-option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.payment-icon.el-icon { /* 如果是 Element Icon */
  font-size: 32px; /* 調整 Element Icon 大小 */
}

.payment-label {
  font-size: 1em;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 選中時的樣式 */
.payment-radio-card.is-selected-style {
  border-color: #67C23A; /* Element Plus 成功的綠色 */
  background-color: #f0f9eb; /* Element Plus 成功狀態的淺綠背景 */
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.3); /* 輕微的綠色光暈 */
}

.selected-checkmark {
  position: absolute;
  top: 50%;
  right: 20px; /* 調整打勾圖示位置 */
  transform: translateY(-50%);
  font-size: 24px; /* 調整打勾圖示大小 */
  color: #ffffff; /* 白色打勾 */
  background-color: #67C23A; /* 綠色背景 */
  border-radius: 50%; /* 圓形背景 */
  padding: 2px; /* 微調使打勾在圓圈內更居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 信用卡表單容器樣式 */
.credit-card-form-container {
  margin-top: 25px;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background-color: #fdfdfd;
}
.credit-card-form-container h4 {
  margin-top: 0;
  margin-bottom: 18px;
  font-size: 1.1em;
  color: var(--el-text-color-primary);
}
</style>