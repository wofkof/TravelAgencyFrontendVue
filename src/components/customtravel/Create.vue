<template>
    <div class="container">
    <h1>建立自訂行程</h1>
    <div class="form">
    <el-form :model="form" label-position="left" label-width="80px" style="max-width: 600px">
      <el-form-item label="行程名稱">
        <el-input v-model="form.name" />
      </el-form-item>    
      <el-form-item label="日期">
        <el-row :gutter="10" style="width: 100%">
        <el-col :span="11">
          <el-date-picker
            v-model="form.StartDate"
            type="date"
            placeholder="StartDate"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="2" class="text-center">
          <span class="text-gray-500">-</span>
        </el-col>
        <el-col :span="11">
          <el-date-picker
            v-model="form.EndDate"
            placeholder="EndDate"
            style="width: 100%"
          />
        </el-col>
      </el-row>
      </el-form-item>
      <el-form-item label="天數">
        <el-input v-model="form.day" />
      </el-form-item>
      <el-form-item label="人數">
        <el-input v-model="form.people" />
      </el-form-item>        
      <el-form-item>
        <el-button type="primary" class="btn" @click="onSubmit">Create</el-button>      
      </el-form-item>
    </el-form>
  </div>
  </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
    
  const form = reactive({
    name: '',  
    StartDate: '',
    EndDate: '',
    day:'',
    people:'',  
  })
  
  const onSubmit = () => {
    const newTravel = {
    title: form.name,
    start: form.StartDate,
    end: form.EndDate,
    days: form.day,
    people: form.people
  }

  const existing = JSON.parse(localStorage.getItem('list') || '[]')
  existing.push(newTravel)
  localStorage.setItem('list', JSON.stringify(existing))
  router.push('/CustomtravelList') 
  }
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 30px;
  }
  
  h1 {
    font-weight: bold;
    font-size: 28px;
    margin-bottom: 20px;
  }
  
  .form {
    background-color: #b9cdcf5d;
    padding: 40px 50px;
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
  }
  
  .btn {
    width: 100%;
    font-size: 18px;
  }
  </style>