<template>
  <el-form
    class="participant-el-form"
    :model="modelValue"
    :rules="rules"      
    label-position="top"
    ref="formRef"        
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="名字" prop="firstName" :required="true">
          <el-input
            v-model="modelValue.firstName"
            @input="updateField('firstName', $event)" 
            placeholder="請輸入名字"
            clearable
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="姓氏" prop="lastName" :required="true">
          <el-input
            v-model="modelValue.lastName"
            @input="updateField('lastName', $event)"
            placeholder="請輸入姓氏"
            clearable
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="國家/地區" prop="country" :required="true">
          <el-select
            :model-value="modelValue.country"
            @update:modelValue="updateField('country', $event)"
            placeholder="請選擇國家/地區"
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="country in sortedCountries"
              :key="country.code"
              :label="country.name"
              :value="country.code"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="聯絡電話" prop="phoneNumber" :required="true">
          <el-input
            v-model="modelValue.phoneNumber"
            @input="updateField('phoneNumber', $event)"
            :placeholder="currentPhoneNumberPlaceholder" clearable
          >
            <template #prepend>
              <el-select-v2
                :model-value="modelValue.countryCode"
                @update:modelValue="updateField('countryCode', $event)" 
                :options="callingCodeOptions"
                placeholder="國碼"
                filterable
                style="width: 120px;"
                value-key="value"
              >
                <template #default="{ item }">
                  <span>{{ item.displayText }}</span>
                </template>
              </el-select-v2>
            </template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
          <el-form-item label="證件類型" prop="documentType" :required="true">
              <el-select
                  :model-value="modelValue.documentType"
                  @update:modelValue="updateField('documentType', $event)"
                  placeholder="請選擇證件類型"
                  style="width: 100%;"
              >
                  <el-option
                      v-for="docType in documentTypes"
                      :key="docType.value"
                      :label="docType.text"
                      :value="docType.value"
                  />
              </el-select>
          </el-form-item>
      </el-col>
      <el-col :span="12">
          <el-form-item label="證件號碼" prop="documentNumber" :required="true">
              <el-input
                v-model="modelValue.documentNumber"
                  @input="updateField('documentNumber', $event)"
                  placeholder="請輸入證件號碼"
                  clearable
              />
          </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="電子郵件信箱" prop="email" :required="true">
      <el-input
        type="email"
        v-model="modelValue.email"
        @input="updateField('email', $event)"
        placeholder="example@email.com"
        clearable
      />
    </el-form-item>

  </el-form>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, reactive, watch } from 'vue';
import countries from 'i18n-iso-countries';
import zhLocale from '/zh-tw.json';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js'; // 引入 libphonenumber-js

// Props 和 Emits
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
        firstName: '', lastName: '', country: 'TW', countryCode: '+886',
        phoneNumber: '', email: '', // updateProfile: false,
        documentType: 'ID_CARD_TW', documentNumber: ''
    })
  }
});
const emit = defineEmits(['update:modelValue']);

// 註冊中文語言包
try {
    countries.registerLocale(zhLocale);
} catch(e) { console.error("無法註冊 i18n-iso-countries 語言包:", e); }

// 國家列表
const sortedCountries = computed(() => {
    const countryNames = countries.getNames('zh-tw', { select: 'official' });
    return Object.entries(countryNames)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-tw'));
});

// 定義證件類型選項
const documentTypes = ref([
    { value: 'ID_CARD_TW', text: '身分證 (台灣)' },
    { value: 'PASSPORT', text: '護照' },
    { value: 'ARC', text: '居留證' },
    { value: 'ENTRY_PERMIT', text: '入台證' }
]);

// --- 定義可選的電話國碼 ---

const selectableCallingCodesWithPlaceholders = [
    { code: '+886', country: 'TW', placeholder: '例: 912xxxxxx' },
    { code: '+86',  country: 'CN', placeholder: '例: 138xxxxxxxx' },
    { code: '+852', country: 'HK', placeholder: '例: 5123xxxx' },
    { code: '+81',  country: 'JP', placeholder: '例: 8012345678' },
    { code: '+82',  country: 'KR', placeholder: '例: 101234xxxx' },
    { code: '+1',   country: 'US', placeholder: '例: 2015551234'},
];

// --- 計算國碼下拉選單選項 ---
const callingCodeOptions = computed(() => {
    return selectableCallingCodesWithPlaceholders.map(item => {
        const countryName = countries.getName(item.country, 'zh-tw', { select: 'official' }) || item.country;
        return {
            value: item.code,
            label: item.code, // 用於 el-select-v2 filterable 或 value-key
            displayText: `${item.code} ${countryName}`,
            placeholder: item.placeholder // 將 placeholder 加入選項中
        };
    });
});

