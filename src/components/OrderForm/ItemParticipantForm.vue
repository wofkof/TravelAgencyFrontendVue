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
                maxlength="300" show-word-limit
            />
        </el-form-item>

        <el-divider v-if="pIndex < numberOfParticipants - 1" class="participant-divider" />
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch, reactive, nextTick, onMounted } from 'vue'; // 引入所有必要的 Composition API
import countries from 'i18n-iso-countries'; // 引入國際化庫

// 定義組件接收的 props
const props = defineProps({
  orderItem: { // 購物車商品項目數據
    type: Object,
    required: true
  },
  participants: { // v-model 綁定的旅客資料陣列
    type: Array,
    required: true,
    default: () => []
  },
  tripDestinationCountry: { // 行程目的地國家代碼 (例如 'TW', 'JP')
    type: String,
    required: true
  }
});

// 定義組件發出的事件
// update:participants 用於 v-model 雙向綁定旅客資料
// validity-changed 用於通知父組件此 ItemParticipantForm 的整體驗證狀態
const emit = defineEmits(['update:participants', 'validity-changed']);


// 本地響應式副本，用於表單操作，與 props.participants 同步
const participantsData = ref([]);
// el-form 的實例引用
const itemFormRef = ref(null);
// ItemParticipantForm 的整體驗證狀態
const isFormValid = ref(false);


// 判斷是否為國際旅遊 (目的地國家非台灣)
const isInternationalTravel = computed(() => props.tripDestinationCountry !== 'TW');

// 常用旅客列表 (範例，應從 Store 或 API 獲取)
// 為了測試年齡驗證，這裡新增一些不同年齡的範例旅客
const frequentTravelers = ref([
  // 應包含與旅客資料結構相似的欄位
  { id: 'ft1', label: '本人 (王小明 - 成人)', data: { lastNameZh: '王', firstNameZh: '小明', gender: 'male', country: 'TW', birthDate: '1990-01-01', idNumber: 'A123456789' } }, // 成人
  { id: 'ft2', label: '常用旅客 (陳大文 - 成人)', data: { lastNameZh: '陳', firstNameZh: '大文', gender: 'male', country: 'US', birthDate: '1985-05-05', lastNameEn: 'CHEN', firstNameEn: 'DA-WEN', passportExpiryDate: '2030-12-31' } }, // 成人
  { id: 'ft3', label: '常用旅客 (林小妹妹 - 兒童)', data: { lastNameZh: '林', firstNameZh: '小妹妹', gender: 'female', country: 'TW', birthDate: '2015-07-10', idNumber: 'F234567890' } }, // 兒童 (假設行程日是今天或之後)
  { id: 'ft4', label: '常用旅客 (張寶寶 - 嬰兒)', data: { lastNameZh: '張', firstNameZh: '寶寶', gender: 'male', country: 'TW', birthDate: '2024-03-20', idNumber: 'G123456789' } } // 嬰兒 (假設行程日是今天或之後)
]);

// 為了讓 el-form 的 :model 和 :prop 配合工作，我們需要一個包裹 participantsData 的物件
// 這樣 prop 的路徑就是 'passengers[index].fieldName'
const formModelForValidation = reactive({
  passengers: [] // 這個陣列將與 participantsData 同步
});

// 監聽 participantsData 的變化，並更新 formModelForValidation.passengers
watch(participantsData, (newData) => {
  formModelForValidation.passengers = newData;
  // 在 participantsData 變化後，觸發整個表單的驗證以更新狀態
  validateFormStatus();
}, { deep: true }); // deep: true 監聽陣列內部物件的變化


