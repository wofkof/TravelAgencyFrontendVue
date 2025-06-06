<template>
  <div class="payment-options-component">
    <el-radio-group :model-value="modelValue" @update:modelValue="handleChange" class="payment-radio-group">
      <el-radio
        v-for="option in paymentMethods"
        :key="option.value"
        :value="option.value"
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
import { ref } from 'vue'; // 移除了 computed, watch, reactive 因為在這個簡化版中未使用
import { SuccessFilled } from '@element-plus/icons-vue'; // 打勾圖示

const props = defineProps({
  modelValue: { // 從父組件的 v-model="formData.paymentMethod" 傳入
    type: String,
    default: null,
  },
});

const emits = defineEmits(['update:modelValue']);

// 只保留 ECPay 的支付方式
const paymentMethods = ref([
  {
    value: 'ECPay_CreditCard',
    label: '綠界科技(信用卡)',
    imgSrc: '/images/Ecpay.png', // 請確保此圖片路徑是正確的
  }
]);

const handleChange = (value) => {
  emits('update:modelValue', value);
};

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

/* 信用卡表單容器樣式 (如果不需要顯示信用卡表單，這段可以考慮移除或註解) */
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