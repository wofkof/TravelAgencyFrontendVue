<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">個人資料設定</h2>

    <div class="space-y-6">
  <!-- 姓名、生日 -->
  <div class="form-row">
    <div class="form-col">
      <label class="label">姓名 <span class="text-red-500">*</span></label>
      <el-input
        v-model="member.name"
        placeholder="請輸入姓名"
        class="fixed-input"
      />
    </div>

    <div class="form-col">
      <label class="label">生日 <span class="text-red-500">*</span></label>
      <el-date-picker
        v-model="member.birthday"
        type="date"
        placeholder="YYYYMMDD"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="fixed-input"
        :class="{ 'border border-red-500': errors.birthday }"
      />
      <p class="error-info" v-if="errors.birthday">{{ errors.birthday }}</p>
    </div>
  </div>

  <!-- 信箱、手機 -->
  <div class="form-row">
    <div class="form-col">
      <label class="label">E-mail <span class="text-red-500">*</span></label>
      <el-input
        v-model="member.email"
        disabled
        class="fixed-input"
      />
    </div>

    <div class="form-col">
      <label class="label">聯絡手機 <span class="text-red-500">*</span></label>
      <el-input
        v-model="member.phone"
        maxlength="10"
        placeholder="09xxxxxxxx"
        class="fixed-input"
        :class="{ 'border border-red-500': errors.phone }"
      />
      <p class="error-info" v-if="errors.phone">{{ errors.phone }}</p>
    </div>
  </div>

  <!-- 國籍 -->
  <div class="form-row">
    <div class="form-col">
      <label class="label">國籍</label>
      <el-select
        v-model="member.nationality"
        placeholder="請選擇國籍"
        class="fixed-input"
      >
        <el-option label="台灣" value="TW" />
        <el-option label="日本" value="JP" />
        <el-option label="美國" value="US" />
        <el-option label="韓國" value="KR" />
        <el-option label="其他" value="OTHER" />
      </el-select>
    </div>

    <!-- 身分證與性別 -->
    <div class="form-row">
      <div class="form-col">
        <label class="label">身分證字號</label>
        <el-input
          v-model="member.idNumber"
          maxlength="10"
          class="fixed-input"
          :class="{ 'border border-red-500': errors.idNumber }" @blur="detectGenderFromId(member.idNumber)"

        />
        <p class="error-info" v-if="errors.idNumber">{{ errors.idNumber }}</p>
      </div>

      <div class="form-col">
        <label class="label">性別</label>
        <el-select
  v-model="member.gender"
  placeholder="請選擇性別"
  class="fixed-input"
  :disabled="member.nationality === 'TW'"
>
  <el-option label="男性" value="Male" />
  <el-option label="女性" value="Female" />
  <el-option label="其他" value="Other" />
</el-select>

      </div>
    </div>
  </div>

  <!-- 地址 -->
  <div class="form-row">
    <div class="form-col" style="margin-right: auto;">
      <label class="label">居住地址</label>
      <el-input v-model="member.address" class="fixed-input" />
    </div>
  </div>

  <!-- 護照資訊 -->
  <p class="mt-4 font-semibold">-----護照資訊-----</p>

  <div class="form-col">
    <label class="label">證件類別</label>
    <el-select
      v-model="member.documentType"
      placeholder="請選擇證件類型"
      class="fixed-input" 
    >
      <el-option label="護照" value="Passport" />
      <el-option label="居留證" value="ResidencePermit" />
      <el-option label="台胞證" value="EntryPermit" />
    </el-select>
  </div>

  <div class="form-row">
    <div class="form-col">
      <label class="label">護照英文姓 (Surname)</label>
      <el-input
        v-model="member.passportSurname"
        placeholder="例：CHEN"
        class="fixed-input"
      />
    </div>
    <div class="form-col">
      <label class="label">護照英文名 (Given name)</label>
      <el-input
        v-model="member.passportGivenName"
        placeholder="例：HSIAOMING"
        class="fixed-input"
      />
    </div>
  </div>

  <div class="form-row">
    <div class="form-col">
      <label class="label">護照號碼</label>
      <el-input
        v-model="member.documentNumber"
        placeholder="請輸入護照號碼"
        class="fixed-input"
      />
    </div>

    <div class="form-col">
      <label class="label">護照效期到期日</label>
      <el-date-picker
        v-model="member.passportExpireDate"
        type="date"
        placeholder="請選擇到期日"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        class="fixed-input"
        :class="{ 'border border-red-500': errors.passportExpireDate }"
      />
      <p class="error-info" v-if="errors.passportExpireDate">{{ errors.passportExpireDate }}</p>
    </div>
  </div>

  <!-- 儲存按鈕 -->
  <div class="flex justify-end pt-4">
    <el-button type="primary" @click="updateMember">儲存修改</el-button>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

