<template>
  <div class="item-participant-form">
    <div v-if="numberOfParticipants === 0">
      <el-empty description="此項目無需填寫旅客資料。" />
    </div>
    <el-form label-position="top" class="participants-element-form" :model="formModelForValidation" ref="itemFormRef">
      <div v-for="(participant, pIndex) in participantsData" :key="participant.id || pIndex" class="participant-entry">
        <h4>旅客 {{ pIndex + 1 }} <span v-if="getParticipantType(pIndex)" class="participant-type">({{ getParticipantType(pIndex) }})</span></h4>

        <el-form-item label="常用名單">
          <el-select :model-value="participant.selectedFrequentTraveler" @update:modelValue="handleFrequentTravelerSelect(pIndex, $event)" placeholder="選擇常用旅客或自行填寫" clearable style="width: 100%;">
            <el-option label="-- 自行填寫 --" :value="null" />
            <el-option v-for="traveler in frequentTravelers" :key="traveler.id" :label="traveler.label" :value="traveler.id" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="中文姓" :prop="`passengers[${pIndex}].lastNameZh`" :rules="getRulesForField(pIndex, 'lastNameZh')">
              <el-input :model-value="participant.lastNameZh" @update:modelValue="updateParticipantField(pIndex, 'lastNameZh', $event)" placeholder="例: 王" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="中文名" :prop="`passengers[${pIndex}].firstNameZh`" :rules="getRulesForField(pIndex, 'firstNameZh')">
              <el-input :model-value="participant.firstNameZh" @update:modelValue="updateParticipantField(pIndex, 'firstNameZh', $event)" placeholder="例: 小明" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12"> <el-form-item label="性別" :prop="`passengers[${pIndex}].gender`" :rules="getRulesForField(pIndex, 'gender')">
              <el-select :model-value="participant.gender" @update:modelValue="updateParticipantField(pIndex, 'gender', $event)" placeholder="請選擇" style="width: 100%;">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"> <el-form-item label="出生年月日" :prop="`passengers[${pIndex}].birthDate`" :rules="getRulesForField(pIndex, 'birthDate')">
              <el-date-picker type="date" :model-value="participant.birthDate" @update:modelValue="updateParticipantField(pIndex, 'birthDate', $event)" placeholder="選擇日期" format="YYYY/MM/DD" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item label="國籍" :prop="`passengers[${pIndex}].country`" :rules="getRulesForField(pIndex, 'country')">
                  <el-select :model-value="participant.country" @update:modelValue="updateParticipantField(pIndex, 'country', $event)" placeholder="選擇國籍" filterable style="width: 100%;">
                    <el-option v-for="country in sortedCountries" :key="country.code" :label="country.name" :value="country.code"/>
                  </el-select>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item
                    label="身分證字號"
                    :prop="`passengers[${pIndex}].idNumber`"
                    :rules="getRulesForField(pIndex, 'idNumber')"
                >
                    <el-input :model-value="participant.idNumber" @update:modelValue="updateParticipantField(pIndex, 'idNumber', $event)" placeholder="請輸入身分證字號 (台灣國籍適用)" />
                </el-form-item>
            </el-col>
        </el-row>

        <template v-if="isInternationalTravel">
          <el-divider content-position="left">護照資訊 (國際旅遊適用)</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="英文姓 (同護照)" :prop="`passengers[${pIndex}].lastNameEn`" :rules="getRulesForField(pIndex, 'lastNameEn')">
                <el-input :model-value="participant.lastNameEn" @update:modelValue="updateParticipantField(pIndex, 'lastNameEn', $event)" placeholder="例: WANG" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="英文名 (同護照)" :prop="`passengers[${pIndex}].firstNameEn`" :rules="getRulesForField(pIndex, 'firstNameEn')">
                <el-input :model-value="participant.firstNameEn" @update:modelValue="updateParticipantField(pIndex, 'firstNameEn', $event)" placeholder="例: DA-MING" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="護照號碼 (選填)" :prop="`passengers[${pIndex}].passportNumber`" :rules="getRulesForField(pIndex, 'passportNumber')">
                <el-input :model-value="participant.passportNumber" @update:modelValue="updateParticipantField(pIndex, 'passportNumber', $event)" placeholder="請輸入護照號碼" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="護照效期到期日" :prop="`passengers[${pIndex}].passportExpiryDate`" :rules="getRulesForField(pIndex, 'passportExpiryDate')">
                <el-date-picker type="date" :model-value="participant.passportExpiryDate" @update:modelValue="updateParticipantField(pIndex, 'passportExpiryDate', $event)" placeholder="選擇護照到期日" format="YYYY/MM/DD" value-format="YYYY-MM-DD" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>

        </template>
        <el-form-item label="特殊需求備註 (例如：食物過敏、行動不便等)" :prop="`passengers[${pIndex}].remarks`" :rules="getRulesForField(pIndex, 'remarks')">
          <el-input
            type="textarea"
            :rows="3"
            :model-value="participant.remarks"
            @update:modelValue="updateParticipantField(pIndex, 'remarks', $event)"
            placeholder="請在此輸入旅客的特殊需求或注意事項"
            clearable
          />
        </el-form-item>
        <el-divider v-if="pIndex < numberOfParticipants - 1" class="participant-divider" />
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch, reactive } from 'vue';
import countries from 'i18n-iso-countries';