// --- 計算年齡的輔助函式 (使用行程開始日期) ---
const calculateAge = (birthDateStr, referenceDateStr) => {
    if (!birthDateStr || !referenceDateStr) return null;

    try {
        const birthParts = birthDateStr.split('-');
        const refParts = referenceDateStr.split('/'); // 行程開始日期是YYYY/MM/DD 格式

        if (birthParts.length !== 3 || refParts.length !== 3) {
             console.warn(`日期格式無效: BirthDate=${birthDateStr}, ReferenceDate=${referenceDateStr}`);
             return null; // 格式無效
        }

        const birth = new Date(parseInt(birthParts[0]), parseInt(birthParts[1]) - 1, parseInt(birthParts[2]));
        const reference = new Date(parseInt(refParts[0]), parseInt(refParts[1]) - 1, parseInt(refParts[2]));

        if (isNaN(birth.getTime()) || isNaN(reference.getTime())) {
             console.warn(`無效的日期值: BirthDate=${birthDateStr}, ReferenceDate=${referenceDateStr}`);
             return null; // 無效的日期值
        }


        let age = reference.getFullYear() - birth.getFullYear();
        const monthDiff = reference.getMonth() - birth.getMonth();

        // 如果參考日期的月份小於出生月份，或者月份相同但日期小於出生日期，則年齡減一
        if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
            age--;
        }
        // 確保年齡不會是負數 (理論上不會，除非日期輸入錯誤)
        return Math.max(0, age);
    } catch (e) {
        console.error(`計算年齡時出錯: BirthDate=${birthDateStr}, ReferenceDate=${referenceDateStr}`, e);
        return null; // 計算出錯
    }
};

// --- 驗證出生年月日是否符合旅客類型的自訂函式 ---
const validateAgeBasedOnType = (rule, value, callback) => {
    const pIndex = parseInt(rule.field.split('[')[1].split(']')[0]); // 從 rule.field 中提取索引
    const birthDateStr = value; // 出生年月日的值 (YYYY-MM-DD)
    const participantType = getParticipantType(pIndex); // 取得旅客類型 (成人/兒童/嬰兒等)
    const tripStartDate = props.orderItem.startDate; // 取得行程開始日期 (YYYY/MM/DD)

    if (!birthDateStr || !tripStartDate) {
        // 如果日期為空 (必填檢查會處理)，或行程日期不明，則不做年齡驗證
        return callback();
    }

    const age = calculateAge(birthDateStr, tripStartDate);

    if (age === null) {
          return callback(new Error('日期格式無效，無法計算年齡'));
    }

    let isValidAge = false;
    let errorMessage = '年齡與旅客類型不符，請修改旅客資料。';

    // 根據你提供的年齡範圍進行驗證：嬰兒 < 2, 兒童 >= 2 且 <= 12, 成人 > 12
    if (participantType === '嬰兒') {
          isValidAge = age >= 0 && age < 2; // 0歲到未滿2歲
          errorMessage = `購買嬰兒票價的旅客，年齡需在0至2歲之間。目前年齡為 ${age} 歲。`;
    } else if (participantType === '兒童') {
          isValidAge = age >= 2 && age <= 12; // 2歲到12歲 (含頭尾)
          errorMessage = `購買兒童票價的旅客，年齡需在2至12歲之間。目前年齡為 ${age} 歲。`;
    } else if (participantType === '成人') {
          isValidAge = age > 12; // 滿12歲以上
          errorMessage = `購買成人票價的旅客，年齡需在12歲以上。目前年齡為 ${age} 歲。`; // 滿12歲以上才算成人
    } else {
        // 其他未知類型，不執行年齡驗證
        isValidAge = true;
    }

    if (isValidAge) {
        callback(); // 驗證通過
    } else {
        callback(new Error(errorMessage)); // 驗證失敗
    }
};

