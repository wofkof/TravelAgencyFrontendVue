<template>
    <div class="item-participant-form">
    <div v-if="numberOfParticipants === 0">
        <el-empty description="此項目無需填寫旅客資料。" />
    </div>
    <el-form 
      v-else 
      label-position="top" 
      class="participants-element-form" 
      :model="formModelForValidation" 
      ref="itemFormRef"
    >
      <div v-for="(participant, pIndex) in participantsData" :key="participant.id || pIndex" class="participant-entry">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
            <h4 style="margin-bottom: 0; margin-right: 10px;">旅客 {{ pIndex + 1 }} 
            <span v-if="getParticipantType(pIndex)" class="participant-type">
                ({{ getParticipantType(pIndex) }})
            </span>
            </h4>
            <el-checkbox
                :model-value="participant.updateThisTravelerProfile"
                @update:modelValue="updateParticipantField(pIndex, 'updateThisTravelerProfile', $event)"
                :disabled="participant.selectedFrequentTraveler === 'MEMBER_SELF'"
                label="更新旅客資料"
                size="small"
            />
        </div>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="常用名單">
              <el-select 
                :model-value="participant.selectedFrequentTraveler" 
                @update:modelValue="handleFrequentTravelerSelect(pIndex, $event)" 
                placeholder="選擇常用旅客或自行填寫" 
                clearable 
                style="width: 100%;"
              >
                <el-option label="-- 自行填寫 --" :value="null" />
                <el-option 
                    v-for="traveler in frequentTravelers" 
                    :key="traveler.id" 
                    :label="traveler.textLabel" 
                    :value="traveler.dbId" >
                    <span v-html="traveler.htmlLabel"></span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="國籍" :prop="`passengers[${pIndex}].country`" :rules="getRulesForField(pIndex, 'country')">
              <el-select 
                :model-value="participant.country" 
                @update:modelValue="updateParticipantField(pIndex, 'country', $event)" 
                placeholder="選擇國籍" 
                filterable 
                style="width: 100%;"
              >
                <el-option v-for="country in sortedCountries" :key="country.code" :label="country.name" :value="country.code"/>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

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
          <el-col :span="12">
            <el-form-item label="性別" :prop="`passengers[${pIndex}].gender`" :rules="getRulesForField(pIndex, 'gender')">
              <el-select :model-value="participant.gender" @update:modelValue="updateParticipantField(pIndex, 'gender', $event)" placeholder="請選擇" style="width: 100%;">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生年月日" :prop="`passengers[${pIndex}].birthDate`" :rules="getRulesForField(pIndex, 'birthDate')">
              <el-date-picker type="date" :model-value="participant.birthDate" @update:modelValue="updateParticipantField(pIndex, 'birthDate', $event)" placeholder="選擇日期" format="YYYY/MM/DD" value-format="YYYY-MM-DD" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item label="證件類型" :prop="`passengers[${pIndex}].documentType`" :rules="getRulesForField(pIndex, 'documentType')">
                    <el-select
                        :model-value="participant.documentType"
                        @update:modelValue="updateParticipantField(pIndex, 'documentType', $event)"
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
                <el-form-item
                    v-if="participant.documentType === 'ID_CARD_TW'"
                    :label="getDynamicDocumentLabel(pIndex)"
                    :prop="`passengers[${pIndex}].idNumber`"
                    :rules="getRulesForField(pIndex, 'idNumber')" 
                >
                    <el-input 
                        :model-value="participant.idNumber" 
                        @update:modelValue="updateParticipantField(pIndex, 'idNumber', $event)" 
                        :placeholder="getDynamicDocumentPlaceholder(pIndex)" 
                    />
                </el-form-item>
                <el-form-item
                    v-else 
                    :label="getDynamicDocumentLabel(pIndex)"
                    :prop="`passengers[${pIndex}].documentNumber`"
                    :rules="getRulesForField(pIndex, 'documentNumber')"
                >
                    <el-input 
                        :model-value="participant.documentNumber" 
                        @update:modelValue="updateParticipantField(pIndex, 'documentNumber', $event)" 
                        :placeholder="getDynamicDocumentPlaceholder(pIndex)" 
                    />
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
              <el-form-item 
                label="護照號碼 (選填)" 
                :prop="`passengers[${pIndex}].passportNumber`" 
                :rules="getRulesForField(pIndex, 'passportNumber')">
                <el-input 
                    :model-value="participant.passportNumber" 
                    @update:modelValue="updateParticipantField(pIndex, 'passportNumber', $event)" 
                    placeholder="請輸入護照號碼"
                    :disabled="participant.documentType === 'PASSPORT'" 
                />
                <div v-if="participant.documentType === 'PASSPORT'" class="el-form-item__extra-tip">
                    此欄位與上方 {{ getDynamicDocumentLabel(pIndex) }} 同步
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="護照效期到期日" :prop="`passengers[${pIndex}].passportExpiryDate`" :rules="getRulesForField(pIndex, 'passportExpiryDate')">
                <el-date-picker type="date" :model-value="participant.passportExpiryDate" @update:modelValue="updateParticipantField(pIndex, 'passportExpiryDate', $event)" placeholder="選擇護照到期日" format="YYYY/MM/DD" value-format="YYYY-MM-DD" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <el-form-item
          label="特殊需求備註 (例如：食物過敏、行動不便等)"
          :prop="`passengers[${pIndex}].remarks`"
          :rules="getRulesForField(pIndex, 'remarks')"
          class="remarks-form-item"
        >
          <el-input
            type="textarea"
            :rows="3"
            :model-value="participant.remarks"
            @update:modelValue="updateParticipantField(pIndex, 'remarks', $event)"
            placeholder="請在此輸入旅客的特殊需求或注意事項"
            clearable
            maxlength="200" show-word-limit
          />
        </el-form-item>

        <el-divider v-if="pIndex < numberOfParticipants - 1" class="participant-divider" />
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch, reactive, nextTick, onMounted } from 'vue';
import countries from 'i18n-iso-countries'; // 引入國家代碼轉換函式庫
import { getFavoriteTravelersAPI, getMemberDetailsForOrder } from '@/utils/orderapi'; 
import { useAuthStore } from '@/stores/authStore';

// --- 組件 Props 定義 ---
const props = defineProps({
  // 當前訂單項目資料，包含行程開始/結束日期等資訊
  orderItem: { 
    type: Object,
    required: true
  },
  // v-model 綁定的旅客資料陣列，由父組件傳入和同步更新
  participants: { 
    type: Array,
    required: true,
    default: () => [] // 預設為空陣列
  },
  // 行程目的地國家代碼 (例如 'TW', 'JP')，用於判斷是否為國際旅遊
  tripDestinationCountry: { 
    type: String,
    required: true
  }
});

// --- 組件 Emits 定義 ---
const emit = defineEmits([
  'update:participants', // 用於 v-model 同步父組件的 participants 資料
  'validity-changed'     // 當此表單區塊的整體驗證狀態改變時觸發，通知父組件
]);

// --- 響應式狀態變數 ---
const participantsData = ref([]);
const itemFormRef = ref(null);
const isFormValid = ref(false);
const authStore = useAuthStore();