const member = ref({})
const errors = ref({})

const validateFields = () => {
  errors.value = {}

  // 1. 生日驗證：不可為未來日，不可超過 85 歲
  const now = new Date()
  const birthDate = new Date(member.value.birthday)
  const eightyFiveYearsAgo = new Date()
  eightyFiveYearsAgo.setFullYear(now.getFullYear() - 85)

  if (!member.value.birthday) {
    errors.value.birthday = '請填寫生日'
  } else if (birthDate < eightyFiveYearsAgo || birthDate > now) {
    errors.value.birthday = '生日需為有效日期（85 歲內且非未來日）'
  }

  // 2. 身分證驗證（限定 TW）
  const idNumberRegex = /^[A-Z][1289]\d{8}$/
  if (member.value.nationality === 'TW') {
    if (!member.value.idNumber) {
      errors.value.idNumber = '請填寫身分證字號'
    } else if (!idNumberRegex.test(member.value.idNumber)) {
      errors.value.idNumber = '身分證格式錯誤'
    }
  }

  // 3. 護照到期日需為未來日
  if (member.value.passportExpireDate) {
    const expire = new Date(member.value.passportExpireDate)
    if (expire <= now) {
      errors.value.passportExpireDate = '護照效期需為未來日期'
    }
  }
  // 4. 手機格式驗證（選填，但若填了就要符合格式）
  const phoneRegex = /^09\d{8}$/
  if (member.value.phone && !phoneRegex.test(member.value.phone)) {
    errors.value.phone = '手機格式錯誤（應為09開頭共10碼）'
  }

  return Object.keys(errors.value).length === 0
}

const updateMember = async () => {
  if (!validateFields()) {
    const firstError = Object.values(errors.value)[0]
    ElMessage.error(firstError)
    return
  }

  try {
    await api.put('/AccountSetting/profile', member.value)
    ElMessage.success('資料已更新')
  } catch (err) {
    ElMessage.error('更新失敗')
  }
}
const detectGenderFromId = (idNumber) => {
  if (member.value.nationality !== 'TW') return
  if (!idNumber || idNumber.length < 2) return

  const genderCode = idNumber[1]
  if (genderCode === '1' || genderCode === '8') {
    member.value.gender = 'Male'
  } else if (genderCode === '2' || genderCode === '9') {
    member.value.gender = 'Female'
  } else {
    member.value.gender = 'Other'
  }
}
const documentTypeMap = {
  PASSPORT: 'Passport',
  RESIDENCEPERMIT: 'ResidencePermit',
  ENTRYPERMIT: 'EntryPermit'
}


onMounted(async () => {
  const id = localStorage.getItem('memberId')
  if (!id) {
    ElMessage.warning('尚未登入，無法載入會員資料')
    return
  }

  try {
    const res = await api.get(`/AccountSetting/profile?memberId=${id}`)

    const genderMap = { 0: 'Male', 1: 'Female', 2: 'Other' }

    member.value = {
      ...res.data,
      gender: genderMap[res.data.gender] ?? res.data.gender,
      documentType: documentTypeMap[res.data.documentType?.toUpperCase()] ?? ''
    }
  } catch (err) {
    ElMessage.error('載入會員資料失敗')
  }
})

</script>

<style scoped>
.form-row {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.form-col {
  width: 220px;
  display: flex;
  flex-direction: column;
}

.form-col-full {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: 500;
  margin-bottom: 6px;
}

.fixed-input {
  width: 220px;
}

.invisible {
  visibility: hidden;
}

.error-info {
  color: red;
  font-size: 12px;
  margin-top: 4px;
}

</style>

