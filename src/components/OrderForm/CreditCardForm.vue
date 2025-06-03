<template>
  <el-form :model="formState" ref="creditCardFormRef" label-position="top" class="credit-card-form">

    <el-form-item label="持卡人姓名" prop="cardHolderName" :rules="rules.cardHolderName">
      <el-input v-model="formState.cardHolderName" placeholder="請與信用卡上姓名一致" />
    </el-form-item>

    <el-form-item label="信用卡號碼" prop="cardNumber" :rules="rules.cardNumber">
      <div class="card-number-inputs">
        <template v-for="(part, index) in cardNumberParts" :key="index">
          <el-input
            v-model="cardNumberParts[index]"
            placeholder="XXXX"
            maxlength="4"
            @input="handleCardNumberInput(index, $event)"
            @keydown.delete="handleCardNumberDelete(index, $event)"
            :ref="el => { if (el) cardNumberInputRefs[index] = el }"
            link inputmode="numeric" pattern="[0-9]*" />
          <span v-if="index < 3" class="separator">-</span>
        </template>
      </div>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="有效月份" prop="expiryMonth" :rules="rules.expiryMonth">
          <el-select v-model="formState.expiryMonth" placeholder="月份 (MM)">
            <el-option v-for="month in months" :key="month.value" :label="month.label" :value="month.value" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="有效年份" prop="expiryYear" :rules="rules.expiryYear">
          <el-select v-model="formState.expiryYear" placeholder="年份 (YYYY)">
            <el-option v-for="year in years" :key="year" :label="year" :value="year" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="安全碼 (CVC/CVV)" prop="cvc" :rules="rules.cvc">
      <el-input
        v-model="formState.cvc"
        placeholder="卡片背面末三碼"
        maxlength="3" class="cvc-input"
        link inputmode="numeric" pattern="[0-9]*" >
        <template #append>
          <el-tooltip
            placement="bottom"
            trigger="hover"
            :width="230"
            popper-class="cvc-tooltip-popper"
            :show-arrow="true"
            effect="light" :hide-after="0" :offset="12" >
            <template #content>
              <div class="cvc-tooltip-content-wrapper">
                <img src="/images/CreditCardCVC.jpg" alt="CVC/CVV 提示" class="cvc-tooltip-image" />
                <p class="cvc-tooltip-text">
                  卡片背面簽名欄末3碼
              </p>
              </div>
            </template>
            <el-icon style="cursor: help;"><QuestionFilled /></el-icon>
          </el-tooltip>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, watch, ref, onMounted, computed, defineProps, defineEmits, defineExpose, nextTick } from 'vue'; // 引入所有必要的 Composition API

// 引入 Element Plus Icons (這些 Icons 需要顯式引入)
import { CreditCard, QuestionFilled } from '@element-plus/icons-vue';

// 定義組件接收的 props
const props = defineProps({
  modelValue: { // 從父組件的 v-model 綁定接收信用卡數據對象
    type: Object,
    default: () => ({
      cardHolderName: '',
      cardNumber: '', // 組合後的信用卡號碼字串
      expiryMonth: '',
      expiryYear: '',
      cvc: ''
    })
  }
});

// 定義組件發出的事件
const emits = defineEmits(['update:modelValue', 'validity-changed']); // update:modelValue 用於 v-model 雙向綁定，validity-changed 通知父組件驗證狀態

// 用於獲取 el-form 實例的引用
const creditCardFormRef = ref(null);
// 用於獲取四個信用卡號碼輸入框實例的引用陣列
const cardNumberInputRefs = ref([]);

// 使用 reactive 創建內部表單數據副本，並初始化為 props.modelValue 的值
// 這個 formState 將用於 el-form 的 :model 綁定
const formState = reactive({ ...props.modelValue });

// 將組合後的信用卡號碼字串分割成四個部分的陣列
const cardNumberParts = reactive(['', '', '', '']);