// --- 計算屬性 ---
const isInternationalTravel = computed(() => props.tripDestinationCountry !== 'TW');

// 證件類型選項，包含其後端值(value)、UI顯示文字(text)、動態標籤(label)和提示文字(placeholder)
const documentTypes = ref([
    { value: 'ID_CARD_TW', text: '身分證 (台灣)', label: '身分證字號', placeholder: '例: A123456789'},
    { value: 'PASSPORT', text: '護照', label: '護照號碼', placeholder: '請輸入護照號碼'},
    { value: 'ARC', text: '居留證', label: '居留證號碼', placeholder: '例: A812345678'},
    { value: 'ENTRY_PERMIT', text: '入台證', label: '入台證號碼', placeholder: '請輸入入台證號碼'}
]);

/**
 * 根據旅客選擇的證件類型，動態獲取對應證件號碼輸入框的標籤文字。
 * @param {number} pIndex - 旅客在 participantsData 陣列中的索引。
 * @returns {string} 對應的標籤文字。
 */
const getDynamicDocumentLabel = (pIndex) => {
    const participant = participantsData.value[pIndex];
    if (participant && participant.documentType) {
        const docTypeInfo = documentTypes.value.find(dt => dt.value === participant.documentType);
        return docTypeInfo ? docTypeInfo.label : '證件號碼'; // 若找不到對應類型，使用通用標籤
    }
    return documentTypes.value.find(dt => dt.value === 'ID_CARD_TW')?.label || '身分證字號';
};

/**
 * 根據旅客選擇的證件類型，動態獲取對應證件號碼輸入框的提示文字 (placeholder)。
 * @param {number} pIndex - 旅客在 participantsData 陣列中的索引。
 * @returns {string} 對應的提示文字。
 */
const getDynamicDocumentPlaceholder = (pIndex) => {
    const participant = participantsData.value[pIndex];
    if (participant && participant.documentType) {
        const docTypeInfo = documentTypes.value.find(dt => dt.value === participant.documentType);
        return docTypeInfo ? docTypeInfo.placeholder : '請輸入號碼';
    }
    return '請先選擇證件類型';
};

// 常用旅客列表範例資料
// 注意：每個常用旅客物件中新增 `dbId` 欄位，假設其值為後端資料庫中的 FavoriteTravelerId。
const frequentTravelers = ref([]);
const isLoadingFrequentTravelers = ref(false);

// 用於 Element Plus 表單驗證的模型
const formModelForValidation = reactive({
    passengers: [] 
});

// 【新增】自訂驗證函數，檢查證件號碼在當前表單內的唯一性
const validateUniqueDocumentNumber = (rule, value, callback) => {
    // rule.field 的格式會是 "passengers[INDEX].idNumber" 或 "passengers[INDEX].documentNumber"
    // value 是當前輸入框的值

    if (!value) { // 如果值為空，則由必填規則處理，這裡直接通過
        return callback();
    }

    const fieldPath = rule.field;
    const match = fieldPath.match(/passengers\[(\d+)\]/);
    if (!match) {
        // 無法解析出旅客索引，理論上不應發生
        return callback();
    }
    const currentIndex = parseInt(match[1]); // 當前正在驗證的旅客索引

    const currentParticipant = participantsData.value[currentIndex];
    if (!currentParticipant) return callback(); // 理論上不應發生

    const currentDocType = currentParticipant.documentType;
    const normalizedCurrentValue = String(value).trim().toUpperCase(); // 標準化當前輸入值以便比較

    // 遍歷此 ItemParticipantForm 中的所有旅客
    for (let i = 0; i < participantsData.value.length; i++) {
        if (i === currentIndex) {
            continue; // 跳過與自身的比較
        }

        const otherParticipant = participantsData.value[i];

        // 僅當證件類型相同時才進行比較
        if (otherParticipant.documentType === currentDocType) {
            let otherValueToCompare = '';
            if (currentDocType === 'ID_CARD_TW') {
                otherValueToCompare = (otherParticipant.idNumber || '').trim().toUpperCase();
            } else if (currentDocType) { // 適用於 PASSPORT, ARC, ENTRY_PERMIT 等
                otherValueToCompare = (otherParticipant.documentNumber || '').trim().toUpperCase();
            }

            if (otherValueToCompare && otherValueToCompare === normalizedCurrentValue) {
                // 找到重複
                const docTypeInfo = documentTypes.value.find(dt => dt.value === currentDocType);
                const docLabel = docTypeInfo ? docTypeInfo.label : (currentDocType === 'ID_CARD_TW' ? '身分證字號' : '證件號碼');
                return callback(new Error(`${docLabel} "${value}" 已在旅客 ${i + 1} 的資料中使用。`));
            }
        }
    }
    return callback(); // 沒有重複，驗證通過
};


function splitName(fullName) {
  if (!fullName || typeof fullName !== 'string' || fullName.length === 0) return { lastName: '', firstName: '' };
  return { lastName: fullName.substring(0, 1), firstName: fullName.substring(1) };
}

function mapBackendDocTypeToFrontend(backendDocType) {
  if (backendDocType === 0) return 'ID_CARD_TW';
  if (backendDocType === 1) return 'PASSPORT';
  if (backendDocType === 2) return 'ARC';
  if (backendDocType === 3) return 'ENTRY_PERMIT';
  return 'ID_CARD_TW'; // 預設
}

function mapMemberDetailsToTravelerData(memberDetails, isIntl) {
    if (!memberDetails) return null;
    const nameParts = splitName(memberDetails.name || authStore.memberName);
    let memberDocType = mapBackendDocTypeToFrontend(memberDetails.documentType);
    let memberIdNumber = '';
    let memberDocumentNumber = '';

    if (memberDocType === 'ID_CARD_TW') {
        memberIdNumber = memberDetails.idNumber || '';
    } else {
        memberDocumentNumber = memberDetails.documentNumber || memberDetails.idNumber || '';
    }

    let gender = null;
    if (memberDetails.gender !== undefined && memberDetails.gender !== null) {
        // 假設 mapBackendGenderToFrontend 也在此作用域
        // gender = mapBackendGenderToFrontend(memberDetails.gender);
        // 或者直接轉換：
        if (typeof memberDetails.gender === 'number') {
            if (memberDetails.gender === 0) gender = 'male';
            else if (memberDetails.gender === 1) gender = 'female';
            else if (memberDetails.gender === 2) gender = 'other';
        } else if (typeof memberDetails.gender === 'string') {
            const lowerGender = memberDetails.gender.toLowerCase();
            if (['male', 'female', 'other'].includes(lowerGender)) {
                gender = lowerGender;
            }
        }
    }
    
    let birthDate = null;
    if (memberDetails.birthDate) {
        try {
            birthDate = new Date(memberDetails.birthDate).toISOString().split('T')[0];
        } catch (e) {
            console.error("Error formatting member birthDate:", e);
        }
    }

    return {
        lastNameZh: nameParts.lastName,
        firstNameZh: nameParts.firstName,
        gender: gender,
        birthDate: birthDate,
        country: memberDetails.nationality || 'TW',
        documentType: memberDocType,
        idNumber: memberIdNumber,
        documentNumber: memberDocumentNumber,
        lastNameEn: memberDetails.passportSurname || '',
        firstNameEn: memberDetails.passportGivenName || '',
        passportNumber: (memberDocType === 'PASSPORT' && isIntl) ? memberDocumentNumber : '',
        passportExpiryDate: memberDetails.passportExpireDate ? new Date(memberDetails.passportExpireDate).toISOString().split('T')[0] : null,
        remarks: '',
    };
}



