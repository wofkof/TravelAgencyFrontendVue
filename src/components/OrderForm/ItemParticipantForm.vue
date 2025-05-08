<template>
  <div class="item-participant-form">
    <div v-if="numberOfParticipants === 0">
      <el-empty description="此項目無需填寫旅客資料。" />
    </div>
    <el-form label-position="top" class="participants-element-form" :model="formModelForValidation" ref="itemFormRef">
      <div v-for="(participant, pIndex) in participantsData" :key="participant.id || pIndex" class="participant-entry">
        <h4>
          旅客 {{ pIndex + 1 }}
          <span v-if="getParticipantType(pIndex)" class="participant-type">
            ({{ getParticipantType(pIndex) }})
          </span>
        </h4>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="國家/地區"
              :prop="`passengers[${pIndex}].country`"
              :rules="[{ required: true, message: '請選擇國家/地區', trigger: 'change' }]"
            >
              <el-select
                :model-value="participant.country || defaultCountry"
                @update:modelValue="updateParticipantField(pIndex, 'country', $event)"
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
            <el-form-item
              label="出生日期"
              :prop="`passengers[${pIndex}].birthDate`"
              :rules="[{ required: true, message: '請選擇出生日期', trigger: 'change' }]"
            >
              <el-date-picker
                type="date"
                :model-value="participant.birthDate || ''"
                @update:modelValue="updateParticipantField(pIndex, 'birthDate', $event)"
                placeholder="請選擇出生日期"
                style="width: 100%;"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="中文名"
              :prop="`passengers[${pIndex}].firstNameZh`"
              :rules="[{ required: true, message: '請輸入中文名', trigger: 'blur' }]"
            >
              <el-input
                :model-value="participant.firstNameZh || ''"
                @update:modelValue="updateParticipantField(pIndex, 'firstNameZh', $event)"
                placeholder="例: 小明"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="中文姓"
              :prop="`passengers[${pIndex}].lastNameZh`"
              :rules="[{ required: true, message: '請輸入中文姓', trigger: 'blur' }]"
            >
              <el-input
                :model-value="participant.lastNameZh || ''"
                @update:modelValue="updateParticipantField(pIndex, 'lastNameZh', $event)"
                placeholder="例: 陳"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item
          label="證件號碼 (身分證/護照)"
          :prop="`passengers[${pIndex}].documentNumber`"
          :rules="[{ required: true, message: '請輸入證件號碼', trigger: 'blur' }]"
        >
          <el-input
            :model-value="participant.documentNumber || ''"
            @update:modelValue="updateParticipantField(pIndex, 'documentNumber', $event)"
            placeholder="請輸入證件號碼"
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
  }
});

const emit = defineEmits(['update:participants']);

const participantsData = ref([]);// 本地響應式副本，用於表單操作
const itemFormRef = ref(null); // el-form 的 ref


// 為了讓 el-form 的 :model 和 :prop 配合工作，我們需要一個包裹 participantsData 的物件
// 這樣 prop 的路徑就是 'passengers[index].fieldName'
const formModelForValidation = reactive({
  passengers: [] // 這個陣列將與 participantsData 同步
});

// 監聽 participantsData 的變化，並更新 formModelForValidation.passengers
watch(participantsData, (newData) => {
  formModelForValidation.passengers = newData;
}, { deep: true });

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
  // 優先以 newCount 來決定陣列長度，並用 newParticipantsProp 的數據填充
    const newArray = [];
    for (let i = 0; i < newCount; i++) {
      const propData = newParticipantsProp[i] || {}; // 從父層來的資料
      const existingLocalData = participantsData.value[i] || {}; // 當前本地資料 (若長度改變前已存在)
      newArray.push({
        id: propData.id || existingLocalData.id || `participant-${i}-${Date.now()}`, // 確保每個 participant 有唯一 key
        country: propData.country || defaultCountry.value,
        firstNameZh: propData.firstNameZh || '',
        lastNameZh: propData.lastNameZh || '',
        documentNumber: propData.documentNumber || '',
        birthDate: propData.birthDate || null,
        ...propData, // 優先使用 prop 傳入的數據 (若有衝突)
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
  if (!participantsData.value[index]) {
    // 應該不會發生，因為 watch 會初始化
    participantsData.value[index] = { id: `participant-${index}-${Date.now()}` };
  }

  let processedValue = value;
  const fieldsToRemoveSpaces = ['firstNameZh', 'lastNameZh', 'documentNumber'];

  if (fieldsToRemoveSpaces.includes(field) && typeof value === 'string') {
    processedValue = value.replace(/\s/g, '');
  }

  // 更新本地 ref 陣列的特定元素，確保響應性
  const updatedParticipant = {
    ...participantsData.value[index],
    [field]: processedValue
  };
  participantsData.value.splice(index, 1, updatedParticipant);

  // 發送包含完整更新後陣列的事件
  emit('update:participants', participantsData.value.map(p => ({ ...p })));
    // 更新單個欄位後，觸發該欄位的驗證
  if (itemFormRef.value) {
    itemFormRef.value.validateField(`passengers[${index}].${field}`, () => {});
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