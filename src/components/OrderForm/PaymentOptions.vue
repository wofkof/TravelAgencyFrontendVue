<template>
    <div class="payment-options">
      <h3>付款方式</h3>
      <div>
        <label>
          <input type="radio" value="CreditCard" :checked="modelValue === 'CreditCard'"
                 @change="$emit('update:modelValue', 'CreditCard')" required> 信用卡
        </label>
        <label>
          <input type="radio" value="BankTransfer" :checked="modelValue === 'BankTransfer'"
                 @change="$emit('update:modelValue', 'BankTransfer')" required> 銀行轉帳
        </label>
        </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  // 接收 modelValue (來自父層的 v-model)
  defineProps({
    modelValue: {
      type: String,
      required: true
    }
  });
  
  // 定義要發送的事件 'update:modelValue'
  defineEmits(['update:modelValue']);
  </script>
  
  <style scoped>
  h3 {
      margin-bottom: 15px;
  }
  .payment-options div {
    display: flex; /* 讓選項水平排列 */
    gap: 20px; /* 選項間距 */
  }
  label {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px; /* input 和文字間距 */
  }
  input[type="radio"] {
      cursor: pointer;
  }
  </style>