// --- 驗證護照效期到期日不早於今天 (且不早於行程結束日期後 N 個月) ---
const validatePassportExpiryDate = (rule, value, callback) => {
    // 如果沒有填寫效期，視為通過 (因為是非必填)
    if (!value) {
        return callback();
    }

    try {
        // 解析填寫的日期 (YYYY-MM-DD 格式)
        const expiryParts = value.split('-');
        if (expiryParts.length !== 3) {
            return callback(new Error('護照效期日期格式不正確')); // 基本格式檢查
        }
        const expiryDate = new Date(parseInt(expiryParts[0]), parseInt(expiryParts[1]) - 1, parseInt(expiryParts[2]));

        // 獲取今天的日期，並將時間設為零，只比較日期部分
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 檢查到期日是否在今天或之後
        // if (expiryDate < today) {
        //     return callback(new Error('護照效期到期日不能早於今天')); // 驗證失敗
        // }

        // TODO: 添加更嚴謹的驗證：護照效期必須在行程結束日期後 N 個月以上
        // 這需要從 props.orderItem 中獲取行程結束日期 (endDate)，並根據目的地國家判斷 N 的值 (通常是 3 或 6 個月)
        // 例如：
        const tripEndDateStr = props.orderItem.endDate; // 假設商品數據中有 endDate
        if (tripEndDateStr) {
            const endParts = tripEndDateStr.split('/');
            const tripEndDate = new Date(parseInt(endParts[0]), parseInt(endParts[1]) - 1, parseInt(endParts[2]));
            // 計算行程結束日期後 N 個月的日期
            const requiredExpiryDate = new Date(tripEndDate);
            const monthsToAdd = (props.tripDestinationCountry === 'SOME_COUNTRY') ? 6 : 3; // 根據國家設定 N
            requiredExpiryDate.setMonth(requiredExpiryDate.getMonth() + monthsToAdd);
            requiredExpiryDate.setDate(requiredExpiryDate.getDate() - 1); // 設置為所需月份的最後一天

            if (expiryDate < requiredExpiryDate) {
                 return callback(new Error(`護照效期需在行程結束後 ${monthsToAdd} 個月以上`));
            }
        }


        callback(); // 所有檢查都通過
    } catch (e) {
        console.error("驗證護照效期出錯:", e);
        callback(new Error('無效的護照效期日期')); // 解析或比較出錯
    }
};