const props = defineProps({
  orderItem: {
    type: Object,
    required: true
  },
  participants: { // v-model:participants
    type: Array,
    required: true,
    default: () => []
  },
    tripDestinationCountry: { // <-- 行程目的地國家代碼 (例如 'TW', 'JP')
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:participants']);

const participantsData = ref([]);// 本地響應式副本，用於表單操作
const itemFormRef = ref(null); // el-form 的 ref

const isInternationalTravel = computed(() => props.tripDestinationCountry !== 'TW');

// 常用旅客列表 (範例，應從 Store 或 API 獲取)
const frequentTravelers = ref([
  // 應包含與旅客資料結構相似的欄位
  { id: 'ft1', label: '本人 (王小明)', data: { lastNameZh: '王', firstNameZh: '小明', gender: 'male', country: 'TW', birthDate: '1990-01-01', documentNumber: 'A123456789' } },
  { id: 'ft2', label: '常用旅客 (陳大文)', data: { lastNameZh: '陳', firstNameZh: '大文', gender: 'male', country: 'US', birthDate: '1985-05-05', documentNumber: 'P12345678', lastNameEn: 'CHEN', firstNameEn: 'DA-WEN', passportExpiryDate: '2030-12-31' } }
]);


// 為了讓 el-form 的 :model 和 :prop 配合工作，我們需要一個包裹 participantsData 的物件
// 這樣 prop 的路徑就是 'passengers[index].fieldName'
const formModelForValidation = reactive({
  passengers: [] // 這個陣列將與 participantsData 同步
});

// 監聽 participantsData 的變化，並更新 formModelForValidation.passengers
watch(participantsData, (newData) => {
  formModelForValidation.passengers = newData;
}, { deep: true });

const rules = computed(() => {
  return {
    // 這裡的 prop 路徑需要與 formModelForValidation 一致
    // 例如 'passengers[pIndex].firstNameZh'
  };
});

// 動態驗證規則生成
const getRulesForField = (pIndex, fieldName) => {
    const baseRules = [];
    const currentParticipant = participantsData.value[pIndex] || {};
    if (['lastNameZh', 'firstNameZh', 'gender', 'country', 'birthDate'].includes(fieldName)) {
        baseRules.push({ required: true, message: `請輸入或選擇${getLabelForField(fieldName)}`, trigger: ['blur', 'change'] });
    }

    if (fieldName === 'idNumber') {
        // 身分證字號：當國籍為台灣(TW)時必填
        const required = currentParticipant.country === 'TW';
        if (required) {
            baseRules.push({ required: true, message: '請輸入身分證字號 (台灣國籍必填)', trigger: 'blur' });
            // 可加上台灣身分證格式驗證器
        }
    }
    // 國際旅遊欄位
    if (['lastNameEn', 'firstNameEn', 'passportExpiryDate'].includes(fieldName)) {
        baseRules.push({ required: isInternationalTravel.value, message: `請輸入或選擇${getLabelForField(fieldName)}`, trigger: ['blur', 'change'] });
    }

    // 護照號碼 (國際旅遊時才顯示，但非必填)
    if (fieldName === 'passportNumber') {
        baseRules.push({ required: false, message: '請輸入護照號碼 (國際旅遊時可選填)', trigger: 'blur' });
    }

    if (fieldName === 'remarks') {
        baseRules.push({ max: 200, message: '備註內容不得超過 200 字', trigger: 'blur' });
    }
    return baseRules;
};

const getLabelForField = (fieldName) => { // 輔助函式，用於生成錯誤訊息
    const labels = {
        lastNameZh: '中文姓', firstNameZh: '中文名', gender: '性別',
        country: '國籍', birthDate: '出生年月日', documentNumber: '證件號碼',
        lastNameEn: '英文姓', firstNameEn: '英文名', passportExpiryDate: '護照到期日',
        remarks: '特殊需求備註'
    };
    return labels[fieldName] || fieldName;
};

// 初始化和同步 props.participants 到本地 participantsData
const syncParticipantsData = (count) => {
  const newParticipantsArray = [];
  for (let i = 0; i < count; i++) {
    const existingParticipant = props.participants[i] || {};
    newParticipantsArray.push({
      id: existingParticipant.id || `temp-${i}-${Date.now()}`, // 確保有 key，或使用 pIndex
      country: existingParticipant.country || defaultCountry.value,
      firstNameZh: existingParticipant.firstNameZh || '',
      lastNameZh: existingParticipant.lastNameZh || '',
      documentNumber: existingParticipant.documentNumber || '',
      birthDate: existingParticipant.birthDate || null,
      // 保留其他可能的既有欄位
      ...existingParticipant
    });
  }
  participantsData.value = newParticipantsArray;
};


// 計算此項目需要的旅客數量
const numberOfParticipants = computed(() => {
  let quantity = 0;
  if (props.orderItem.options && props.orderItem.options.length > 0) {
    quantity = props.orderItem.options.reduce((sum, option) => sum + option.quantity, 0);
  } else if (props.orderItem.quantity) {
    quantity = props.orderItem.quantity;
  }
  return quantity;
});

// 監聽 props.participants (來自父層的 v-model) 和 numberOfParticipants 的變化
watch([() => props.participants, numberOfParticipants], ([newParticipantsProp, newCount]) => {
  const newArray = [];
  for (let i = 0; i < newCount; i++) {
    const propData = newParticipantsProp[i] || {};
    newArray.push({
      id: propData.id || `pax-<span class="math-inline">\{i\}\-</span>{Date.now()}`,
      selectedFrequentTraveler: propData.selectedFrequentTraveler || null,
      lastNameZh: propData.lastNameZh || '',
      firstNameZh: propData.firstNameZh || '',
      gender: propData.gender || '',
      country: propData.country || defaultCountry.value,
      birthDate: propData.birthDate || null,
      idNumber: propData.idNumber || '',
      lastNameEn: propData.lastNameEn || '',
      firstNameEn: propData.firstNameEn || '',
      passportNumber: propData.passportNumber || '',
      passportExpiryDate: propData.passportExpiryDate || null,
      remarks: propData.remarks || '',
      ...propData
    });
  }
  participantsData.value = newArray;
}, { immediate: true, deep: true });


// 計算每個旅客欄位的類型
const participantTypes = computed(() => {
  const types = [];
  if (props.orderItem.options && props.orderItem.options.length > 0) {
    props.orderItem.options.forEach(option => {
      for (let i = 0; i < option.quantity; i++) {
        types.push(option.type);
      }
    });
  } else if (props.orderItem.quantity) {
    for (let i = 0; i < props.orderItem.quantity; i++) {
      types.push(null); // 沒有特定類型
    }
  }
  return types;
});

const getParticipantType = (index) => {
  return participantTypes.value[index] || '';
};

// 更新本地旅客資料並 emit 更新事件
const updateParticipantField = (index, field, value) => {
  let processedValue = value;
  if (typeof value === 'string') processedValue = value.replace(/\s/g, '');

  // 更新本地 ref 陣列的特定元素，確保響應性
  const updatedParticipant = {
    ...participantsData.value[index],
    [field]: processedValue
  };

  participantsData.value.splice(index, 1, updatedParticipant);

  emit('update:participants', [...participantsData.value]); // 確保發送新陣列以觸發響應
    // 更新單個欄位後，觸發該欄位的驗證
  if (itemFormRef.value) {
    itemFormRef.value.validateField(`passengers[${index}].${field}`, () => {});
  }
};

// 選擇常用旅客後填充表單
const handleFrequentTravelerSelect = (index, selectedId) => {
    const currentParticipant = { ...participantsData.value[index] }; // 取得當前旅客的資料副本
    let travelerDataToFill = { // 預設清空或部分保留
        lastNameZh: '', firstNameZh: '', gender: '', country: defaultCountry.value,
        birthDate: null, documentNumber: '', lastNameEn: '', firstNameEn: '',
        passportNumber: '',
        passportExpiryDate: null,
        remarks: ''
    };

    if (selectedId) {
        const selectedTraveler = frequentTravelers.value.find(ft => ft.id === selectedId);
        if (selectedTraveler && selectedTraveler.data) {
            travelerDataToFill = { ...travelerDataToFill, ...selectedTraveler.data };
        }
    }
    // 更新旅客資料，並保留選擇的 selectedFrequentTraveler
    const updatedParticipant = {
        ...currentParticipant, // 保留 id 等其他可能存在的欄位
        ...travelerDataToFill,
        selectedFrequentTraveler: selectedId
    };
    participantsData.value.splice(index, 1, updatedParticipant);
    emit('update:participants', [...participantsData.value]);

    // 填充後可能需要手動觸發所有相關欄位的驗證
    if (itemFormRef.value) {
        const fieldsToValidate = ['lastNameZh', 'firstNameZh', 'gender', 'country', 'birthDate', 'documentNumber'];
        if (isInternationalTravel.value) {
            fieldsToValidate.push('lastNameEn', 'firstNameEn', 'passportExpiryDate');
        }
        fieldsToValidate.forEach(field => {
            itemFormRef.value.validateField(`passengers[<span class="math-inline">\{index\}\]\.</span>{field}`, () => {});
        });
    }
};

const defaultCountry = ref('TW'); // 預設國家，設為 ref 以便將來可能動態更改

// 國家列表
const sortedCountries = computed(() => {
  // 建議使用 'zh-TW' 或你註冊時使用的確切繁體中文代碼
  try {
    const countryNames = countries.getNames('zh-TW', { select: 'official' });
    if (!countryNames || Object.keys(countryNames).length === 0) {
      console.warn("i18n-iso-countries: 無法獲取 'zh-TW' 的國家名稱，請確認語言包已正確註冊。將使用 'zh' 作為備選。");
      const fallbackNames = countries.getNames('zh', { select: 'official' });
      return Object.entries(fallbackNames)
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
    }
    return Object.entries(countryNames)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
  } catch (e) {
    console.error("獲取國家列表時發生錯誤:", e);
    return [{ code: 'TW', name: '台灣 (預設)'}]; // 提供備選，避免渲染錯誤
  }
});

// 如果需要從父元件觸發整個 ItemParticipantForm 的驗證
const validateAll = () => {
  return new Promise((resolve, reject) => {
    if (itemFormRef.value) {
      itemFormRef.value.validate((valid, fields) => {
        if (valid) {
          resolve(true);
        } else {
          console.log('ItemParticipantForm validation failed:', fields);
          reject(fields);
        }
      });
    } else {
      resolve(true); // 或者 reject，如果表單不存在則認為無需驗證或驗證失敗
    }
  });
};

// 暴露驗證方法給父組件
defineExpose({ validateAll });

</script>

<style scoped>
/* 保留必要的自訂樣式，大部分由 Element Plus 處理 */
.item-participant-form {
  padding-top: 10px;
}
.participant-entry {
  margin-bottom: 25px;
  padding-bottom: 15px;
}
.participant-entry:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
}
.participant-entry h4 {
  font-size: 1.1em; /* Element Plus 標題通常較大，此處可自訂 */
  margin-bottom: 18px; /* el-form-item 會處理部分間距 */
  color: var(--el-text-color-primary); /* 使用 Element Plus 變數 */
  border-left: 3px solid var(--el-color-primary);
  padding-left: 10px;
}
.participant-type {
  font-weight: normal;
  color: var(--el-text-color-secondary);
  font-size: 0.9em;
}
.participant-divider {
  margin-top: 25px; /* 調整分隔線與上方元素的間距 */
}
</style>