onMounted(async () => {
  const memberId = authStore.memberId;

  if (memberId) {
    isLoadingFrequentTravelers.value = true;
    try {
      // 1. 獲取已保存的常用旅客列表
      const travelersFromApi = await getFavoriteTravelersAPI(memberId);
      let mappedFrequentTravelers = travelersFromApi.map(travelerApiDto => {
        // ... (你現有的轉換 travelerApiDto 的邏輯保持不變)
        // (這裡複製你原有的轉換邏輯)
        let travelerName = travelerApiDto.name || '未知旅客';
        let travelerNationality = travelerApiDto.nationality || 'N/A';
        let genderText = '其他';
        if (travelerApiDto.gender === 0) genderText = '男';
        else if (travelerApiDto.gender === 1) genderText = '女';

        let lastNameZh = '';
        let firstNameZh = '';
        if (travelerApiDto.name && typeof travelerApiDto.name === 'string') {
            lastNameZh = travelerApiDto.name.substring(0, 1);
            firstNameZh = travelerApiDto.name.substring(1);
        }
        let docTypeString = mapBackendDocTypeToFrontend(travelerApiDto.documentType);
        const textLabelForDisplay = `${travelerName} (${genderText}, ${travelerNationality})`;
        const htmlLabelForDropdown = `<span>${travelerName} (${genderText}, ${travelerNationality})</span>`;
        return {
          id: `ft-api-${travelerApiDto.favoriteTravelerId}`,
          dbId: travelerApiDto.favoriteTravelerId,
          textLabel: textLabelForDisplay,
          htmlLabel: htmlLabelForDropdown,
          data: {
            lastNameZh: lastNameZh,
            firstNameZh: firstNameZh,
            gender: travelerApiDto.gender === 0 ? 'male' : (travelerApiDto.gender === 1 ? 'female' : 'other'),
            country: travelerApiDto.nationality || 'TW',
            birthDate: travelerApiDto.birthDate ? new Date(travelerApiDto.birthDate).toISOString().split('T')[0] : null,
            documentType: docTypeString,
            idNumber: docTypeString === 'ID_CARD_TW' ? (travelerApiDto.idNumber || travelerApiDto.documentNumber || '') : '',
            documentNumber: docTypeString !== 'ID_CARD_TW' ? (travelerApiDto.documentNumber || travelerApiDto.idNumber || '') : '',
            lastNameEn: travelerApiDto.passportSurname || '',
            firstNameEn: travelerApiDto.passportGivenName || '',
            passportNumber: (docTypeString === 'PASSPORT' && isInternationalTravel.value) ? (travelerApiDto.documentNumber || travelerApiDto.idNumber || '') : '',
            passportExpiryDate: travelerApiDto.passportExpireDate ? new Date(travelerApiDto.passportExpireDate).toISOString().split('T')[0] : null,
            remarks: travelerApiDto.note || '',
            favoriteTravelerId: travelerApiDto.favoriteTravelerId
          }
        };
      });

      // 2. 獲取並轉換當前登入會員的資料
      try {
        const memberDetails = await getMemberDetailsForOrder(memberId);
        const memberDataForTraveler = mapMemberDetailsToTravelerData(memberDetails, isInternationalTravel.value); // 【使用輔助函數】

        if (memberDataForTraveler) {
          const memberAsTravelerOption = {
            id: 'MEMBER_SELF_OPTION',
            dbId: 'MEMBER_SELF',
            textLabel: `${memberDataForTraveler.lastNameZh}${memberDataForTraveler.firstNameZh} (本人資料)`,
            htmlLabel: `<span>${memberDataForTraveler.lastNameZh}${memberDataForTraveler.firstNameZh} (<strong>本人資料</strong>)</span>`,
            data: memberDataForTraveler
          };
          frequentTravelers.value = [memberAsTravelerOption, ...mappedFrequentTravelers];
        } else {
          frequentTravelers.value = mappedFrequentTravelers;
        }
      } catch (memberError) {
        console.error('ItemParticipantForm: 獲取會員本人資料作為常用旅客失敗:', memberError.message);
        frequentTravelers.value = mappedFrequentTravelers;
      }

    } catch (error) { // catch for getFavoriteTravelersAPI
      console.error('ItemParticipantForm: 載入常用旅客名單失敗:', error.message);
      frequentTravelers.value = []; // 清空，因為常用旅客API失敗

      // 即使常用旅客API失敗，仍嘗試加載本人資料
      if (memberId) {
        try {
          const memberDetails = await getMemberDetailsForOrder(memberId);
          const memberDataForTraveler = mapMemberDetailsToTravelerData(memberDetails, isInternationalTravel.value); // 【使用輔助函數】
          
          if (memberDataForTraveler) {
            frequentTravelers.value.unshift({ // 加到 (可能為空的) 列表頂部
              id: 'MEMBER_SELF_OPTION',
              dbId: 'MEMBER_SELF',
              textLabel: `${memberDataForTraveler.lastNameZh}${memberDataForTraveler.firstNameZh} (本人資料)`,
              htmlLabel: `<span>${memberDataForTraveler.lastNameZh}${memberDataForTraveler.firstNameZh} (<strong>本人資料</strong>)</span>`,
              data: memberDataForTraveler
            });
          }
        } catch (selfError) {
          console.error('ItemParticipantForm: 備選方案中獲取本人資料失敗:', selfError.message);
        }
      }
    } finally {
      isLoadingFrequentTravelers.value = false;
    }
  } else {
    console.warn('ItemParticipantForm: memberId 不存在，無法載入常用旅客名單及本人資料。');
  }
  
  await nextTick();
  validateFormStatus();
});

// --- 監聽器 ---
watch(participantsData, (newData) => {
    formModelForValidation.passengers = newData;
    if (itemFormRef.value && numberOfParticipants.value > 0) {
        validateFormStatus();
    }
}, { deep: true });

