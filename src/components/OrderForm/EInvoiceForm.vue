<template>
  <div class="e-invoice-form">
    <h3>電子發票 / 收據</h3>

    <el-radio-group :model-value="invoiceType" @update:modelValue="updateType">
      <el-radio label="personal">個人 (二聯式)</el-radio>
      <el-radio label="company">公司 (三聯式)</el-radio>
    </el-radio-group>

    <el-form-item label="發票寄送 Email" prop="deliveryEmail" :rules="emailRules">
      <el-input
        :model-value="form.deliveryEmail"
        placeholder="預設同訂購人Email"
        readonly
      ></el-input>
    </el-form-item>
    <div v-if="invoiceType === 'company'" class="company-fields">
      <el-form :model="form" label-width="80px" :rules="rules" ref="companyFormRef">
        <el-form-item label="統一編號" prop="taxId">
          <el-input :model-value="form.taxId" @update:modelValue="updateField('taxId', $event)"></el-input>
        </el-form-item>
        <el-form-item label="發票抬頭" prop="companyTitle">
          <el-input :model-value="form.companyTitle" @update:modelValue="updateField('companyTitle', $event)"></el-input>
        </el-form-item>
        <el-form-item label-width="0">
          <el-checkbox :model-value="form.addBillingAddress" @update:modelValue="toggleBillingAddress">加註報帳地址</el-checkbox>
        </el-form-item>
        <el-form-item v-if="form.addBillingAddress" label="報帳地址" prop="billingAddress">
          <el-input
            :model-value="form.billingAddress"
            @update:modelValue="updateField('billingAddress', $event)"
            placeholder="報帳地址（必填，因為選擇了加註）"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>

    <div class="invoice-description">
      </div>

    <el-collapse-transition>
      </el-collapse-transition>

  </div>
</template>

<script setup>
import { ref, watch, reactive, defineProps, defineEmits, defineExpose, nextTick, computed } from 'vue'; // 引入所有必要的 Composition API

import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';


// 定義組件接收的 props
const props = defineProps({
  modelValue: { // v-model 綁定的發票資料物件
    type: Object,
    required: true,
    default: () => ({
      type: 'personal', // 發票類型 ('personal', 'company')
      taxId: '', // 統一編號
      companyTitle: '', // 公司抬頭
      addBillingAddress: false, // 是否加註報帳地址
      billingAddress: '', // 報帳地址
      remarks: '', // 備註欄位
      deliveryEmail: '' // 用於接收電子發票的 email (通常從訂購人資料帶入或單獨輸入)
    })
  }
});

// 定義組件發出的事件
const emit = defineEmits(['update:modelValue']);

// 內部狀態，同步自 props.modelValue
const invoiceType = ref(props.modelValue.type); // 發票類型 (使用 ref 因為它直接綁定到 el-radio-group)
// 控制備註欄位顯示/隱藏，如果初始有值則展開
const showRemarks = ref(!!props.modelValue.remarks);

// 使用 reactive 創建內部表單數據副本，與 props.modelValue 雙向同步
// 這樣 el-form 的 :model 就可以指向這個 reactive 對象
const form = reactive({
  taxId: props.modelValue.taxId,
  companyTitle: props.modelValue.companyTitle,
  addBillingAddress: props.modelValue.addBillingAddress || false,
  billingAddress: props.modelValue.billingAddress || '',
  remarks: props.modelValue.remarks || '',
  deliveryEmail: props.modelValue.deliveryEmail || '' // 同步 deliveryEmail
});