// --- 計算屬性，用於獲取當前電話號碼的 placeholder ---
const currentPhoneNumberPlaceholder = computed(() => {
  if (!props.modelValue.countryCode) {
    return '請先選擇國碼'; // 預設或未選擇國碼時的提示
  }
  const selectedOption = callingCodeOptions.value.find(
    option => option.value === props.modelValue.countryCode
  );
  // 如果找到了對應的選項並且該選項有 placeholder 屬性，則使用它
  return selectedOption && selectedOption.placeholder ? selectedOption.placeholder : '請輸入電話號碼';
});

const formRef = ref(null); // 獲取 el-form 的引用

// 用於更新父元件傳來的 modelValue
const updateField = (field, value) => {
  let processedValue = value;

  // 對所有字串類型的值，移除所有空格
  if (typeof value === 'string') {
    processedValue = value.trim(); // 去除前後空格
  }

  const updatedInfo = { ...props.modelValue, [field]: processedValue };

  // 國碼變更時清空電話號碼
  if (field === 'countryCode') {
    updatedInfo.phoneNumber = ''; // 清空電話號碼
    if (formRef.value) {
      formRef.value.clearValidate(['phoneNumber']); // 清除電話號碼的驗證狀態
    }
  }

    // 當證件類型改變時，清空證件號碼並清除其驗證狀態
  if (field === 'documentType') {
      updatedInfo.documentNumber = ''; // 清空證件號碼
      if (formRef.value) {
          formRef.value.clearValidate(['documentNumber']); // 清除證件號碼的驗證狀態
      }
  }

  emit('update:modelValue', updatedInfo);
};

// --- 自訂電話號碼驗證函式 ---
const validatePhoneNumber = (rule, value, callback) => {
  if (!value) { // 如果電話號碼為空，則不進行驗證
    return callback();
  }

  const countryCodeForLib = props.modelValue.countryCode; // 使用從 props 中獲取的國碼
  const selectedCountryInfo = selectableCallingCodesWithPlaceholders.find(
    item => item.code === countryCodeForLib
  );

  if (!selectedCountryInfo || !selectedCountryInfo.country) {
    // 如果找不到對應的 ISO 國家代碼，無法精確驗證
    // 可以做一個基礎的數字和長度檢查，或者直接提示選擇有效的國碼
    if (!/^\d+$/.test(value)) {
      return callback(new Error('電話號碼只能包含數字'));
    }

    return callback(); // 或者 callback(new Error('無法驗證，請確認國碼'));
  }

  try {
    // parsePhoneNumberFromString 期待完整的號碼 (國碼+電話號碼)
    const fullPhoneNumber = countryCodeForLib + value.replace(/\s/g, ''); // 移除輸入中的空白，libphnenumber-js 會處理國際格式
    const phoneNumber = parsePhoneNumberFromString(fullPhoneNumber, selectedCountryInfo.country);

    if (phoneNumber && phoneNumber.isValid()) {
      callback(); // 驗證通過
    } else {
      callback(new Error('電話號碼格式不正確或無效'));
    }
  } catch (error) {
    callback(new Error('電話號碼格式錯誤'));
  }
};

// --- **新增：自訂證件號碼驗證函式** ---
const validateDocumentNumber = (rule, value, callback) => {
  const documentType = props.modelValue.documentType;

  // 共同的必填檢查 (如果 documentNumber 是必填的話)
  // 因為 el-form-item 上已經有 :required="true" 且 rules 裡有 required: true，這裡可以假設空值會被基本規則捕獲
  // 如果你需要自訂空值錯誤訊息，可以在這裡處理：
  // if (!value) {
  //     return callback(new Error('請輸入證件號碼'));
  // }
   if (!value) {
        // 如果證件號碼是必填但為空，讓 required: true 的規則來處理錯誤訊息
        // 如果非必填，這裡直接 callback()
       return callback();
   }


  let isValid = false;
  let errorMessage = '證件號碼格式不正確'; // 預設錯誤訊息

  switch (documentType) {
    case 'ID_CARD_TW':
      // 台灣身分證驗證規則 (簡單版: 字母開頭, 後接9位數字, 第二位是1或2)
      // 更嚴謹的規則需要加入驗證碼檢查
      isValid = /^[A-Z][12]\d{8}$/.test(value);
      errorMessage = '請輸入正確的台灣身分證格式 (例如: A123456789)';
      break;
    case 'PASSPORT':
      // 護照號碼驗證 (這裡只做一個簡單的非空檢查和長度範圍，實際規則更複雜)
      // 國際護照號碼格式差異很大，通常難以用簡單 regex 全面驗證
      isValid = value.length >= 6 && value.length <= 20; // 假設長度在6-20之間
      errorMessage = '請輸入正確的護照號碼，長度通常在6-20個字元'; // 這裡訊息可以更具體
      break;
    case 'ARC':
      // 台灣居留證號碼驗證 (簡單版: 字母開頭, 後接9位數字, 第二位是8或9)
      // 新式外來人口統一證號 (NWPN)：1碼英文字母 + 8碼數字 + 1碼檢查碼 (第二碼是 8 或 9)
      isValid = /^[A-Z][89]\d{8}$/.test(value);
      errorMessage = '請輸入正確的台灣居留證號碼格式 (例如: A812345678)'; // 請確認格式
      break;
    case 'ENTRY_PERMIT':
      // 入台證號碼驗證 (這裡只做一個簡單的非空檢查)
      isValid = value.length > 0; // 假設非空即可
      errorMessage = '請輸入正確的入台證號碼'; // 可以更具體
      break;
    default:
      // 如果證件類型未知或未選擇，可以選擇不做驗證或者報錯
      isValid = true; // 或者根據需要設置為 false
      errorMessage = '請選擇證件類型'; // 如果設定為 false 的話
      break;
  }

  if (isValid) {
    callback(); // 驗證通過
  } else {
    callback(new Error(errorMessage)); // 驗證失敗
  }
};