// 動態驗證規則生成
const getRulesForField = (pIndex, fieldName) => {
    const baseRules = [];
    const currentParticipant = participantsData.value[pIndex] || {};

    // 基本必填欄位 (國內外都必填)，使用 blur 和 change 觸發驗證
    if (['lastNameZh', 'firstNameZh', 'gender', 'country'].includes(fieldName)) {
        baseRules.push({ required: true, message: `請輸入或選擇${getLabelForField(fieldName)}`, trigger: ['blur', 'change'] });
    }

    // 出生年月日是必填，並且需要年齡驗證
    if (fieldName === 'birthDate') {
          baseRules.push(
              { required: true, message: '請選擇出生年月日', trigger: 'change' },
              // 添加自訂的年齡驗證器，使用 change 和 blur 觸發
              { validator: validateAgeBasedOnType, trigger: ['change', 'blur'] }
          );
    }

    if (fieldName === 'idNumber') {
        // 身分證字號：當國籍為台灣(TW)時必填且驗證格式
        const required = currentParticipant.country === 'TW';
        if (required) {
            // 必填規則使用 blur 觸發
            baseRules.push({ required: true, message: '請輸入身分證字號 (台灣國籍必填)', trigger: 'blur' });
            // 格式驗證使用 blur 觸發
             baseRules.push({
                 validator: (rule, value, callback) => {
                         if (!value) return callback(); // 如果非必填或已由 required 檢查處理空值
                         // 簡單的台灣身分證格式檢查 (字母+9位數字，第二位是1或2)
                         if (/^[A-Z][12]\d{8}$/.test(value)) {
                             // TODO: 更嚴謹的驗證需要加入檢查碼算法
                             callback();
                         } else {
                             callback(new Error('台灣身分證格式不正確'));
                         }
                     },
                     trigger: 'blur'
             });
        } else {
             // 如果國籍不是台灣，身分證字號為選填，不驗證格式
             baseRules.push({ required: false });
        }
    }

    // 國際旅遊欄位 (這些欄位僅在國際旅遊時顯示，且設為非必填)
    // 模板中的 v-if 已經控制了顯示，這裡的規則只負責驗證 (即使非必填，如果填寫了也需要驗證格式)
    if (isInternationalTravel.value) {
        if (['lastNameEn', 'firstNameEn'].includes(fieldName)) {
             // 英文姓名格式驗證，使用 blur 觸發
             baseRules.push({
                 required: false, // 非必填
                 validator: (rule, value, callback) => {
                    if (!value) return callback();
                    // 簡單驗證：只包含英文字母、空格、連字符或撇號
                    if (/^[a-zA-Z\s-']*$/.test(value)) {
                           callback();
                    } else {
                           callback(new Error('姓名只能包含英文字母、空格、連字符或撇號'));
                    }
                 },
                 trigger: 'blur'
             });
        }

        // 護照號碼格式驗證，使用 blur 觸發
        if (fieldName === 'passportNumber') {
             baseRules.push({
                 required: false, // 非必填
                 validator: (rule, value, callback) => {
                    if (!value) return callback(); // 如果沒填，直接通過
                    // 簡單檢查：至少 6 個字元，只包含字母和數字
                    if (/^[a-zA-Z0-9]{6,}$/.test(value)) {
                         // TODO: 更嚴謹的護照號碼格式驗證 (不同國家格式差異大)
                         callback();
                    } else {
                         callback(new Error('護照號碼格式不正確 (至少6個英數字)')); // 範例錯誤訊息
                    }
                 },
                 trigger: 'blur'
             });
        }

        // 護照效期到期日驗證，使用 change 和 blur 觸發
        if (fieldName === 'passportExpiryDate') {
              baseRules.push(
                  { required: false }, // 設為非必填
                  // 新增自訂驗證器，檢查日期有效性
                  { validator: validatePassportExpiryDate, trigger: ['change', 'blur'] }
              );
        }
    } else {
        // 如果不是國際旅遊，確保護照相關欄位規則為非必填且沒有其他驗證
          if (['lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate'].includes(fieldName)) {
              baseRules.push({ required: false });
          }
    }


    // 特殊需求備註 (選填，最大 300 字)，使用 blur 觸發
    if (fieldName === 'remarks') {
        baseRules.push({ max: 300, message: '備註內容不得超過 300 字', trigger: 'blur' });
    }

    return baseRules;
};

// 輔助函式，用於獲取欄位的中文標籤，用於生成錯誤訊息
const getLabelForField = (fieldName) => {
    const labels = {
        lastNameZh: '中文姓', firstNameZh: '中文名', gender: '性別',
        country: '國籍', birthDate: '出生年月日', idNumber: '身分證字號',
        lastNameEn: '英文姓 (同護照)', firstNameEn: '英文名 (同護照)', passportExpiryDate: '護照效期到期日',
        passportNumber: '護照號碼', remarks: '特殊需求備註'
    };
    return labels[fieldName] || fieldName;
};

// 計算此項目需要的旅客數量
const numberOfParticipants = computed(() => {
  let quantity = 0;
  if (props.orderItem.options && props.orderItem.options.length > 0) {
    quantity = props.orderItem.options.reduce((sum, option) => sum + (Number(option.quantity) || 0), 0);
  } else if (props.orderItem.quantity !== undefined) {
    quantity = Number(props.orderItem.quantity) || 0;
  }
  return quantity;
});

// 監聽 props.participants (來自父層的 v-model) 和 numberOfParticipants 的變化
// 當這些變化發生時，同步本地 participantsData 並觸發表單狀態更新
watch([() => props.participants, numberOfParticipants], ([newParticipantsProp, newCount]) => {
  const newArray = [];
  for (let i = 0; i < newCount; i++) {
    const propData = newParticipantsProp[i] || {};
    newArray.push({
      // 確保每個旅客物件都有一個唯一的 key 或 id
      id: propData.id || `pax-${props.orderItem.id}-${i}-${Date.now()}`,
      selectedFrequentTraveler: propData.selectedFrequentTraveler || null,
      lastNameZh: propData.lastNameZh || '',
      firstNameZh: propData.firstNameZh || '',
      gender: propData.gender || null, // 性別預設為 null
      country: propData.country || 'TW', // 預設國籍
      birthDate: propData.birthDate || null, // 生日預設為 null
      idNumber: propData.idNumber || '',
      lastNameEn: propData.lastNameEn || '',
      firstNameEn: propData.firstNameEn || '',
      passportNumber: propData.passportNumber || '',
      passportExpiryDate: propData.passportExpiryDate || null, // 護照效期預設為 null
      remarks: propData.remarks || '',
      // TODO: 如果需要同步電話和 Email，確保這些欄位也包含在 props.participants 的數據結構中
      phoneNumber: propData.phoneNumber || '',
      email: propData.email || '',
      countryCode: propData.countryCode || '+886', // 預設國碼
      documentType: propData.documentType || 'ID_CARD_TW', // 預設證件類型
      ...propData // 保留其他可能有的欄位
    });
  }
  participantsData.value = newArray;
  // participantsData 更新後，formModelForValidation 會自動更新 (因為 watch 監聽了 participantsData)
  // formModelForValidation 更新後，watch 監聽器會觸發 validateFormStatus
}, { immediate: true, deep: true }); // immediate 在組件掛載時立即執行一次，deep 監聽陣列內部變化


// 計算每個旅客欄位的類型 (例如：成人, 兒童, 嬰兒)
const participantTypes = computed(() => {
  const types = [];
  if (props.orderItem.options && props.orderItem.options.length > 0) {
    props.orderItem.options.forEach(option => {
      for (let i = 0; i < (Number(option.quantity) || 0); i++) {
        types.push(option.type);
      }
    });
  } else if (props.orderItem.quantity !== undefined) {
      for (let i = 0; i < (Number(props.orderItem.quantity) || 0); i++) {
          // 如果商品沒有 options，只有單一數量，假設旅客類型由其他方式決定，或全部視為成人
          types.push('成人'); // 這裡假設為成人，請根據你的實際情況調整
      }
  }
  // 確保類型數量與旅客數量匹配
    while (types.length < numberOfParticipants.value) {
         types.push(null); // 填充 null 或預設類型，避免索引超出範圍
    }
    if (types.length > numberOfParticipants.value) {
         types.splice(numberOfParticipants.value);
    }

  return types;
});

const getParticipantType = (index) => {
  // 確保索引有效
  return participantTypes.value[index] || null; // 如果索引無效或類型不明，返回 null
};

// 更新本地旅客資料並 emit 更新事件
const updateParticipantField = (index, field, value) => {
    // 對字串類型的值進行空白處理
    let processedValue = value;
     if (typeof value === 'string') {
         // 中文姓名、身分證、護照號碼等移除所有空白
         if (['firstNameZh', 'lastNameZh', 'idNumber', 'documentNumber', 'passportNumber'].includes(field)) {
              processedValue = value.replace(/\s/g, '');
         }
         // 英文姓名移除前後空白，保留中間空白
         else if (['firstNameEn', 'lastNameEn'].includes(field)) {
              processedValue = value.trim();
         }
         // remarks 保留空白，日期類由 DatePicker 處理格式
     } else if (value === null && ['birthDate', 'passportExpiryDate'].includes(field)) {
         // 如果日期被清空 (例如點擊 clearable 按鈕)
         processedValue = null;
     }


  // 創建一個新的旅客物件，確保響應性更新
  const updatedParticipant = {
    ...participantsData.value[index],
    [field]: processedValue
  };

  // 使用 splice 替換陣列中的元素，確保 Vue 能夠偵測到變化
  participantsData.value.splice(index, 1, updatedParticipant);

  // Emit 更新事件給父元件 (發送新的陣列副本)
  emit('update:participants', [...participantsData.value]);

  // 更新單個欄位後，觸發該欄位的驗證，並更新整體表單驗證狀態
  if (itemFormRef.value) {
    // 使用 nextTick 確保 DOM 更新後再觸發驗證
    nextTick(() => {
          itemFormRef.value.validateField(`passengers[${index}].${field}`, (errorMessage) => {
               // console.log(`驗證 ${field} 欄位結果: ${errorMessage ? '失敗' : '成功'}`, errorMessage);
               // 在單個欄位驗證完成後，重新評估整體表單的驗證狀態
               validateFormStatus();
          });
    });
  } else {
      // 如果 formRef 不存在，仍然嘗試更新整體表單狀態 (雖然不嚴謹)
      validateFormStatus();
  }
};

// 選擇常用旅客後填充表單
const handleFrequentTravelerSelect = (index, selectedId) => {
    const currentParticipant = { ...participantsData.value[index] }; // 取得當前旅客的資料副本
    let travelerDataToFill = { // 預設清空或部分保留欄位的值
        lastNameZh: '', firstNameZh: '', gender: null, country: 'TW', // 預設台灣
        birthDate: null, idNumber: '', lastNameEn: '', firstNameEn: '',
        passportNumber: '',
        passportExpiryDate: null,
        remarks: '',
        // TODO: 如果常用旅客數據包含電話和 Email，這裡也要清空或填充
        phoneNumber: '',
        email: '',
        countryCode: '+886', // 預設國碼
        documentType: 'ID_CARD_TW', // 預設證件類型
    };

    if (selectedId) {
        const selectedTraveler = frequentTravelers.value.find(ft => ft.id === selectedId);
        if (selectedTraveler && selectedTraveler.data) {
            // 合併選中的常用旅客資料，覆蓋預設清空的值
            travelerDataToFill = { ...travelerDataToFill, ...selectedTraveler.data };
        }
    }
    // 更新旅客資料，並保留選擇的 selectedFrequentTraveler 和原有的 id
    const updatedParticipant = {
        id: currentParticipant.id, // 保留原有的 id
        ...travelerDataToFill, // 填充常用旅客資料或清空值
        selectedFrequentTraveler: selectedId, // 設定選擇的常用旅客 ID
          // 如果有其他需要保留的欄位，也要在這裡合併
    };

    // 使用 splice 替換陣列中的元素
    participantsData.value.splice(index, 1, updatedParticipant);
    // Emit 更新事件給父元件
    emit('update:participants', [...participantsData.value]);

    // 填充後需要手動觸發所有相關欄位的驗證，以顯示新的狀態或錯誤
    if (itemFormRef.value) {
        // 觸發所有可能受影響的欄位驗證
        const fieldsToValidate = [
              'lastNameZh', 'firstNameZh', 'gender', 'country',
              'birthDate', 'idNumber', 'remarks',
              'lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate', // 包含護照欄位
              'phoneNumber', 'email', 'countryCode', 'documentType' // 包含其他可能填充的欄位
        ];

        // 使用 nextTick 確保 DOM 更新和數據設置完成後再觸發驗證
        nextTick(() => {
             // 先清除所有驗證狀態，避免舊的錯誤殘留
              itemFormRef.value.clearValidate();
              console.log("ItemParticipantForm: Cleared validation after frequent traveler select.");

             // 觸發所有相關欄位的驗證
             fieldsToValidate.forEach(field => {
                  // 檢查對應的 prop 路徑是否存在於 formModelForValidation.passengers[index] 中，避免對不存在的 prop 觸發驗證
                  const propPath = `passengers[${index}].${field}`;
                  if (Object.prototype.hasOwnProperty.call(formModelForValidation.passengers[index], field)) {
                       itemFormRef.value.validateField(propPath, () => {});
                  } else {
                       // console.warn(`ItemParticipantForm: Prop path "${propPath}" does not exist in formModelForValidation. Skipping validation for this field.`);
                  }
             });
             // 在所有欄位驗證觸發後，重新評估整體表單的驗證狀態
             validateFormStatus();
        });
    } else {
        // 如果 formRef 不存在，仍然嘗試更新整體表單狀態 (雖然不嚴謹)
        validateFormStatus();
    }
};


// 國家列表 (從 i18n-iso-countries 獲取並排序)
const sortedCountries = computed(() => {
    const locale = 'zh-TW'; // 使用繁體中文 locale
    try {
        // 嘗試獲取指定 locale 的國家名稱
        const countryNames = countries.getNames(locale, { select: 'official' });

        if (!countryNames || Object.keys(countryNames).length === 0) {
             console.warn(`i18n-iso-countries: 無法獲取 '${locale}' 的國家名稱。將使用 'en' 作為備選。`);
             // 如果獲取失敗，提供一個英文備選列表
             const fallbackNames = countries.getNames('en', { select: 'official' });
             return Object.entries(fallbackNames)
               .map(([code, name]) => ({ code, name: `${name} (${code})` })) // 英文名加上國碼
               .sort((a, b) => a.name.localeCompare(b.name)); // 英文排序
        }

        // 將國家名稱轉換為 { code, name } 物件陣列並排序
        return Object.entries(countryNames)
          .map(([code, name]) => ({ code, name }))
          // 使用支援繁體中文排序的 locale 進行排序
          .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant', { sensitivity: 'base' }));
    } catch (e) {
        console.error(`獲取國家列表時發生錯誤 (locale: ${locale}):`, e);
        // 如果發生錯誤，提供一個最小化的備選列表，包含台灣、日本、美國
        return [{ code: 'TW', name: '台灣 (預設)'}, { code: 'JP', name: '日本'}, { code: 'US', name: '美國'}];
    }
});


// --- 新增：評估並發出整體表單驗證狀態 ---
const validateFormStatus = async () => {
    // 使用 nextTick 確保在數據更新和 DOM 渲染完成後再觸發驗證
    await nextTick();
    // 只有當 ItemParticipantForm 應該顯示時 (即有旅客數量 > 0) 才進行驗證狀態評估
    if (numberOfParticipants.value > 0 && itemFormRef.value) {
        itemFormRef.value.validate((valid) => {
            // 更新內部驗證狀態
            isFormValid.value = valid;
            // 發出 validity-changed 事件通知父組件當前驗證狀態
            emit('validity-changed', valid);
            console.log(`ItemParticipantForm (${props.orderItem.id}) validation status: ${valid}`);
        });
    } else {
        // 如果無需填寫旅客資料，視為驗證通過
        isFormValid.value = true;
        emit('validity-changed', true);
          console.log(`ItemParticipantForm (${props.orderItem.id})無需填寫旅客資料，驗證狀態為通過.`);
    }
};

// 在組件掛載後觸發一次驗證狀態評估，確保初始狀態正確
onMounted(() => {
    validateFormStatus();
});

// 監聽 props.orderItem.startDate 的變化，當行程日期改變時，重新觸發所有旅客的年齡驗證
watch(() => props.orderItem.startDate, (newDate, oldDate) => {
    if (newDate !== oldDate && numberOfParticipants.value > 0 && itemFormRef.value) {
        console.log("行程開始日期改變，觸發所有旅客年齡驗證...");
        nextTick(() => {
            participantsData.value.forEach((participant, index) => {
                  // 觸發 birthDate 欄位的驗證
                  itemFormRef.value.validateField(`passengers[${index}].birthDate`, () => {});
            });
            // 在所有年齡驗證觸發後，重新評估整體表單狀態
            validateFormStatus();
        });
    }
});

// 監聽 props.tripDestinationCountry 的變化，當目的地國家改變時，重新觸發護照相關欄位的驗證
watch(() => props.tripDestinationCountry, (newCountry, oldCountry) => {
      if (newCountry !== oldCountry && numberOfParticipants.value > 0 && itemFormRef.value) {
          console.log("目的地國家改變，觸發護照相關欄位驗證...");
          nextTick(() => {
                participantsData.value.forEach((participant, index) => {
                    // 觸發護照相關欄位的驗證
                    const passportFields = ['lastNameEn', 'firstNameEn', 'passportNumber', 'passportExpiryDate'];
                    passportFields.forEach(field => {
                          // 檢查對應的 prop 路徑是否存在
                          const propPath = `passengers[${index}].${field}`;
                          if (Object.prototype.hasOwnProperty.call(formModelForValidation.passengers[index], field)) {
                               itemFormRef.value.validateField(propPath, () => {});
                          }
                    });
                });
               // 在所有護照相關驗證觸發後，重新評估整體表單狀態
               validateFormStatus();
          });
      }
});


// 暴露驗證方法給父組件 (如果父組件需要主動觸發表單驗證)
// 這個方法會觸發整個 ItemParticipantForm 的驗證，並返回驗證結果
const validateAll = async () => {
  // 如果 numberOfParticipants 是 0，表示無需填寫表單，直接視為驗證通過
  if (numberOfParticipants.value === 0) {
        console.log("無需填寫旅客資料，validateAll 自動通過。");
        // 確保狀態也更新為通過
        isFormValid.value = true;
        emit('validity-changed', true);
        return true; // 返回 true
  }

  // 如果需要填寫旅客資料，觸發 el-form 的驗證
  if (itemFormRef.value) {
      console.log("觸發 ItemParticipantForm 完整驗證...");
      try {
          // 呼叫 el-form 實例的 validate 方法，等待驗證完成
          await itemFormRef.value.validate();
          // 如果 validate 成功 (沒有拋出錯誤)，表示驗證通過
          isFormValid.value = true; // 更新內部狀態
          emit('validity-changed', true); // 發出狀態事件
          console.log("ItemParticipantForm 完整驗證通過.");
          return true; // 返回 true
      } catch (fields) {
          // 如果 validate 拋出錯誤，表示驗證失敗 (fields 包含所有驗證失敗的欄位信息)
          isFormValid.value = false; // 更新內部狀態
          emit('validity-changed', false); // 發出狀態事件
          console.warn("ItemParticipantForm 完整驗證失敗:", fields);
          // 這裡可以選擇返回 false 或者 reject(fields)
          // 為了讓父組件能 await 獲取結果，返回 false 比較方便
          return false; // 返回 false
      }
  } else {
      // 如果 ItemParticipantForm 應該顯示但 form ref 不存在 (可能是組件還沒渲染完成或其他問題)
      console.error("ItemParticipantForm: Form ref not available for validateAll.");
      isFormValid.value = false; // 視為驗證失敗
      emit('validity-changed', false); // 發出狀態事件
      return false; // 返回 false
  }
};

// 暴露 validateAll 方法和 orderItem 屬性給父組件，以便父組件可以控制驗證和獲取相關商品信息
defineExpose({
  validateAll, // 暴露驗證方法
  orderItem: props.orderItem // 暴露 orderItem 屬性，以便父組件在驗證失敗時獲取商品 ID 等信息
});

</script>

<style scoped>

/* 整個 ItemParticipantForm 容器樣式 */
.item-participant-form {
  padding-top: 10px; /* 上方間距 */
}

/* 單個旅客表單區塊樣式 */
.participant-entry {
  margin-bottom: 25px;
  padding-bottom: 15px;
}
/* 最後一個旅客區塊移除底部間距和內邊距 */
.participant-entry:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
}