// 監聽內部 formState 的變化 (除了 cardNumber，因為它由 cardNumberParts 計算而來)
watch(() => ({
    cardHolderName: formState.cardHolderName,
    expiryMonth: formState.expiryMonth,
    expiryYear: formState.expiryYear,
    cvc: formState.cvc
}), (newValue) => {
  // 當內部數據變化時，發出 update:modelValue 事件通知父組件更新
  // 注意：這裡發送的是包含所有字段的 formState
  emits('update:modelValue', { ...formState });
  // 每次內部數據變動時都觸發表單驗證，並通過 validity-changed 事件通知父組件驗證狀態
  // 使用 nextTick 確保 DOM 更新後再驗證
  nextTick(() => {
      validateForm();
  });
}, { deep: true }); // deep: true 確保監聽對象內部屬性的變化


// 監聽 cardNumberParts 陣列的變化
watch(cardNumberParts, (newParts) => {
    // 將四個部分的數字組合回一個字串，並更新到 formState.cardNumber
    const combinedNumber = newParts.join('');
    formState.cardNumber = combinedNumber;
    // 當 cardNumberParts 變化時，也觸發表單驗證狀態的更新
    // 使用 nextTick 確保 formState.cardNumber 更新後再觸發驗證
     nextTick(() => {
         validateForm();
     });
}, { deep: true }); // deep: true 監聽陣列內部元素的變化


// 監聽父組件傳入的 modelValue 變化
watch(() => props.modelValue, (newValue) => {
  // 當父組件數據變化時，更新內部 formState
  Object.assign(formState, newValue);
  // 將父組件傳來的 cardNumber 字串分割回四個部分，更新 cardNumberParts
  splitCardNumber(newValue.cardNumber);
  // 父組件數據更新後，觸發一次驗證以更新父組件的 validity-changed 狀態
   nextTick(() => {
       validateForm();
   });
}, { deep: true }); // deep: true 確保監聽對象內部屬性的變化


// 函式：將信用卡號碼字串分割成四個部分的陣列
const splitCardNumber = (numberString) => {
    if (!numberString) {
        cardNumberParts.splice(0, 4, '', '', '', ''); // 清空陣列
        return;
    }
    const cleanNumber = numberString.replace(/\D/g, ''); // 移除所有非數字字元
    cardNumberParts.splice(0, 4); // 清空現有內容
    for (let i = 0; i < 4; i++) {
        cardNumberParts.push(cleanNumber.substring(i * 4, (i + 1) * 4)); // 每四位分割
    }
};

// 函式：處理每個信用卡號碼輸入框的輸入事件
const handleCardNumberInput = (index, value) => {
    // 移除所有非數字字元
    const cleanValue = value.replace(/\D/g, '');
    // 限制輸入框只顯示前4位數字
    cardNumberParts[index] = cleanValue.substring(0, 4);

    // 如果當前輸入框已滿4位且不是最後一個輸入框
    if (cardNumberParts[index].length === 4 && index < 3) {
        // 將焦點移動到下一個輸入框
        nextTick(() => {
            const nextInput = cardNumberInputRefs.value[index + 1];
            if (nextInput && nextInput.focus) {
                nextInput.focus();
            }
        });
    }
};

// 函式：處理信用卡號碼輸入框的刪除鍵事件
const handleCardNumberDelete = (index, event) => {
    // 如果當前輸入框為空且不是第一個輸入框
    if (cardNumberParts[index].length === 0 && index > 0) {
        // 阻止預設的刪除行為
        event.preventDefault();
        // 將焦點移動到上一個輸入框的末尾
        nextTick(() => {
            const prevInput = cardNumberInputRefs.value[index - 1];
            if (prevInput && prevInput.focus) {
                prevInput.focus();
                // 將光標移動到上一個輸入框的末尾
                // 這需要訪問原生 input 元素
                const nativeInput = prevInput.$refs.input; // Element Plus input 的原生 input 元素在 $refs.input
                if (nativeInput) {
                    nativeInput.setSelectionRange(nativeInput.value.length, nativeInput.value.length);
                }
            }
        });
    }
};


// 生成月份選項 (01 到 12)
const months = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString().padStart(2, '0'), // 值為兩位數的字串 (如 '01', '12')
  label: (i + 1).toString().padStart(2, '0') // 顯示為兩位數的字串
}));

// 生成年份選項 (從今年開始的未來 15 年)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear + i); // 生成年份數字陣列