// Element Plus 表單驗證規則 (使用 reactive)
const rules = reactive({
  taxId: [
    { required: true, message: '請輸入統一編號', trigger: 'blur' },
    { pattern: /^[0-9]{8}$/, message: '統一編號需為8位數字', trigger: 'blur' } // 添加簡單的8位數字格式驗證
  ],
  companyTitle: [
    { required: true, message: '請輸入發票抬頭', trigger: 'blur' },
  ],
  // 報帳地址的規則是當 addBillingAddress 為 true 時才必填
  billingAddress: [
    {
          // 使用 computed 屬性來動態判斷是否必填
          // 這裡直接在規則對象中使用 computed，Element Plus 會處理其響應性
          required: computed(() => form.addBillingAddress),
          message: '選擇加註報帳地址時，請輸入報帳地址',
          trigger: 'blur'
    }
      // 如果需要地址格式驗證，可以在這裡添加 validator
  ],
  deliveryEmail: [
    { required: true, message: '請輸入發票寄送的電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: ['blur', 'change'] }
  ]
});

// 用於獲取「公司」類型發票的 el-form 引用
const companyFormRef = ref(null);


// 發票類型改變時更新父組件數據，並處理相關欄位清空和驗證清除
const updateType = (newType) => {
  invoiceType.value = newType; // 更新本地類型狀態

  // 根據新類型，清空或保留相關欄位數據
  // 注意：這裡直接修改 form reactive 對象，Vue 會自動偵測變化
  form.taxId = newType !== 'company' ? '' : form.taxId;
  form.companyTitle = newType !== 'company' ? '' : form.companyTitle;
  form.addBillingAddress = newType !== 'company' ? false : form.addBillingAddress;
  // 只有當類型是 company 且 addBillingAddress 為 true 時才保留 billingAddress 的值
  form.billingAddress = (newType !== 'company' || !form.addBillingAddress) ? '' : form.billingAddress;
  // remarks 和 deliveryEmail 通常不因類型改變而清空，保持原值

  // 發送完整的更新數據給父組件 (發送 form reactive 對象的副本)
   emit('update:modelValue', { ...form, type: newType });


  // 如果切換到非公司類型，清除公司表單的驗證狀態
  // 使用 nextTick 確保 DOM 狀態更新（el-form 被 v-if 移除）之後再嘗試清除驗證
  if (newType !== 'company') {
       nextTick(() => {
           if (companyFormRef.value) {
              companyFormRef.value.clearValidate();
              console.log("EInvoiceForm: Cleared company form validation.");
           }
       });
  }
};

// 更新單個欄位時同步數據到本地 reactive 對象，並發送給父組件
const updateField = (field, value) => {
  form[field] = value; // 更新本地 reactive 對象

  // 發送完整的更新數據給父組件 (發送 form reactive 對象的副本)
   emit('update:modelValue', { ...form, type: invoiceType.value });

   // 如果是 'addBillingAddress' 欄位改變
   if (field === 'addBillingAddress') {
        // 如果從勾選變為未勾選，清空 billingAddress 欄位並清除驗證狀態
       if (!value) {
           form.billingAddress = ''; // 清空本地
           // emit('update:modelValue', { ...form, billingAddress: '' }); // 確保同步清空給父組件 (已包含在上面的 emit 中)
            // 使用 nextTick 確保 DOM 移除 billingAddress 欄位後再嘗試清除驗證 (如果欄位會因此移除)
            nextTick(() => {
                if (companyFormRef.value) {
                    companyFormRef.value.clearValidate('billingAddress'); // 清除單個欄位的驗證狀態
                    console.log("EInvoiceForm: Cleared billingAddress validation.");
                }
            });
       }
        // 如果從未勾選變為勾選，可以選擇觸發 billingAddress 的驗證 (如果它是必填的話)
        else {
            nextTick(() => {
                 if (companyFormRef.value) {
                     companyFormRef.value.validateField('billingAddress', () => {});
                     console.log("EInvoiceForm: Triggered billingAddress validation.");
                 }
            });
        }
   }

   // 如果更新的是 billingAddress 欄位本身，在更新值後觸發其自身的驗證
    if (field === 'billingAddress' && invoiceType.value === 'company' && form.addBillingAddress && companyFormRef.value) {
         nextTick(() => {
            companyFormRef.value.validateField('billingAddress', () => {});
            console.log("EInvoiceForm: Triggered billingAddress validation on input.");
         });
    }

    // 對於 taxId 和 companyTitle，在更新時觸發驗證 (如果當前是公司類型)
    if (['taxId', 'companyTitle'].includes(field) && invoiceType.value === 'company' && companyFormRef.value) {
         nextTick(() => {
            companyFormRef.value.validateField(field, () => {});
            console.log(`EInvoiceForm: Triggered ${field} validation on input.`);
         });
    }
     // TODO: 如果 deliveryEmail 需要驗證，在這裡添加觸發邏輯
     // if (field === 'deliveryEmail' && formRef.value) { // 如果整個組件包裹在一個 form 中
     //      nextTick(() => { formRef.value.validateField('deliveryEmail', () => {}); });
     // }
};

// 切換加註報帳地址複選框時觸發
const toggleBillingAddress = (checked) => {
  updateField('addBillingAddress', checked); // 直接呼叫 updateField 處理數據同步和 emit
};

// 切換備註欄位顯示/隱藏
const toggleRemarks = () => {
  showRemarks.value = !showRemarks.value;
  // 如果選擇隱藏，可以考慮是否清空備註內容
  // if (!showRemarks.value) {
  //    form.remarks = '';
  //    updateField('remarks', ''); // 如果需要清空並同步
  // }
};

// 監聽父組件傳來的 modelValue 變化，同步到本地狀態
watch(() => props.modelValue, (newValue) => {
  if (newValue && typeof newValue === 'object') { // << 新增保護：確保 newValue 是有效的物件 >>
    Object.assign(form, newValue); 
    invoiceType.value = newValue.type || 'personal'; // 提供預設值以防 type 不存在
    showRemarks.value = !!newValue.remarks;

    // 同步後，如果當前是公司類型，可能需要清除舊的驗證狀態，或者觸發一次驗證
    if (invoiceType.value === 'company') {
        nextTick(() => {
            if (companyFormRef.value) {
                companyFormRef.value.clearValidate();
            }
        });
    } else {
        nextTick(() => {
            if (companyFormRef.value) {
                companyFormRef.value.clearValidate();
            }
        });
    }
  } else {
    // 如果父組件傳來了 null 或非物件，這是一個問題，需要決定如何處理
    // 選項1: 重置為預設狀態
    console.warn("EInvoiceForm received a null or invalid modelValue. Resetting to default.");
    const defaultValue = { 
        type: 'personal', taxId: '', companyTitle: '', 
        addBillingAddress: false, billingAddress: '', 
        remarks: '', deliveryEmail: form.deliveryEmail // 保留可能的 deliveryEmail
    };
    Object.assign(form, defaultValue);
    invoiceType.value = defaultValue.type;
    showRemarks.value = !!defaultValue.remarks;
    emit('update:modelValue', { ...defaultValue }); // << 通知父組件已重設 >>
  }

}, { deep: true, immediate: true }); // 使用 deep watch 監聽 modelValue 物件內部屬性變化


// --- **新增：暴露驗證方法給父組件** ---
// 這個方法負責觸發當前可見/需要的表單驗證
const validate = () => {
  // 返回一個 Promise，父組件可以 await 這個 Promise 來獲取驗證結果
  return new Promise((resolve) => {
    // 如果當前選擇的是「公司」類型發票
    if (invoiceType.value === 'company') {
      // 檢查公司表單的 ref 是否存在
      if (companyFormRef.value) {
        console.log("觸發 EInvoiceForm (公司類型) 驗證...");
        // 呼叫公司表單的 validate 方法
        companyFormRef.value.validate((valid, fields) => {
           if (valid) {
             console.log("EInvoiceForm (公司類型) 驗證通過.");
             resolve(true); // 驗證通過
           } else {
              console.warn("EInvoiceForm (公司類型) 驗證失敗:", fields);
              resolve(false); // 驗證失敗
           }
        });
      } else {
         // 如果是公司類型，但 companyFormRef 不存在 (不應該發生在正常流程，除非 v-if 有問題或時序問題)
         console.error("EInvoiceForm: Company form ref not available when type is 'company'. Cannot validate.");
         resolve(false); // 視為驗證失敗
      }
    } else {
      // 如果當前選擇的是「個人」或其他類型發票，且這些類型沒有需要 ElForm 驗證的欄位
      // 目前個人類型沒有需要驗證的必填欄位，所以直接視為驗證通過
      console.log("EInvoiceForm (非公司類型) 無需 ElForm 驗證，視為通過.");
      // TODO: 如果個人類型或備註未來有需要手動驗證的邏輯，在這裡實現
      // 例如：如果 deliveryEmail 是必填且不在公司表單中，需要在這裡手動驗證
      // if (!form.deliveryEmail) {
      //     console.warn("EInvoiceForm: Delivery email is required.");
      //     resolve(false);
      // } else { resolve(true); }
      resolve(true); // 暫時視為通過
    }
  });
};

// 使用 defineExpose 將 validate 方法暴露給父組件
defineExpose({
  validate
  // 如果你希望父組件能獲取當前選擇的發票類型或其他狀態，也可以在這裡暴露
  // invoiceType // 例如 defineExpose({ validate, invoiceType })
});

</script>

<style scoped>
/* **使用 Element Plus CSS 變數和組件樣式** */
/* 這部分樣式可以從你 OrderForm 的 style 中搬過來或整合 */

/* 標題樣式 */
h3 {
  margin-bottom: var(--el-margin-base, 15px); /* 使用 Element Plus 變數 */
  color: var(--el-text-color-primary, #303133); /* 使用 Element Plus 主要文字顏色 */
  font-weight: var(--el-font-weight-bold, bold); /* 使用 Element Plus 字體粗細 */
   /* 如果需要左邊藍線等，請在 AccordionSection 的標題樣式中處理 */
}

/* 單選組件的樣式 */
.el-radio-group {
  margin-bottom: 20px;
  /* gap: 15px; */ /* 可以考慮使用 flex gap */
}

/* 公司欄位區塊樣式 */
.company-fields {
  margin-top: 15px;
  padding-left: 10px; /* 縮進效果 */
  /* 可選：添加邊框或背景色以區分 */
  /* border: 1px dashed var(--el-border-color-light); */
  /* padding: 15px; */
  /* border-radius: var(--el-border-radius-base); */
}

/* 公司欄位內部的 ElFormItem 樣式 */
.company-fields .el-form-item {
  margin-bottom: 15px; /* 保持間距 */
}

/* 公司欄位內的複選框樣式 */
.company-fields .el-form-item :deep(.el-checkbox) {
  margin-top: 5px;
}

/* 公司欄位 ElFormItem 的 Label 樣式 */
.company-fields .el-form-item :deep(.el-form-item__label) {
  font-weight: var(--el-font-weight-primary, 500); /* 使用 Element Plus 字體粗細 */
  color: var(--el-text-color-regular, #606266); /* 使用 Element Plus 常規文字顏色 */
}

/* 發票描述文字區塊樣式 */
.invoice-description {
  margin-top: 20px;
  font-size: var(--el-font-size-small, 13px); /* 使用 Element Plus 小字體 */
  color: var(--el-text-color-secondary, #909399); /* 使用 Element Plus 次要文字顏色 */
  line-height: 1.6;
}

.invoice-description p {
  margin-bottom: 10px;
}

/* 發票描述中的連結樣式 */
.invoice-description a {
  color: var(--el-color-primary, #409eff); /* 使用 Element Plus 主題色 */
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.invoice-description a:hover {
  text-decoration: underline;
}

/* 備註欄位外部容器樣式 */
.remarks-field {
  margin-top: 10px;
  border: 1px solid var(--el-border-color-light, #dcdfe6); /* 使用 Element Plus 邊框顏色 */
  border-radius: var(--el-border-radius-base, 4px); /* 使用 Element Plus 圓角 */
  padding: 10px;
  background-color: var(--el-fill-color-extra-light, #f5f7fa); /* 可選：稍微淺的背景色 */
}

/* 備註欄位內部 textarea 樣式 */
.remarks-field .el-textarea :deep(textarea) {
  border: none !important;
  box-shadow: none !important;
  resize: vertical; /* 允許垂直調整大小 */
  /* 可選：調整 placeholder 顏色 */
  /* color: var(--el-text-color-placeholder); */
}

/* 自定義 radio 樣式 */
:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary);
}
:deep(.el-radio__input .el-radio__inner) {
  border: 1px solid var(--el-border-color-base);
}
:deep(.el-radio__label) {
  color: var(--el-text-color-regular);
  font-weight: var(--el-font-weight-primary);
}
</style>

