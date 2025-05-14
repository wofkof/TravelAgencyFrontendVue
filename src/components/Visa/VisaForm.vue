<!-- Components/VisaForm.vue -->
<template>
  <el-form :model="form" label-width="100px">
    <el-form-item label="姓名">
      <el-input v-model="form.name" placeholder="請輸入姓名" />
    </el-form-item>

    <el-form-item label="護照號碼">
      <el-input v-model="form.passport" placeholder="請輸入護照號碼" />
    </el-form-item>

    <el-form-item label="簽證類型">
      <el-select v-model="form.type" placeholder="請選擇簽證類型">
        <el-option label="旅遊簽證" value="tourist" />
        <el-option label="學生簽證" value="student" />
        <el-option label="工作簽證" value="work" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  passport: '',
  type: ''
})

function submitForm() {
  console.log('送出表單:', form)
  alert(`✅ 已送出申請：${form.name} (${form.type})`)
}
</script>