// Element Plus 表單驗證規則 (定義在 <script setup> 中更清晰)
// 使用 reactive 使規則具有響應性 (如果規則需要動態變化，雖然這裡不需要)
const rules = reactive({
    cardHolderName: [
        // required 規則通常在 blur 時觸發，未輸入時不會立即顯示警告
        { required: true, message: '請輸入持卡人姓名', trigger: 'blur' }
    ],
    cardNumber: [
        // required 規則
        { required: true, message: '請輸入信用卡號碼', trigger: 'blur' },
        // 自訂驗證器：檢查組合後的號碼格式和長度
         {
             validator: (rule, value, callback) => {
                 if (!value) return callback(); // 如果非必填或已由 required 檢查處理空值
                 // 移除所有非數字字元
                 const cardNumberClean = value.replace(/\D/g, '');
                 // 檢查長度是否在 13 到 19 位之間 (常見信用卡長度)
                 if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
                      return callback(new Error('信用卡號碼長度不正確 (需為 13-19 位數字)'));
                 }
                 // 檢查是否只包含數字
                 if (!/^\d+$/.test(cardNumberClean)) {
                      return callback(new Error('信用卡號碼只能包含數字'));
                 }
                 // TODO: 在這裡可以加入更嚴謹的 Luhn 算法檢查
                 // 例如： if (!isValidLuhn(cardNumberClean)) { callback(new Error('無效的信用卡號碼')); }

                 callback(); // 驗證通過
             },
             trigger: 'blur' // 在失去焦點時觸發
         }
    ],
    expiryMonth: [
        { required: true, message: '請選擇月份', trigger: 'change' }
    ],
    expiryYear: [
        { required: true, message: '請選擇年份', trigger: 'change' },
        // 自訂驗證器：檢查有效日期是否過期
         {
             validator: (rule, value, callback) => {
                 const month = formState.expiryMonth;
                 const year = value; // value 是選擇的年份

                 if (!month || !year) return callback(); // 如果月份或年份未選，讓 required 規則處理

                 const expiryDate = new Date(year, parseInt(month) - 1, 1); // 月份從 0 開始
                 // 設置為該月的最後一天，以便精確判斷是否過期
                 expiryDate.setMonth(expiryDate.getMonth() + 1);
                 expiryDate.setDate(expiryDate.getDate() - 1);

                 const today = new Date();
                 // 將今天設置為該天的結束時間，以便精確判斷是否過期
                 today.setHours(23, 59, 59, 999);


                 if (expiryDate >= today) {
                     callback(); // 驗證通過 (未過期)
                 } else {
                     callback(new Error('信用卡已過期')); // 驗證失敗
                 }
             },
             trigger: 'change' // 月份或年份改變時觸發
         }
    ],
    cvc: [
        { required: true, message: '請輸入安全碼', trigger: 'blur' },
        // 自訂驗證器：檢查 CVC 格式
        { pattern: /^[0-9]{3,4}$/, message: '安全碼需為3位數', trigger: 'blur' } // CVC/CVV 通常是 3 或 4 位數字
    ]
});


// 驗證表單並通過 validity-changed 事件發出狀態
const validateForm = async () => {
  // 使用 nextTick 確保在 DOM 更新後再觸發驗證
  await nextTick();
  if (!creditCardFormRef.value) {
    console.warn("CreditCardForm: Form ref not available for validation.");
    emits('validity-changed', false); // 表單尚未渲染完成或引用丟失
    return;
  }
  try {
    // 呼叫 el-form 實例的 validate 方法
    // validate() 會驗證所有觸發器匹配的規則
    await creditCardFormRef.value.validate();
    // 如果 validate 成功 (沒有拋出錯誤)，表示驗證通過
    emits('validity-changed', true);
    console.log("CreditCardForm: Validation passed.");
  } catch (error) {
    // 如果 validate 拋出錯誤，表示驗證失敗
    emits('validity-changed', false);
    console.log("CreditCardForm: Validation failed.", error);
  }
};