const calculateAge = (birthDateStr, referenceDateStr) => {
    if (!birthDateStr || !referenceDateStr) return null;
    try {
        const birthParts = birthDateStr.split('-');
        const refParts = referenceDateStr.split('-');
        if (birthParts.length !== 3 || refParts.length !== 3) {
            console.warn(`[calculateAge] 日期格式無效: BirthDate=${birthDateStr}, ReferenceDate=${referenceDateStr}`);
            return null;
        }
        const birthYear = parseInt(birthParts[0]);
        const birthMonth = parseInt(birthParts[1]) - 1;
        const birthDay = parseInt(birthParts[2]);
        const refYear = parseInt(refParts[0]);
        const refMonth = parseInt(refParts[1]) - 1;
        const refDay = parseInt(refParts[2]);
        const birth = new Date(birthYear, birthMonth, birthDay);
        const reference = new Date(refYear, refMonth, refDay);

        if (isNaN(birth.getTime()) || isNaN(reference.getTime()) ||
            birth.getFullYear() !== birthYear || birth.getMonth() !== birthMonth || birth.getDate() !== birthDay ||
            reference.getFullYear() !== refYear || reference.getMonth() !== refMonth || reference.getDate() !== refDay) {
            console.warn(`[calculateAge] 無效的日期值: BirthDate=${birthDateStr}, ReferenceDate=${referenceDateStr}`);
            return null;
        }

        let age = reference.getFullYear() - birth.getFullYear();
        const monthDiff = reference.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
            age--;
        }
        return Math.max(0, age);
    } catch (e) {
        console.error(`[calculateAge] 計算年齡時出錯: BirthDate=${birthDateStr}, ReferenceDate=${referenceDateStr}`, e);
        return null;
    }
};

const validateAgeBasedOnType = (rule, value, callback) => {
    const pIndex = parseInt(rule.field.split('[')[1].split(']')[0]);
    const birthDateStr = value; 
    const participantType = getParticipantType(pIndex); 
    const tripStartDate = props.orderItem.startDate; 
    if (!birthDateStr || !tripStartDate) {
        return callback();
    }
    const age = calculateAge(birthDateStr, tripStartDate);
    if (age === null) {
        return callback(new Error('出生日期格式無效，無法計算年齡'));
    }
    let isValidAge = false;
    let errorMessage = '年齡與旅客類型不符，請修改旅客資料或確認行程日期。';
    if (participantType === '嬰兒') {
        isValidAge = age >= 0 && age < 2; 
        errorMessage = `購買嬰兒票價的旅客，以行程出發日計算，年齡需介於 0 至 2 歲 (不含2歲)。目前計算年齡為 ${age} 歲。`;
    } else if (participantType === '兒童') {
        isValidAge = age >= 2 && age <= 12; 
        errorMessage = `購買兒童票價的旅客，以行程出發日計算，年齡需介於 2 至 12 歲 (含)。目前計算年齡為 ${age} 歲。`;
    } else if (participantType === '成人') {
        isValidAge = age > 12; 
        errorMessage = `購買成人票價的旅客，以行程出發日計算，年齡需大於 12 歲。目前計算年齡為 ${age} 歲。`;
    } else { 
        isValidAge = true;
    }

    if (isValidAge) {
        callback(); 
    } else {
        callback(new Error(errorMessage)); 
    }
};

