<template>
    <div class="e-invoice-form">
      <h3>電子發票 / 收據</h3>
      <div>
        <label>
          <input type="radio" name="invoiceType" value="personal"
                 :checked="modelValue.type === 'personal'"
                 @change="updateType('personal')">
          個人 (二聯式)
        </label>
        <label>
          <input type="radio" name="invoiceType" value="company"
                 :checked="modelValue.type === 'company'"
                 @change="updateType('company')">
          公司 (三聯式)
        </label>
         <label>
          <input type="radio" name="invoiceType" value="donation"
                 :checked="modelValue.type === 'donation'"
                 @change="updateType('donation')">
          捐贈
        </label>
      </div>
  
      <div v-if="modelValue.type === 'company'" class="company-fields">
         <div>
           <label for="taxId">統一編號:</label>
           <input type="text" id="taxId" :value="modelValue.taxId"
                  @input="updateField('taxId', $event.target.value)" required>
         </div>
         <div>
           <label for="companyTitle">發票抬頭:</label>
           <input type="text" id="companyTitle" :value="modelValue.companyTitle"
                  @input="updateField('companyTitle', $event.target.value)" required>
         </div>
      </div>
  
       <div v-if="modelValue.type === 'donation'" class="donation-fields">
         <label for="donationCode">捐贈碼:</label>
         <input type="text" id="donationCode" :value="modelValue.donationCode"
                @input="updateField('donationCode', $event.target.value)" placeholder="請輸入捐贈碼 (例如：愛心碼)">
      </div>
  
      </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  // 接收 modelValue (來自父層的 v-model)
  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
      default: () => ({ type: 'personal', taxId: '', companyTitle: '', donationCode: '' }) // 提供預設值
    }
  });
  
  // 定義要發送的事件 'update:modelValue'
  const emit = defineEmits(['update:modelValue']);
  
  const updateType = (newType) => {
    const updatedValue = {
        ...props.modelValue,
        type: newType,
        // 切換類型時可以清空其他欄位 (可選)
        taxId: newType !== 'company' ? '' : props.modelValue.taxId,
        companyTitle: newType !== 'company' ? '' : props.modelValue.companyTitle,
        donationCode: newType !== 'donation' ? '' : props.modelValue.donationCode,
    };
    emit('update:modelValue', updatedValue);
  }
  
  const updateField = (field, value) => {
    const updatedValue = { ...props.modelValue, [field]: value };
    emit('update:modelValue', updatedValue);
  };
  </script>
  
  <style scoped>
  h3 {
      margin-bottom: 15px;
  }
  .e-invoice-form > div:first-of-type { /* 指的是選項那層 div */
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
  }
  label {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
  }
  input[type="radio"] {
      cursor: pointer;
  }
  .company-fields div, .donation-fields div {
    margin-bottom: 10px;
  }
  .company-fields label, .donation-fields label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
  }
  input[type="text"] {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>