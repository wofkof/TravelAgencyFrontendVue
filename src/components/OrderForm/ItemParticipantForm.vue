<template>
  <div class="item-participant-form">
    <div v-if="numberOfParticipants === 0">
      <p>此項目無需填寫旅客資料。</p>
    </div>
    <div v-for="index in numberOfParticipants" :key="index" class="participant-entry">
      <h4>
        旅客 {{ index }}
        <span v-if="getParticipantType(index - 1)" class="participant-type">
          ({{ getParticipantType(index - 1) }})
        </span>
      </h4>

      <div class="form-row">
         <div class="form-col">
            <label :for="'travelerCountry' + uniqueIdPrefix + index">國家/地區 <span class="required">*</span></label>
            <select :id="'travelerCountry' + uniqueIdPrefix + index"
                    :value="participantsData[index - 1]?.country || defaultCountry"
                    @change="updateParticipantField(index - 1, 'country', $event.target.value)" required>
              <option v-for="country in sortedCountries" :key="country.code" :value="country.code">
                {{ country.name }}
              </option>
            </select>
         </div>
         <div class="form-col">
             <label :for="'travelerBirthDate' + uniqueIdPrefix + index">出生日期 <span class="required">*</span></label>
             <input type="date" :id="'travelerBirthDate' + uniqueIdPrefix + index"
                    :value="participantsData[index - 1]?.birthDate || ''"
                    @input="updateParticipantField(index - 1, 'birthDate', $event.target.value)" required>
         </div>
      </div>

      <div class="form-row">
        <div class="form-col">
          <label :for="'travelerFirstNameZh' + uniqueIdPrefix + index">中文名 <span class="required">*</span></label>
          <input type="text" :id="'travelerFirstNameZh' + uniqueIdPrefix + index" placeholder="例: 小明"
                 :value="participantsData[index - 1]?.firstNameZh || ''"
                 @input="updateParticipantField(index - 1, 'firstNameZh', $event.target.value)" required>
        </div>
        <div class="form-col">
          <label :for="'travelerLastNameZh' + uniqueIdPrefix + index">中文姓 <span class="required">*</span></label>
          <input type="text" :id="'travelerLastNameZh' + uniqueIdPrefix + index" placeholder="例: 陳"
                 :value="participantsData[index - 1]?.lastNameZh || ''"
                 @input="updateParticipantField(index - 1, 'lastNameZh', $event.target.value)" required>
        </div>
      </div>

       <div>
          <label :for="'travelerDocumentNumber' + uniqueIdPrefix + index">證件號碼 (身分證/護照) <span class="required">*</span></label>
          <input type="text" :id="'travelerDocumentNumber' + uniqueIdPrefix + index"
                 :value="participantsData[index - 1]?.documentNumber || ''"
                 @input="updateParticipantField(index - 1, 'documentNumber', $event.target.value)" required>
       </div>

       <hr v-if="index < numberOfParticipants" class="participant-divider">
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch, toRefs } from 'vue';
import countries from 'i18n-iso-countries';
// 假設中文語言包已在 OrderForm 或全局註冊過，如果沒有，需要在此元件或父元件註冊
// import zhLocale from 'i18n-iso-countries/langs/zh.json';
// countries.registerLocale(zhLocale);

const props = defineProps({
  orderItem: { // 接收單個訂單項目
    type: Object,
    required: true
  },
  participants: { // ** 接收屬於此商品的旅客陣列 v-model:participants **
    type: Array,
    required: true,
    default: () => []
  }
});

// 使用 toRefs 保持對 participants prop 的響應性引用
const { participants } = toRefs(props);
// 或者直接使用 props.participants

const emit = defineEmits(['update:participants']);

// 為 ID 生成唯一前綴，避免多個 ItemParticipantForm 實例的 ID 衝突
const uniqueIdPrefix = computed(() => `item-${props.orderItem.id}-`);

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

// 計算每個旅客欄位的類型 (如果 item 有 options 的話)
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

// 獲取指定索引的旅客類型
const getParticipantType = (index) => {
    return participantTypes.value[index] || '';
};


// 監聽所需旅客數量變化，初始化或調整本地 participantsData
// (重要：子元件內部最好不要直接修改 prop，而是修改本地副本再 emit)
const participantsData = ref([...props.participants]); // 創建本地副本

watch(() => props.participants, (newVal) => {
    // 當父元件傳來的 prop 變化時，更新本地副本
    participantsData.value = [...newVal];
}, { deep: true }); // 深度監聽

watch(numberOfParticipants, (newCount) => {
    // 根據新的數量調整本地副本的長度
    const currentLength = participantsData.value.length;
    if (newCount > currentLength) {
        for (let i = currentLength; i < newCount; i++) {
            participantsData.value.push({
                country: 'TW', // 預設值
                firstNameZh: '',
                lastNameZh: '',
                documentNumber: '',
                birthDate: null,
                // Add other fields with defaults if needed
            });
        }
    } else if (newCount < currentLength) {
        participantsData.value.splice(newCount);
    }
     // 不需要立即 emit，等欄位更新時再 emit
}, { immediate: true });


// 更新本地旅客資料並 emit 更新事件
const updateParticipantField = (index, field, value) => {
  if (!participantsData.value[index]) {
    // 理論上 watch 應該已經初始化了，但做個防禦性處理
    participantsData.value[index] = {};
  }
  // 直接修改本地 ref 陣列的元素
  participantsData.value[index] = {
      ...participantsData.value[index],
      [field]: value
  };
  // 發送包含完整更新後陣列的事件
  emit('update:participants', [...participantsData.value]);
};


// 國家列表 (與 ParticipantForm 類似)
const defaultCountry = 'TW'; // 預設國家
const sortedCountries = computed(() => {
    const countryNames = countries.getNames('zh', { select: 'official' });
    return Object.entries(countryNames)
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
});

</script>

<style scoped>
/* 與 MultiParticipantForm 類似的樣式 */
.item-participant-form { padding-top: 10px; }
.participant-entry { margin-bottom: 30px; padding-bottom: 20px; /* border-bottom: 1px solid #eee; */ }
.participant-entry:last-child { margin-bottom: 0; padding-bottom: 0; /* border-bottom: none; */ }
.participant-entry h4 { font-size: 1.05em; margin-bottom: 20px; color: #333; border-left: 3px solid #007bff; padding-left: 8px; }
.participant-type { font-weight: normal; color: #555; font-size: 0.9em; }
label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #555; }
input[type="text"], input[type="tel"], input[type="email"], input[type="date"], select { width: 100%; padding: 10px 12px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-size: 1em; }
input:focus, select:focus { border-color: #007bff; outline: none; box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); }
.required { color: #dc3545; margin-left: 2px; }
.form-row { display: flex; gap: 20px; margin-bottom: 15px; }
.form-col { flex: 1; }
.participant-divider { border: none; border-top: 1px dashed #ccc; margin-top: 30px; }
</style>