<template>
  <div class="e-invoice-form">
    <h3>電子發票 / 收據</h3>
    <el-radio-group v-model="invoiceType" @change="updateType">
      <el-radio label="personal">個人 (二聯式)</el-radio>
      <el-radio label="company">公司 (三聯式)</el-radio>
    </el-radio-group>

    <div v-if="invoiceType === 'company'" class="company-fields">
      <el-form :model="form" label-width="80px" :rules="rules" ref="companyFormRef">
        <el-form-item label="統一編號" prop="taxId">
          <el-input v-model="form.taxId" @input="updateField('taxId', $event)"></el-input>
        </el-form-item>
        <el-form-item label="發票抬頭" prop="companyTitle">
          <el-input v-model="form.companyTitle" @input="updateField('companyTitle', $event)"></el-input>
        </el-form-item>
        <el-form-item label-width="0">
          <el-checkbox v-model="form.addBillingAddress" @change="toggleBillingAddress">加註報帳地址</el-checkbox>
        </el-form-item>
        <el-form-item v-if="form.addBillingAddress" label="報帳地址" prop="billingAddress">
          <el-input
            v-model="form.billingAddress"
            @input="updateField('billingAddress', $event)"
            placeholder="報帳地址（非必填）"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>

    <div class="invoice-description">
      <p>依財政部台財稅第821481937號函，本公司開立「旅行業代收轉付電子收據」，收據以email寄送，感謝您為地球環保盡一份心。如行程異動或取消時，為加速退款作業，同意授權本公司代為處理銷貨退回或折讓證明。</p>
      <a href="#" @click.prevent="toggleRemarks">
        需協助事項備註 <el-icon><component :is="showRemarks ? ArrowUp : ArrowDown" /></el-icon>
      </a>
    </div>

    <el-collapse-transition>
      <div v-show="showRemarks" class="remarks-field">
        <el-input
          type="textarea"
          :rows="3"
          placeholder="需協助事項備註於此"
          v-model="form.remarks"
          @input="updateField('remarks', $event)"
        ></el-input>
      </div>
    </el-collapse-transition>

  </div>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import {
  ElRadioGroup,
  ElRadio,
  ElForm,
  ElFormItem,
  ElInput,
  ElCheckbox,
  ElIcon,
  ElCollapseTransition // 引入摺疊動畫組件
} from 'element-plus';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'; // 引入上下箭頭圖示

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      type: 'personal',
      taxId: '',
      companyTitle: '',
      addBillingAddress: false,
      billingAddress: '',
      remarks: '' // 新增：備註欄位
    })
  }
});

const emit = defineEmits(['update:modelValue']);

const invoiceType = ref(props.modelValue.type);
const showRemarks = ref(!!props.modelValue.remarks); // 新增：控制備註欄位顯示/隱藏，如果初始有值則展開

const form = reactive({
  taxId: props.modelValue.taxId,
  companyTitle: props.modelValue.companyTitle,
  addBillingAddress: props.modelValue.addBillingAddress || false,
  billingAddress: props.modelValue.billingAddress || '',
  remarks: props.modelValue.remarks || '' // 新增：備註欄位
});

const rules = reactive({
  taxId: [
    { required: true, message: '請輸入統一編號', trigger: 'blur' },
  ],
  companyTitle: [
    { required: true, message: '請輸入發票抬頭', trigger: 'blur' },
  ],
});

const companyFormRef = ref(null);

const updateType = (newType) => {
  invoiceType.value = newType;
  const updatedValue = {
    ...props.modelValue,
    type: newType,
    taxId: newType !== 'company' ? '' : form.taxId,
    companyTitle: newType !== 'company' ? '' : form.companyTitle,
    addBillingAddress: newType !== 'company' ? false : form.addBillingAddress,
    billingAddress: (newType !== 'company' || !form.addBillingAddress) ? '' : form.billingAddress,
    remarks: form.remarks // 保留備註欄位的值
  };
  emit('update:modelValue', updatedValue);

  if (newType !== 'company' && companyFormRef.value) {
    companyFormRef.value.clearValidate();
    form.addBillingAddress = false;
    form.billingAddress = '';
  }
};

const updateField = (field, value) => {
  form[field] = value;
  // 構建要發送的完整數據，確保包含所有欄位
  const updatedValue = {
    type: invoiceType.value, // 包含當前選擇的發票類型
    taxId: form.taxId,
    companyTitle: form.companyTitle,
    addBillingAddress: form.addBillingAddress,
    billingAddress: form.billingAddress,
    remarks: form.remarks, // 包含備註
    [field]: value // 確保當前更新的欄位是最新的
  };

  if (field === 'addBillingAddress' && !value) {
    form.billingAddress = '';
    updatedValue.billingAddress = ''; // 同步到發送的數據
  }
  emit('update:modelValue', updatedValue);
};

const toggleBillingAddress = (checked) => {
  updateField('addBillingAddress', checked);
  if (!checked) {
    form.billingAddress = '';
    updateField('billingAddress', '');
    if (companyFormRef.value) {
      companyFormRef.value.clearValidate('billingAddress');
    }
  }
};

// 新增：切換備註欄位顯示/隱藏的函數
const toggleRemarks = () => {
  showRemarks.value = !showRemarks.value;
  if (!showRemarks.value) {
    // 如果選擇隱藏，可以選擇是否清空備註內容
    // form.remarks = '';
    // updateField('remarks', ''); // 如果需要清空並同步
  }
};

watch(() => props.modelValue, (newValue) => {
  invoiceType.value = newValue.type;
  form.taxId = newValue.taxId;
  form.companyTitle = newValue.companyTitle;
  form.addBillingAddress = newValue.addBillingAddress || false;
  form.billingAddress = newValue.billingAddress || '';
  form.remarks = newValue.remarks || ''; // 同步備註
  showRemarks.value = !!newValue.remarks; // 如果父組件傳來的 remarks 有值，則展開

  if (newValue.type !== 'company') {
    form.addBillingAddress = false;
    form.billingAddress = '';
  }
}, { deep: true });

</script>

<style scoped>
h3 {
  margin-bottom: 15px;
  color: #337ab7;
  font-weight: bold;
}

.el-radio-group {
  margin-bottom: 20px;
}

.company-fields {
  margin-top: 15px;
  padding-left: 10px;
}

.company-fields .el-form-item {
  margin-bottom: 15px;
}

.company-fields .el-form-item .el-checkbox {
  margin-top: 5px;
}

.company-fields .el-form-item :deep(.el-form-item__label) {
  font-weight: normal;
}

.invoice-description {
  margin-top: 20px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.invoice-description p {
  margin-bottom: 10px;
}

.invoice-description a {
  color: #337ab7;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer; /* 讓連結看起來可點擊 */
}

.invoice-description a:hover {
  text-decoration: underline;
}

/* 新增：備註欄位樣式 */
.remarks-field {
  margin-top: 10px; /* 與上方連結的間距 */
  border: 1px solid #DCDFE6; /* 類似圖片的邊框 */
  border-radius: 4px; /* 圓角 */
  padding: 10px; /* 內邊距，讓 textarea 不會緊貼邊框 */
}

.remarks-field .el-textarea :deep(textarea) {
  border: none !important; /* 移除 textarea 自身的邊框，因為外部 div 已經有邊框 */
  box-shadow: none !important; /* 移除可能的陰影 */
  resize: vertical; /* 允許垂直調整大小，如果需要 */
}


:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #0a69ed;
  background: #0a69ed;
}
:deep(.el-radio__input .el-radio__inner) {
  border: 1px solid #dcdfe6;
}
:deep(.el-radio__label) {
  color: #333;
}
</style>