const validatePassportExpiryDate = (rule, value, callback) => {
    const pIndex = parseInt(rule.field.split('[')[1].split(']')[0]);
    const participant = participantsData.value[pIndex];

    if (isInternationalTravel.value && participant && participant.documentType === 'PASSPORT' && !value) {
        return callback(new Error(getLabelForField('passportExpiryDate') + '為必填 (護照適用)'));
    }
    if (!value) { 
        return callback();
    }
    try {
        const expiryParts = value.split('-');
        if (expiryParts.length !== 3) {
            return callback(new Error('護照效期日期格式應為YYYY-MM-DD')); 
        }
        const expiryYear = parseInt(expiryParts[0]);
        const expiryMonth = parseInt(expiryParts[1]) -1;
        const expiryDay = parseInt(expiryParts[2]);
        const expiryDate = new Date(expiryYear, expiryMonth, expiryDay);
        
        if (expiryDate.getFullYear() !== expiryYear || expiryDate.getMonth() !== expiryMonth || expiryDate.getDate() !== expiryDay) {
            return callback(new Error('無效的護照效期日期'));
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const tripEndDateStr = props.orderItem.endDate; 
        if (tripEndDateStr) {
            const endParts = tripEndDateStr.split('-');
            if (endParts.length !== 3) {
                console.warn(`[validatePassportExpiryDate] 行程結束日期格式無效: ${tripEndDateStr}`);
                if (expiryDate < today) { 
                    return callback(new Error('護照效期到期日不能早於今天'));
                }
                return callback();
            }
            const endYear = parseInt(endParts[0]);
            const endMonth = parseInt(endParts[1]) - 1;
            const endDay = parseInt(endParts[2]);
            const tripEndDate = new Date(endYear, endMonth, endDay);

            if (tripEndDate.getFullYear() !== endYear || tripEndDate.getMonth() !== endMonth || tripEndDate.getDate() !== endDay) {
                console.warn(`[validatePassportExpiryDate] 無效的行程結束日期值: ${tripEndDateStr}`);
                if (expiryDate < today) { 
                    return callback(new Error('護照效期到期日不能早於今天'));
                }
                return callback();
            }
            const requiredExpiryDate = new Date(tripEndDate);
            const monthsToAdd = 6; 
            requiredExpiryDate.setMonth(requiredExpiryDate.getMonth() + monthsToAdd);

            if (expiryDate < requiredExpiryDate) {
                return callback(new Error(`護照效期至少需在行程結束 (${tripEndDate.toLocaleDateString('zh-TW')}) 後 ${monthsToAdd} 個月 (即 ${requiredExpiryDate.toLocaleDateString('zh-TW')} 或之後)`));
            }
        } else if (expiryDate < today) { 
            return callback(new Error('護照效期到期日不能早於今天'));
        }
        callback();
    } catch (e) {
        console.error("[validatePassportExpiryDate] 驗證護照效期出錯:", e);
        callback(new Error('解析護照效期日期時發生無法預期的錯誤')); 
    }
};

const validateDocumentValue = (rule, value, callback, targetField) => {
    const pIndex = parseInt(rule.field.split('[')[1].split(']')[0]);
    const participant = participantsData.value[pIndex];

    if (!participant) {
        return callback(new Error('系統錯誤：無法獲取旅客資料'));
    }
    
    const documentType = participant.documentType;
    const docValue = value; 

    if (!docValue) { 
        return callback(); // 必填性由 required:true 控制
    }

    let isValid = false;
    let specificErrorMessage = ''; 
    const docTypeInfo = documentTypes.value.find(dt => dt.value === documentType);
    const currentDynamicLabel = docTypeInfo ? docTypeInfo.label : '證件號碼';

    // 根據 targetField 和 documentType 進行驗證
    if (targetField === 'idNumber' && documentType === 'ID_CARD_TW') {
        isValid = /^[A-Z][12]\d{8}$/.test(docValue);
        specificErrorMessage = '須為英文字母開頭，第二位為1或2，後接8位數字 (例: A123456789)。';
    } else if (targetField === 'documentNumber') {
        switch (documentType) {
            case 'PASSPORT':
                const basicPassportPattern = /^[a-zA-Z0-9]{6,20}$/;
                isValid = basicPassportPattern.test(docValue);
                specificErrorMessage = '須為6至20個英文字母或數字。';
                break;
            case 'ARC':
                // 舊式: [A-Z][89]\d{8}  新式: [A-Z][A-D]\d{8} (自2021年起)
                const oldArcPattern = /^[A-Z][89]\d{8}$/;
                const newArcPattern = /^[A-Z][A-D]\d{8}$/;
                isValid = oldArcPattern.test(docValue) || newArcPattern.test(docValue);
                specificErrorMessage = '居留證號碼格式有誤。請確認新式 (1碼英文+A/B/C/D+8碼數字) 或舊式 (1碼英文+8/9+8碼數字) 格式。';
                break;
            case 'ENTRY_PERMIT':
                isValid = docValue.length > 0 && /^[a-zA-Z0-9]+$/.test(docValue); 
                specificErrorMessage = '請輸入有效的入台證號碼。';
                break;
            default: // 若 documentType 不是以上類型，但仍在驗證 documentNumber (例如類型剛切換)
                if (!documentType) {
                    specificErrorMessage = '請先選擇證件類型。';
                    isValid = false;
                } else {
                    // 對於其他未明確定義格式的 documentType，如果走到這裡，可能表示一個不預期的狀態
                    // 或者也可以將其視為通過，如果這些類型不需要 documentNumber 欄位
                    console.warn(`[validateDocumentValue] 對於證件類型 ${documentType}，正在驗證 documentNumber，但無特定規則。`);
                    isValid = true; // 暫時放寬
                    specificErrorMessage = '此類型無特定號碼格式驗證。';
                }
                break;
        }
    } else {
        // 如果 targetField 和 documentType 不匹配 (例如驗證 idNumber 但類型不是 ID_CARD_TW)，
        // 這通常意味著該欄位不應有值或不應被驗證此格式，視為通過此特定格式驗證。
        // 必填與否由 getRulesForField 中 required 屬性控制。
        isValid = true; 
    }
    
    if (isValid) {
        callback();
    } else {
        callback(new Error(`${currentDynamicLabel}格式不正確。${specificErrorMessage}`));
    }
};


const getRulesForField = (pIndex, fieldName) => {
    const baseRules = [];
    const participant = participantsData.value[pIndex] || {}; 

    if (['lastNameZh', 'firstNameZh', 'gender', 'country', 'documentType'].includes(fieldName)) {
        baseRules.push({ required: true, message: `請選擇或輸入${getLabelForField(fieldName)}`, trigger: ['blur', 'change'] });
    }
    
    if (fieldName === 'birthDate') {
        baseRules.push(
            { required: true, message: '請選擇出生年月日', trigger: 'change' },
            { validator: validateAgeBasedOnType, trigger: ['change', 'blur'] }
        );
    }

    if (fieldName === 'idNumber') {
        // idNumber 欄位僅在證件類型為台灣身分證時為必填和進行格式驗證
        if (participant.documentType === 'ID_CARD_TW') {
            baseRules.push(
                { required: true, message: `請輸入${getDynamicDocumentLabel(pIndex)}`, trigger: 'blur' }, 
                { validator: (rule, value, cb) => validateDocumentValue(rule, value, cb, 'idNumber'), trigger: ['blur', 'change'] },
                { validator: validateUniqueDocumentNumber, trigger: 'blur' }
            );
        } else {
            baseRules.push({ required: false }); // 其他證件類型時，idNumber 非必填
        }
    }

    if (fieldName === 'documentNumber') {
        // documentNumber 欄位在證件類型不是台灣身分證時為必填和格式驗證
        if (participant.documentType && participant.documentType !== 'ID_CARD_TW') {
            baseRules.push(
                { required: true, message: `請輸入${getDynamicDocumentLabel(pIndex)}`, trigger: 'blur' },
                { validator: (rule, value, cb) => validateDocumentValue(rule, value, cb, 'documentNumber'), trigger: ['blur', 'change'] },
                { validator: validateUniqueDocumentNumber, trigger: 'blur' }
            );
        } else {
            baseRules.push({ required: false }); // 證件類型為台灣身分證時，documentNumber 非必填
        }
    }
    
    if (isInternationalTravel.value) {
        if (['lastNameEn', 'firstNameEn'].includes(fieldName)) {
            baseRules.push({
                required: participant.documentType === 'PASSPORT', 
                message: `請輸入${getLabelForField(fieldName)} (${getLabelForField('passportNumber')}適用)`,
                validator: (rule, value, callback) => {
                    if (!rule.required && !value) return callback();
                    if (rule.required && !value) return callback(new Error(rule.message));
                    if (value && !/^[a-zA-Z\s-']*$/.test(value)) {
                        return callback(new Error('姓名只能包含英文字母、空格、連字符號或撇號'));
                    }
                    callback();
                },
                trigger: 'blur'
            });
        }
        if (fieldName === 'passportNumber') {
            baseRules.push({
                required: false, 
                validator: (rule, value, callback) => {
                    if (participant.documentType === 'PASSPORT') { 
                        if (!value) return callback(new Error('護照號碼為必填 (與上方同步)')); 
                        if (!/^[a-zA-Z0-9]{6,20}$/.test(value)) {
                            return callback(new Error('護照號碼格式不正確 (6-20個英數字元，與上方同步)'));
                        }
                        callback();
                    } else { 
                        if (!value) return callback(); 
                        if (!/^[a-zA-Z0-9]{6,20}$/.test(value)) {
                            return callback(new Error('護照號碼格式不正確 (6-20個英文字母或數字)'));
                        }
                        callback();
                    }
                },
                trigger: 'blur'
            });
        }
        if (fieldName === 'passportExpiryDate') {
            baseRules.push(
                { required: participant.documentType === 'PASSPORT', message: `請選擇${getLabelForField(fieldName)} (${getLabelForField('passportNumber')}適用)`, trigger: 'change' },
                { validator: validatePassportExpiryDate, trigger: ['change', 'blur'] }
            );
        }
    } else { 
        if (['lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate'].includes(fieldName)) {
            baseRules.push({ required: false });
        }
    }

    if (fieldName === 'remarks') {
        baseRules.push({ max: 200, message: '備註內容不得超過 200 字', trigger: 'blur' });
    }
    return baseRules;
};

const getLabelForField = (fieldName) => {
    const labels = {
        lastNameZh: '中文姓', firstNameZh: '中文名', gender: '性別',
        country: '國籍', birthDate: '出生年月日', 
        documentType: '證件類型', 
        idNumber: '身分證字號', 
        documentNumber: '證件號碼', // 新增 documentNumber 的標籤
        lastNameEn: '英文姓', 
        firstNameEn: '英文名', 
        passportNumber: '護照號碼', 
        passportExpiryDate: '護照效期到期日',
        remarks: '特殊需求備註'
    };
    return labels[fieldName] || fieldName;
};

const numberOfParticipants = computed(() => {
  if (!props.orderItem) {
    return 0;
  }

  // 檢查是否為客製化旅遊
  if (props.orderItem.productType === 'CustomTravel') {
    // 客製化旅遊的邏輯
    // 嘗試從 productSpecificData.people 獲取人數
    const people = props.orderItem.productSpecificData?.people !== undefined
                    ? Number(props.orderItem.productSpecificData.people)
                    : NaN; // 如果 people 屬性不存在，視為 NaN

    // 僅當 people 是有效正數時才使用它
    if (!isNaN(people) && people > 0) {
        return people; // 返回有效的 people 數量
    } else {
      // 對於客製化行程，如果 people 無效， fallback 到 options 的 quantity (通常是1)
      // 因為客製化行程本身是一個 "專案" 被購買
      if (props.orderItem.options && props.orderItem.options.length > 0) {
        return props.orderItem.options.reduce((sum, option) => sum + (Number(option.quantity) || 0), 0); // 應為 1
      }
      return 0; // 如果連 options 都沒有（理論上客製化行程會有），則為 0
    }
  } else {
    // 非客製化旅遊的邏輯 (原邏輯)
    let quantity = 0;
    if (props.orderItem.options && props.orderItem.options.length > 0) {
      quantity = props.orderItem.options.reduce((sum, option) => sum + (Number(option.quantity) || 0), 0);
    } else if (props.orderItem.quantity !== undefined) {
      quantity = Number(props.orderItem.quantity) || 0;
    }
    return quantity;
}
});

watch([() => props.participants, numberOfParticipants], ([newParticipantsProp, newCount]) => {
    const newArray = [];
    for (let i = 0; i < newCount; i++) {
        const propData = newParticipantsProp[i] || {};
        
        let initialIdNumber = propData.idNumber || '';
        let initialDocumentNumber = propData.documentNumber || '';
        let initialPassportNumber = propData.passportNumber || '';
        const currentDocumentType = propData.documentType || 'ID_CARD_TW';

        // 根據證件類型，確保 idNumber 和 documentNumber 的初始值正確性
        if (currentDocumentType === 'ID_CARD_TW') {
            // initialIdNumber 應該有值 (如果 propData 有)，documentNumber 應為空
            initialDocumentNumber = ''; 
        } else {
            // initialDocumentNumber 應該有值 (如果 propData 有)，idNumber 應為空
            initialIdNumber = '';
        }
        
        if (currentDocumentType === 'PASSPORT' && isInternationalTravel.value) {
            initialPassportNumber = initialDocumentNumber; // 同步護照號碼
        }
        
        newArray.push({
            id: propData.id || `pax-${props.orderItem.id}-${i}-${Date.now()}`,
            selectedFrequentTraveler: propData.selectedFrequentTraveler || null,
            favoriteTravelerId: propData.favoriteTravelerId || null, // 【新增/確認】確保 favoriteTravelerId 被初始化
            updateThisTravelerProfile: propData.updateThisTravelerProfile || false, // 【新增】初始化 updateThisTravelerProfile
            lastNameZh: propData.lastNameZh || '',
            firstNameZh: propData.firstNameZh || '',
            gender: propData.gender || null,
            country: propData.country || 'TW',
            birthDate: propData.birthDate || null,
            documentType: currentDocumentType, 
            idNumber: initialIdNumber,    
            documentNumber: initialDocumentNumber, // 新增 documentNumber
            lastNameEn: propData.lastNameEn || '',
            firstNameEn: propData.firstNameEn || '',
            passportNumber: initialPassportNumber, 
            passportExpiryDate: propData.passportExpiryDate || null, 
            remarks: propData.remarks || '',
            ...propData 
        });
    }
    participantsData.value = newArray;
}, { immediate: true, deep: true });


const participantTypes = computed(() => {
  const types = [];
  const currentNumParticipants = numberOfParticipants.value; // 使用已計算好的 participant 數量

  if (!props.orderItem) {
    return types;
  }

  if (props.orderItem.productType === 'CustomTravel') {
    // 對於客製化旅遊，所有旅客表單都應標記為該客製化專案的類型
    const customType = (props.orderItem.options && props.orderItem.options.length > 0 && props.orderItem.options[0].type)
                        ? props.orderItem.options[0].type // 例如 "客製化專案"
                        : '旅客'; // 若 options[0].type 意外不存在，則使用通用備用類型

    for (let i = 0; i < currentNumParticipants; i++) {
      types.push(customType);
    }
  } else {
    // 非客製化旅遊的原有邏輯
    if (props.orderItem.options && props.orderItem.options.length > 0) {
      props.orderItem.options.forEach(option => {
        // 這裡的循環次數是 option.quantity，它代表了該 option 類型（成人/兒童/嬰兒）的數量
        for (let i = 0; i < (Number(option.quantity) || 0); i++) {
          if (types.length < currentNumParticipants) { // 避免超出總旅客數
             types.push(option.type);
          }
        }
      });
    } else if (props.orderItem.quantity !== undefined) { // 對於沒有 options 但有總 quantity 的商品
      for (let i = 0; i < (Number(props.orderItem.quantity) || 0); i++) {
         if (types.length < currentNumParticipants) {
            types.push('成人'); // 預設為成人，或根據商品其他屬性決定
         }
      }
    }
  }

  while (types.length < currentNumParticipants) {
    // 對於已經處理過的 CustomTravel，這裡的邏輯不應該再執行
    // 主要是為了處理非客製化行程下，如果 options 的總 quantity 與 numberOfParticipants 計算結果不一致時的補充
    types.push(null); // 或者一個更合適的預設類型，例如 '旅客'
  }

  // 如果 types 陣列長度超過 currentNumParticipants (理論上，如果 currentNumParticipants 計算正確，不應發生)，則截斷
  if (types.length > currentNumParticipants) {
    types.splice(currentNumParticipants);
  }
  return types;
});

const getParticipantType = (index) => {
    return (index >= 0 && index < participantTypes.value.length) ? participantTypes.value[index] : null; 
};

const updateParticipantField = (index, field, value) => {
    let processedValue = value;
    if (typeof value === 'string') {
        if (['idNumber', 'documentNumber', 'passportNumber', 'firstNameZh', 'lastNameZh'].includes(field)) { 
            processedValue = value.replace(/\s/g, '');
        } else if (['firstNameEn', 'lastNameEn'].includes(field)) {
            processedValue = value.trim();
        }
    } else if (value === null && ['birthDate', 'passportExpiryDate'].includes(field)) {
        processedValue = null;
    }

    const updatedParticipant = {
        ...participantsData.value[index],
        // 注意：若 field 是 idNumber 或 documentNumber，這裡只是暫存，後續會根據 documentType 調整
        [field]: processedValue 
    };

    if (field === 'documentType') {
        updatedParticipant.idNumber = ''; 
        updatedParticipant.documentNumber = ''; 
        if (isInternationalTravel.value) {
            updatedParticipant.passportNumber = ''; 
        }
        // documentType 改變後，UI上對應的輸入框 (idNumber 或 documentNumber) 會被清空，
        // 但因 v-if 切換，可能需要手動觸發新顯示輸入框的驗證以清除舊錯誤
        if (itemFormRef.value) {
            nextTick(() => {
                if (processedValue === 'ID_CARD_TW') {
                    itemFormRef.value.validateField(`passengers[${index}].idNumber`, ()=>{});
                } else {
                    itemFormRef.value.validateField(`passengers[${index}].documentNumber`, ()=>{});
                }
            });
        }
    }

    // 如果更新的是UI上的主要證件號碼輸入框 (現在是 idNumber 或 documentNumber)
    if (field === 'idNumber') { 
        if (updatedParticipant.documentType === 'ID_CARD_TW') {
            updatedParticipant.idNumber = processedValue;
            updatedParticipant.documentNumber = ''; // documentNumber 為空
        } else {
            // 理論上 documentType 非 ID_CARD_TW 時，idNumber 輸入框不應觸發更新
            // 但為防禦性編程，若發生，則清空 idNumber
            updatedParticipant.idNumber = '';
        }
    }
    if (field === 'documentNumber') { // 來自其他證件號碼輸入框
        if (updatedParticipant.documentType && updatedParticipant.documentType !== 'ID_CARD_TW') {
            updatedParticipant.documentNumber = processedValue;
            updatedParticipant.idNumber = ''; // 確保 idNumber 為空
            if (updatedParticipant.documentType === 'PASSPORT' && isInternationalTravel.value) {
                updatedParticipant.passportNumber = processedValue; // 同步到專用護照號碼欄位
            }
        } else {
            updatedParticipant.documentNumber = '';
        }
    }
    
    participantsData.value.splice(index, 1, updatedParticipant);
    emit('update:participants', [...participantsData.value]);

    if (itemFormRef.value) {
        nextTick(() => {
            itemFormRef.value.validateField(`passengers[${index}].${field}`, () => {});
            
            // 若是 idNumber 或 documentNumber 改變，且影響了 passportNumber，則也驗證 passportNumber
            if ((field === 'documentNumber' && updatedParticipant.documentType === 'PASSPORT' && isInternationalTravel.value) ||
                (field === 'documentType' && isInternationalTravel.value) // documentType 改變也可能影響 passportNumber
            ) {
                itemFormRef.value.validateField(`passengers[${index}].passportNumber`, () => {});
            }
        });
    }
};

const handleFrequentTravelerSelect = (index, selectedValue) => { // selectedValue 現在可能是 dbId 或 'MEMBER_SELF' 或 null
  const currentParticipantRaw = participantsData.value[index];
  let travelerDataToFill = { 
      lastNameZh: '', firstNameZh: '', gender: null, country: 'TW',
      birthDate: null, 
      documentType: 'ID_CARD_TW', 
      idNumber: '',
      documentNumber: '',
      favoriteTravelerId: null, 
      lastNameEn: '', firstNameEn: '',
      passportNumber: '', passportExpiryDate: null,
      remarks: '',
  };
  let newUpdateProfileState; // 用於決定 "更新旅客資料" checkbox 的初始勾選狀態

  if (selectedValue === 'MEMBER_SELF') {
    // 【情況1：選擇了 "本人資料"】
    const memberOption = frequentTravelers.value.find(ft => ft.dbId === 'MEMBER_SELF');
    if (memberOption && memberOption.data) {
      travelerDataToFill = { ...travelerDataToFill, ...memberOption.data };
    }
    travelerDataToFill.favoriteTravelerId = null; // 本人資料不對應實際常用旅客DB ID
    
    // 【修改】👇 選擇本人資料時，強制 "更新旅客資料" 為 false (因為 checkbox 會被禁用)
    newUpdateProfileState = false; 

  } else if (selectedValue) {
    // 【情況2：選擇了【已存在的常用旅客】 (selectedValue 是數字ID)】
    const selectedTravelerOption = frequentTravelers.value.find(ft => ft.dbId === selectedValue);
    if (selectedTravelerOption && selectedTravelerOption.data) {
      travelerDataToFill = { ...travelerDataToFill, ...selectedTravelerOption.data };
      travelerDataToFill.favoriteTravelerId = selectedTravelerOption.dbId; // 正確設置 favoriteTravelerId
    }
    // 【修改】👇 選擇已保存的常用旅客時，預設勾選 "更新旅客資料"
    newUpdateProfileState = true; 

  } else {
    // 【情況3：選擇了【自行填寫】 (selectedValue is null)】
    travelerDataToFill.favoriteTravelerId = null;
    // 【修改】👇 手動填寫時，預設不勾選 "更新旅客資料" (使用者可自行勾選，因為 checkbox 此時是可用的)
    newUpdateProfileState = false; 
  }

  // --- 後續的證件號碼、護照號碼等校正邏輯 (基於填充好的 travelerDataToFill) ---
  const docType = travelerDataToFill.documentType;
  const isIntTravel = isInternationalTravel.value;

  if (docType === 'ID_CARD_TW') {
      if (!travelerDataToFill.idNumber && travelerDataToFill.documentNumber) { // 優先使用 idNumber
          travelerDataToFill.idNumber = travelerDataToFill.documentNumber;
      }
      travelerDataToFill.documentNumber = ''; // 非身分證的證件號碼欄位清空
  } else { // 非台灣身分證
      if (!travelerDataToFill.documentNumber && travelerDataToFill.idNumber) { // 優先使用 documentNumber
          travelerDataToFill.documentNumber = travelerDataToFill.idNumber;
      }
      travelerDataToFill.idNumber = ''; // 身分證號碼欄位清空
  }
  
  if (docType === 'PASSPORT' && isIntTravel) {
      travelerDataToFill.passportNumber = travelerDataToFill.documentNumber; // 同步護照號碼
  } else if (!isIntTravel) { // 如果不是國際旅行，清空所有護照相關欄位
      travelerDataToFill.passportNumber = '';
      travelerDataToFill.lastNameEn = '';
      travelerDataToFill.firstNameEn = '';
      travelerDataToFill.passportExpiryDate = null;
  } else if (docType !== 'PASSPORT' && isIntTravel) {
      // 如果是國際旅行但證件類型不是護照，也可能需要清空或保留已有的護照資訊
      // 目前行為：如果之前填過 passportNumber 但現在選的常用旅客證件不是護照，會被帶入的空值覆蓋
  }

  const updatedParticipant = {
    id: currentParticipantRaw.id,
    ...travelerDataToFill,
    selectedFrequentTraveler: selectedValue, // v-model 的值綁定到 select
    updateThisTravelerProfile: newUpdateProfileState
  };

  participantsData.value.splice(index, 1, updatedParticipant);
  emit('update:participants', [...participantsData.value]);

  // ... (後續的表單驗證觸發邏輯) ...
  if (itemFormRef.value) {
    const fieldsToValidate = [
        'lastNameZh', 'firstNameZh', 'gender', 'country',
        'birthDate', 'documentType', 'idNumber', 'documentNumber', 'remarks', 
        'lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate',
    ];
    nextTick(() => {
        itemFormRef.value.clearValidate(fieldsToValidate.map(f => `passengers[${index}].${f}`)); 
        fieldsToValidate.forEach(field => {
            const propPath = `passengers[${index}].${field}`;
            if (Object.prototype.hasOwnProperty.call(updatedParticipant, field)) {
                if (field === 'idNumber' && updatedParticipant.documentType !== 'ID_CARD_TW') return;
                if (field === 'documentNumber' && updatedParticipant.documentType === 'ID_CARD_TW') return;
                if (['lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate'].includes(field) && !isInternationalTravel.value) return;
                itemFormRef.value.validateField(propPath, () => {});
            }
        });
    });
  }
};

const sortedCountries = computed(() => {
    const locale = 'zh-TW';
    try {
        const countryNames = countries.getNames(locale, { select: 'official' }); 
        if (!countryNames || Object.keys(countryNames).length === 0) {
            console.warn(`[sortedCountries] i18n-iso-countries: 無法獲取 '${locale}' 的國家名稱。將使用 'en' 作為備選。`);
            const fallbackNames = countries.getNames('en', { select: 'official' });
            return Object.entries(fallbackNames)
                .map(([code, name]) => ({ code, name: `${name} (${code})` }))
                .sort((a, b) => a.name.localeCompare(b.name));
        }
        return Object.entries(countryNames)
            .map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { sensitivity: 'base' }));
    } catch (e) {
        console.error(`[sortedCountries] 獲取國家列表時發生錯誤 (locale: ${locale}):`, e);
        return [{ code: 'TW', name: '台灣 (預設)'}, { code: 'JP', name: '日本'}, { code: 'US', name: '美國'}];
    }
});