const rules = reactive({
  firstName: [{ required: true, message: '請輸入名字', trigger: 'blur' }],
  lastName: [{ required: true, message: '請輸入姓氏', trigger: 'blur' }],
  country: [{ required: true, message: '請選擇國家/地區', trigger: 'change' }],
  phoneNumber: [
    { required: true, message: '請輸入聯絡電話', trigger: 'blur' }, // 基本必填
    { validator: validatePhoneNumber, trigger: 'blur' } // 輸入完成後 (失去焦點時) 進行格式驗證
  ],
  countryCode: [{ required: true, message: '請選擇國碼', trigger: 'change' }],
  documentType: [{ required: true, message: '請選擇證件類型', trigger: 'change' }],
  documentNumber: [
    { required: true, message: '請輸入證件號碼', trigger: 'blur' }, // 基本必填檢查
    { validator: validateDocumentNumber, trigger: 'blur' }, // 使用自訂驗證函式
    { validator: validateDocumentNumber, trigger: ['blur', 'change'] }
  ],
  email: [
    { required: true, message: '請輸入電子郵件信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: ['blur', 'change'] }
  ],
  // updateProfile: [] // 空陣列表示沒有驗證規則
});

const asYouType = new AsYouType(); // 建立一個實例

watch(() => props.modelValue.phoneNumber, (newValue, oldValue) => {
  // 如果希望輸入電話號碼時就觸發驗證 (顯示紅字錯誤)
  if (newValue !== oldValue && formRef.value && props.modelValue.countryCode) {
    // 延遲一點觸發，避免過於頻繁且給使用者反應時間
    setTimeout(() => {
      formRef.value.validateField('phoneNumber', () => {}); // validateField 的回呼是可選的
    }, 100);
  }
});

// 當國碼改變時，也重置 AsYouType formatter (如果使用)
watch(() => props.modelValue.countryCode, () => {
  // 如果phoneNumber有值，且希望在國碼改變後立即重新驗證phoneNumber
  if (formRef.value) {
     // 稍微延遲，確保 phoneNumber 已經被清空
     setTimeout(() => {
       formRef.value.validateField('phoneNumber', () => {});
     }, 100);
  }
});

// --- watch 監聽器：當證件類型改變時，觸發證件號碼的驗證 ---
watch(() => props.modelValue.documentType, () => {
    // 當證件類型改變時，清空證件號碼已在 updateField 中處理
    // 這裡觸發驗證是為了確保在清空後，如果它是必填的，會立即顯示必填的錯誤提示
    if (formRef.value) {
        setTimeout(() => {
           formRef.value.validateField('documentNumber', () => {});
        }, 100); // 稍微延遲
    }
    // 當證件類型改變時，如果證件號碼有值，也觸發證件號碼的驗證，以便根據新類型驗證現有值
    if (props.modelValue.documentNumber && formRef.value) {
         setTimeout(() => {
            formRef.value.validateField('documentNumber', () => {});
         }, 100);
    }
});

// 暴露驗證方法給父組件 (如果父組件需要主動觸發表單驗證)
const validateForm = () => {
  return new Promise((resolve) => {
    if (!formRef.value) {
      return resolve(false); // 如果 formRef 不存在，直接返回 false
    }
    formRef.value.validate((valid, fields) => {
      if (valid) {
        resolve(true);
      } else {
        console.log('Form validation failed:', fields);
        resolve(false); // 或者 reject(fields)
      }
    });
  });
};
defineExpose({ validateForm });

</script>