// 在組件掛載後觸發一次驗證，以設定初始的 validity-changed 狀態
// 注意：這個初始驗證可能會觸發 required 規則的 blur 驗證，導致空欄位顯示錯誤
// 如果不希望在 mount 時顯示錯誤，可以移除這裡的 validateForm() 呼叫
// 或者修改 validateForm() 邏輯，使其在初始狀態不顯示錯誤
onMounted(() => {
  // validateForm(); // 移除或修改此行以防止初始空欄位警告
   // 在 mount 時，只發出初始的有效性狀態 (通常是 false，因為必填欄位為空)
   // 錯誤訊息會在用戶與欄位互動 (blur) 後顯示
   emits('validity-changed', false); // 初始狀態通常無效
});

// 使用 defineExpose 將 validate 方法暴露給父組件調用
// 這個方法用於在父組件點擊提交按鈕時，強制觸發 CreditCardForm 的驗證
defineExpose({
  validate: async () => {
    // 使用 nextTick 確保在父組件呼叫時，DOM 狀態是最新的
    await nextTick();
    if (!creditCardFormRef.value) {
        console.error("CreditCardForm: Form ref not available for exposed validate.");
        return false; // 無法驗證，返回 false
    }
    try {
      // 呼叫 el-form 實例的 validate 方法
      // 這個 validate 會觸發所有規則，包括 required 規則的 blur trigger
      await creditCardFormRef.value.validate();
      return true; // 驗證通過
    } catch (error) {
      // 驗證失敗時捕獲錯誤並返回 false
      console.log("CreditCardForm: Exposed validate failed.", error);
      return false;
    }
  }
});

</script>

<style scoped>
/* **使用 Element Plus CSS 變數和組件樣式** */
/* 這部分樣式可以從你 OrderForm 的 style 中搬過來或整合 */

/* 信用卡表單整體樣式 */
.credit-card-form {

}

/* 信用卡號碼輸入框容器 (使用 Flexbox 佈局四個輸入框和分隔符) */
.card-number-inputs {
    display: flex;
    align-items: center; /* 垂直居中 */
    gap: 5px; /* 輸入框和分隔符之間的間距 */
    width: 100%; /* 佔滿父容器寬度 */
}

/* 信用卡號碼單個輸入框樣式 */
.card-number-inputs .el-input {
    flex: 1; /* 讓每個輸入框平均佔據可用空間 */
    /* 確保輸入框內容居中或靠左，根據設計調整 */
    /* :deep(.el-input__inner) { text-align: center; } */
}

/* 信用卡號碼分隔符 "-" 樣式 */
.card-number-inputs .separator {
    font-size: 1.2em;
    color: var(--el-text-color-regular); /* 使用 Element Plus 常規文字顏色 */
}


/* 月份和年份選擇框樣式 */
.credit-card-form .el-select {
  width: 100%; /* 讓選擇框填滿父容器寬度 */
}

/* CVC 輸入框特定樣式 */
.cvc-input.el-input {
  /* 調整寬度，使用響應式單位或 Element Plus 佈局 */
  width: 100%; /* 在小螢幕下填滿 */
  max-width: 180px; /* 在寬螢幕下限制最大寬度 */
}

/* CVC 提示圖片樣式 */
.cvc-tooltip-content-wrapper .cvc-tooltip-image {
    max-width: 100%; /* 圖片最大寬度為容器寬度 */
    height: auto; /* 高度自動調整 */
    display: block; /* 圖片作為塊級元素 */
    margin-bottom: 8px; /* 圖片下方間距 */
}

/* CVC 提示文字樣式 */
.cvc-tooltip-content-wrapper .cvc-tooltip-text {
    margin: 0; /* 移除預設 margin */
    font-size: var(--el-font-size-small); /* 使用 Element Plus 小字體 */
    color: var(--el-text-color-regular); /* 使用 Element Plus 常規文字顏色 */
    line-height: 1.4;
}

/* 自定義 tooltip popper 樣式 (需要使用 popper-class 屬性) */
/* 在全局或父組件的 style 中定義，或者使用 :deep() */
/*
:deep(.cvc-tooltip-popper) {
    padding: 12px;
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
}
*/

/* 響應式調整 */
@media (max-width: 768px) {
    .credit-card-form .el-row > .el-col {
        flex-basis: 100%; /* 在小螢幕下讓欄位各自佔一行 */
    }
     .cvc-input.el-input {
         width: 100% !important; /* 在小螢幕下確保填滿 */
         max-width: unset;
     }
}

</style>