/* 旅客標題樣式 (例如 "旅客 1 (成人)") */
.participant-entry h4 {
    font-size: 1.1em; /* 調整字體大小 */
    margin-top: 0; /* 移除頂部預設 margin */
    margin-bottom: 18px; /* 與下方表單項目的間距 */
    color: var(--el-text-color-primary, #303133); /* 使用 Element Plus 主要文字顏色 */
    border-left: 3px solid var(--el-color-primary, #409eff); /* 左側主題色邊框 */
    padding-left: 10px; /* 左側內邊距 */
    font-weight: var(--el-font-weight-bold, bold); /* 加粗字體 */
    display: flex; /* 使用 flexbox 佈局 */
    align-items: center; /* 垂直置中對齊子項目 */
    justify-content: space-between; /* 在標題和類型之間留白 */
}

/* 旅客類型文字樣式 (例如 "(成人)") */
.participant-type {
    font-weight: var(--el-font-weight-primary, 500); /* 使用 Element Plus 字體粗細 */
    color: var(--el-text-color-secondary, #909399); /* 使用 Element Plus 次要文字顏色 */
    font-size: 0.9em; /* 字體大小 */
    margin-left: 10px; /* 與標題文字的間距 */
    flex-shrink: 0; /* 防止類型文字被擠壓 */
}


/* 旅客分隔線樣式 */
.participant-divider {
 margin-top: 25px; /* 與上方元素的間距 */
 border-top: 1px dashed var(--el-border-color-light, #e4e7ed); /* 虛線分隔線 */
}

.remarks-form-item .el-form-item__content {
    position: relative; /* 確保此容器具有相對定位，作為字數計數的絕對定位基準 */
}

/* 響應式調整，小螢幕下每行一個欄位 */
@media (max-width: 768px) {
    .participant-entry .el-row > .el-col {
        flex-basis: 100%;
    }
}


</style>