const validateFormStatus = async () => {
    await nextTick(); 
    if (numberOfParticipants.value > 0 && itemFormRef.value) {
        itemFormRef.value.validate((valid, _invalidFields) => {
            if (isFormValid.value !== valid) { 
                isFormValid.value = valid;
                emit('validity-changed', valid);
            }
        });
    } else if (numberOfParticipants.value === 0) { 
        if (isFormValid.value !== true) {
            isFormValid.value = true;
            emit('validity-changed', true);
        }
    }
};


watch(() => props.orderItem.startDate, (newDate, oldDate) => {
    if (newDate !== oldDate && numberOfParticipants.value > 0 && itemFormRef.value) {
        nextTick(() => {
            participantsData.value.forEach((_participant, index) => {
                itemFormRef.value.validateField(`passengers[${index}].birthDate`, () => {});
            });
        });
    }
});

watch(() => props.tripDestinationCountry, (newCountry, oldCountry) => {
    if (newCountry !== oldCountry && numberOfParticipants.value > 0) {
        const newIsInternational = newCountry !== 'TW';
        const oldIsInternational = oldCountry !== 'TW';

        if (newIsInternational !== oldIsInternational) { 
            let participantsModified = false;
            const updatedParticipantsArray = participantsData.value.map(participant => {
                let newPassportNumberValue = participant.passportNumber;
                let modifiedThisParticipant = false;

                if (participant.documentType === 'PASSPORT') {
                    if (newIsInternational) {
                        // 從 documentNumber (應為護照號) 同步
                        if (participant.passportNumber !== participant.documentNumber) {
                            newPassportNumberValue = participant.documentNumber;
                            modifiedThisParticipant = true;
                        }
                    } else { 
                        if (participant.passportNumber !== '') { 
                            newPassportNumberValue = '';
                            modifiedThisParticipant = true;
                        }
                    }
                }
                // 【新增】如果從非國際變國際，且證件不是護照，但之前有填護照號，則保留
                // 【新增】如果從國際變非國際，則清空護照相關欄位
                let newLastNameEn = participant.lastNameEn;
                let newFirstNameEn = participant.firstNameEn;
                let newPassportExpiryDate = participant.passportExpiryDate;

                if (!newIsInternational) {
                    if (newLastNameEn !== '') { newLastNameEn = ''; modifiedThisParticipant = true;}
                    if (newFirstNameEn !== '') { newFirstNameEn = ''; modifiedThisParticipant = true;}
                    if (newPassportExpiryDate !== null) { newPassportExpiryDate = null; modifiedThisParticipant = true;}
                     // passportNumber 的清空已在上面 documentType === 'PASSPORT' 的 else 處理
                }

                if (modifiedThisParticipant) {
                    participantsModified = true;
                    return { ...participant, passportNumber: newPassportNumberValue, 
                        lastNameEn: newLastNameEn, firstNameEn: newFirstNameEn, 
                        passportExpiryDate: newPassportExpiryDate };
                }
                return participant;
            });
            
            if (participantsModified) {
                participantsData.value = updatedParticipantsArray;
                emit('update:participants', [...participantsData.value]); 
            }
        }

        if (itemFormRef.value) {
            nextTick(() => {
                participantsData.value.forEach((_participant, index) => {
                    const fieldsToRevalidate = ['lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate'];
                    fieldsToRevalidate.forEach(field => {
                        if (formModelForValidation.passengers[index] && Object.prototype.hasOwnProperty.call(formModelForValidation.passengers[index], field)) {
                            itemFormRef.value.validateField(`passengers[${index}].${field}`, () => {});
                        }
                    });
                });
            });
        }
    }
});

