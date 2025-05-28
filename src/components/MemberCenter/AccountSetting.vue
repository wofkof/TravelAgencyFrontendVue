<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">會員帳號管理</h2>
    <div class="space-y-6">
  
   <div class="space-y-4">
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
      <label class="label">聯絡E-mail <span class="text-red-500">*</span></label>
      <el-input
        v-model="member.email"
        disabled
        class="fixed-input"
      />
    </div>

    <div class="form-col">
      <label class="label">聯絡手機 <span class="text-red-500">*</span></label>

          <el-input
      :model-value="member.isFakePhone ? '' : member.phone"
      @input="val => member.phone = val"
      maxlength="10"
      placeholder="尚未填寫"
      class="fixed-input"
      :class="{ 'border border-red-500': errors.phone }"
    />
      <p class="error-info" v-if="errors.phone">{{ errors.phone }}</p>
    </div>
  </div>

  <!-- 地址 -->
    <div class="form-col" style="width: 100%">
      <label class="label">居住地址</label>
      <el-input
    v-model="member.address"
    class="w-full" />
    </div>
   </div>
</div>

  <!-- 護照資訊 -->  
   <div class="bg-gray-50 shadow-sm border border-gray-200 rounded-xl p-6 mt-6 space-y-4">
 <div class="flex items-center justify-between border-b pb-2">
  <h3 class="text-lg font-semibold text-gray-800">
    護照與證件資訊
  </h3>
  <h4 class="text-sm text-gray-500 font-normal">(非必填)</h4>
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
  <div class="form-row">
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
  <div class="form-col">
      <label class="label">證件號碼</label>
      <el-input
        v-model="member.documentNumber"
        placeholder="請輸入護照號碼"
        class="fixed-input"
      />
    </div>
  </div>
  <div class="flex justify-end pt-4">
  <el-button type="primary" @click="updateMember">儲存修改</el-button>
</div>
  </div>
 
<!-- 修改密碼 -->
<div class="bg-gray-50 shadow-sm border border-gray-200 rounded-xl p-6 mt-6 space-y-4">
  <div class="flex items-center justify-between border-b pb-2">
    <h3 class="text-lg font-semibold text-gray-800">修改密碼</h3>
    <h4 class="text-sm text-gray-500 font-normal">(需輸入舊密碼)</h4>
  </div>

  <div class="form-row">
    <div class="form-col">
      <label class="label">舊密碼</label>
      <el-input
        v-model="changePasswordForm.oldPassword"
        type="password"
        show-password
        class="fixed-input" placeholder="請輸入目前使用的密碼"  :maxlength="12"
  :minlength="6"
      />
    </div>
    <div class="form-col">
      <label class="label">新密碼</label>
      <el-input
        v-model="changePasswordForm.newPassword"
        type="password"
        show-password
        class="fixed-input" placeholder="請設定長度6~12位數，且包含大、小寫英文的密碼"  :maxlength="12"
  :minlength="6"
      />
    </div>
    <div class="form-col">
      <label class="label">確認新密碼</label>
      <el-input
        v-model="changePasswordForm.confirmPassword"
        type="password"
        show-password
        class="fixed-input" placeholder="請再次輸入新密碼"  :maxlength="12"
  :minlength="6"
      />
    </div>
  </div>

  <div class="flex justify-end pt-4">
    <el-button type="warning" @click="changePassword">變更密碼</el-button>
  </div>
</div>
</div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'
import { useAuthStore } from '@/stores/authStore' 
const authStore = useAuthStore()   
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
  const sixMonthsLater = new Date()
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

  if (expire <= sixMonthsLater) {
    errors.value.passportExpireDate = '護照效期需距今至少六個月'
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
const isValidPassword = (pwd) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z]).{6,12}$/;
  return regex.test(pwd);
}

onMounted(async () => {
   const id = authStore.memberId 
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
      documentType: documentTypeMap[res.data.documentType?.toUpperCase()] ?? '',
      isFakePhone: res.data.isFakePhone
    }
  } catch (err) {
    ElMessage.error('載入會員資料失敗')
  }
})
const changePasswordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const changePassword = async () => {
  if (!changePasswordForm.value.oldPassword || !changePasswordForm.value.newPassword || !changePasswordForm.value.confirmPassword) {
    ElMessage.error('請填寫所有欄位')
    return
  }
  if (!isValidPassword(changePasswordForm.value.newPassword)) {
  ElMessage.error('新密碼格式錯誤（需含大小寫英文，長度6~12位）')
  return
}

  if (changePasswordForm.value.newPassword !== changePasswordForm.value.confirmPassword) {
    ElMessage.error('新密碼與確認密碼不一致')
    return
  }

  try {
    await api.put('/Account/change-password', {
      memberId: authStore.memberId,
      oldPassword: changePasswordForm.value.oldPassword,
      newPassword: changePasswordForm.value.newPassword,
      confirmPassword: changePasswordForm.value.confirmPassword
    })
    ElMessage.success('密碼已更新')
    changePasswordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    ElMessage.error(err.response?.data || '修改密碼失敗')
  }
}

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

