<template>
  <div class="participant-form">
    <div class="form-row">
      <div class="form-col">
        <label for="participantFirstName">名字 <span class="required">*</span></label>
        <input type="text" id="participantFirstName" :value="modelValue.firstName"
               @input="updateField('firstName', $event.target.value)" required>
      </div>
      <div class="form-col">
        <label for="participantLastName">姓氏 <span class="required">*</span></label>
        <input type="text" id="participantLastName" :value="modelValue.lastName"
               @input="updateField('lastName', $event.target.value)" required>
      </div>
    </div>

    <div class="form-row">
      <div class="form-col">
        <label for="participantCountry">國家/地區 <span class="required">*</span></label>
        <select id="participantCountry" :value="modelValue.country"
                @change="updateField('country', $event.target.value)" required>
          <option v-for="country in sortedCountries" :key="country.code" :value="country.code">
            {{ country.name }} </option>
        </select>
      </div>
      <div class="form-col">
        <label for="participantPhoneNumber">聯絡電話 <span class="required">*</span></label>
        <div class="phone-input-group">
          <select class="phone-country-code"
                  :value="modelValue.countryCode"
                  @change="updateField('countryCode', $event.target.value)" required
                  disabled >
          <option value="+886">+886</option>
          </select>
           <input type="tel" id="participantPhoneNumber" class="phone-number" placeholder="電話號碼"
                  :value="modelValue.phoneNumber"
                  @input="updateField('phoneNumber', $event.target.value)" required>
        </div>
      </div>
    </div>

    <div class="form-row">
        <div class="form-col">
            <label for="participantDocType">證件類型 <span class="required">*</span></label>
            <select id="participantDocType" :value="modelValue.documentType"
                    @change="updateField('documentType', $event.target.value)" required>
                <option v-for="docType in documentTypes" :key="docType.value" :value="docType.value">
                    {{ docType.text }}
                </option>
            </select>
        </div>
        <div class="form-col">
            <label for="participantDocNumber">證件號碼 <span class="required">*</span></label>
            <input type="text" id="participantDocNumber" placeholder="請輸入證件號碼"
                   :value="modelValue.documentNumber"
                   @input="updateField('documentNumber', $event.target.value)" required>
        </div>
    </div>

    <div>
      <label for="participantEmail">電子郵件信箱 <span class="required">*</span></label>
      <input type="email" id="participantEmail" :value="modelValue.email"
             @input="updateField('email', $event.target.value)" required placeholder="example@email.com">
    </div>

    <div class="form-checkbox">
        <input type="checkbox" id="updateProfile" :checked="modelValue.updateProfile"
               @change="updateField('updateProfile', $event.target.checked)">
        <label for="updateProfile">同時更新會員資料</label>
    </div>

  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
// --- **修改：引入 i18n-iso-countries 和中文語言包** ---
import countries from 'i18n-iso-countries';
import zhLocale from '/zh-tw.json'; // 引入中文語言檔

// --- **註冊中文語言包** ---
countries.registerLocale(zhLocale);

// --- Props and Emits (同前) ---
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
        firstName: '', lastName: '', country: 'TW', countryCode: '+886',
        phoneNumber: '', email: '', updateProfile: false,
        // ** 新增：加入 documentType 和 documentNumber 的預設值 **
        documentType: 'ID_CARD_TW', // 預設為台灣身分證
        documentNumber: ''
    })
  }
});
const emit = defineEmits(['update:modelValue']);
const updateField = (field, value) => {
  const updatedInfo = { ...props.modelValue, [field]: value };
  emit('update:modelValue', updatedInfo);
};

// --- **修改：使用 i18n-iso-countries 準備國家列表** ---
const sortedCountries = computed(() => {
    // 獲取所有國家的物件 { 'TW': '台灣', 'JP': '日本', ... }
    const countryNames = countries.getNames('zh-tw', { select: 'official' }); // 使用官方名稱
    // 轉換成陣列 [{ code: 'TW', name: '台灣' }, ...]
    return Object.entries(countryNames)
        .map(([code, name]) => ({ code, name }))
        // 根據中文名稱排序
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-tw'));
});

// --- **新增：定義證件類型選項** ---
const documentTypes = ref([
    { value: 'ID_CARD_TW', text: '身分證' }, // Taiwan ID Card
    { value: 'PASSPORT', text: '護照' },    // Passport
    { value: 'ARC', text: '居留證' },       // Alien Resident Certificate (ARC)
    { value: 'ENTRY_PERMIT', text: '入台證' } // Entry Permit (for mainland China, HK, Macau residents)
    // 你可以根據需要調整 value 和 text
]);

// --- **修改：準備電話國碼列表（使用 i18n-iso-countries 獲取中文名）** ---
// **注意：** i18n-iso-countries 主要處理國家名，不直接提供電話國碼。
// 我們這裡採用「手動列出常用國碼，並用函式庫查詢對應中文名」的方式。
// 如果你需要非常完整的國碼列表，可能需要結合其他來源或函式庫。
// const commonCallingCodes = [
//     { code: '+886', country: 'TW' }, // 台灣
//     { code: '+86', country: 'CN' },  // 中國大陸
//     { code: '+852', country: 'HK' }, // 香港
//     { code: '+853', country: 'MO' }, // 澳門
//     { code: '+81', country: 'JP' },  // 日本
//     { code: '+82', country: 'KR' },  // 韓國
//     { code: '+1', country: 'US' },   // 美國
//     // ... 在這裡添加更多你需要的常用國碼和對應的 ISO 國家代碼 ...
// ];

// const callingCodesWithOptions = computed(() => {
//     return commonCallingCodes.map(item => {
//         // 使用 i18n-iso-countries 獲取中文國家名
//         const countryName = countries.getName(item.country, 'zh-tw');
//         return {
//             value: item.code, // value 仍然只是國碼, e.g., "+886"
//             text: `${item.code} (${countryName || item.country})` // text 是國碼 + 中文名 (如果找不到中文名就用代碼)
//         };
//     });
//     // 這個列表可以不用排序，或者根據國碼數字排序
//     // .sort((a,b) => parseInt(a.value.replace('+','')) - parseInt(b.value.replace('+','')))
// });

</script>

<style scoped>
/* --- 樣式 (同前) --- */
label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #555; }
input[type="text"], input[type="tel"], input[type="email"], select { width: 100%; padding: 10px 12px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-size: 1em; }
input:focus, select:focus { border-color: #007bff; outline: none; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); }
.required { color: #dc3545; margin-left: 2px; }
.form-row { display: flex; gap: 20px; margin-bottom: 20px; }
.form-col { flex: 1; }
.phone-input-group { display: flex; gap: 5px; }
.phone-country-code { flex: 0 0 100px; }
.phone-number { flex: 1; }
.form-checkbox { display: flex; align-items: center; margin-top: 20px; margin-bottom: 15px; }
.form-checkbox input[type="checkbox"] { width: auto; margin-right: 8px; cursor: pointer; }
.form-checkbox label { margin-bottom: 0; font-weight: normal; font-size: 0.95em; color: #333; cursor: pointer; }
</style>