const validateAll = async () => {
    if (numberOfParticipants.value === 0) {
        if (isFormValid.value !== true) { 
            isFormValid.value = true;
            emit('validity-changed', true);
        }
        return true;
    }
    if (itemFormRef.value) { 
        try {
            await itemFormRef.value.validate(); 
            if (isFormValid.value !== true) {
                isFormValid.value = true;
                emit('validity-changed', true);
            }
            return true;
        } catch (_invalidFields) { 
            if (isFormValid.value !== false) {
                isFormValid.value = false;
                emit('validity-changed', false);
            }
            return false;
        }
    } else { 
        if (isFormValid.value !== false) { 
            isFormValid.value = false;
            emit('validity-changed', false);
        }
        console.error("[validateAll] ItemParticipantForm: 表單實例 (itemFormRef) 不存在。");
        return false;
    }
};

defineExpose({
    validateAll, 
    orderItem: props.orderItem 
});

</script>

<style scoped>

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
    font-size: 1.1em; 
    margin-top: 0; 
    margin-bottom: 18px; 
    color: var(--el-text-color-primary, #303133); 
    border-left: 3px solid var(--el-color-primary, #409eff); 
    padding-left: 10px; 
    font-weight: var(--el-font-weight-bold, bold); 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
}
.participant-type {
    font-weight: var(--el-font-weight-primary, 500); 
    color: var(--el-text-color-secondary, #909399); 
    font-size: 0.9em; 
    margin-left: 10px; 
    flex-shrink: 0; 
}
.participant-divider {
  margin-top: 25px; 
  border-top: 1px dashed var(--el-border-color-light, #e4e7ed); 
}
.remarks-form-item .el-form-item__content {
    position: relative; 
}
.el-form-item__extra-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary, #909399); 
    line-height: 1.5;
    margin-top: 4px; 
}
@media (max-width: 768px) {
    .participant-entry .el-row > .el-col {
        flex-basis: 100% !important; 
        max-width: 100% !important;
        margin-bottom: 0; 
    }
     .participant-entry .el-row > .el-col .el-form-item {
        margin-bottom: 18px;
    }
    .participant-entry .el-row > .el-col:last-child .el-form-item {
        margin-bottom: 0; 
    }
     .participant-entry .el-row:last-of-type > .el-col:last-child .el-form-item {
         margin-bottom: 0; 
     }
}
</style>