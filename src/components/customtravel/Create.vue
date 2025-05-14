<template>
    <div class="container">
    <h1>建立自訂行程</h1>
    <div class="form">
    <el-form :model="form" label-position="left" label-width="80px" style="max-width: 600px">
      <el-form-item label="行程名稱">
        <el-input v-model="form.title" />
      </el-form-item>    
      <el-form-item label="日期">        
      <el-date-picker
        v-model="form.daterange"
        type="daterange"
        start-placeholder="Start Date"
        end-placeholder="End Date"
        value-format="YYYY-MM-DD"
        :disabled-date="disabledBefore"
        @change="DateChange"
      />
      </el-form-item>
      <el-form-item label="天數">
        <el-input v-model="form.days" readonly/>
      </el-form-item>
      <el-form-item label="人數">
        <el-input v-model="form.people" @input="NumberInput"  placeholder="請輸入人數(1-50)"/>
      </el-form-item>        
      <el-form-item>
        <el-button type="primary" class="btn" @click="onSubmit">新增行程</el-button>      
      </el-form-item>
    </el-form>
  </div>
  <div class="backbtn">
    <el-button type="primary" @click="goBack">返回</el-button>
  </div>
</div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useTravelStore } from '@/stores/customtravelStore'


  const router = useRouter()
  const travelStore = useTravelStore()
  
  const form = reactive({
    title: '',  
    daterange:[],
    days:'',
    people:'',  
  })

  function disabledBefore(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 清除時間部分
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return date < tomorrow
}
  
  function DateChange([starts, ends]) {
  if (!starts || !ends) {
    form.days = 0
  } else {
    const start = new Date(starts)
    const end = new Date(ends)
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
    form.days = diff
  }
}

function NumberInput(val) {
  form.people = val.replace(/\D/g, '')  // 移除所有非數字
const num = parseInt(cleanVal, 10)

  if (!cleanVal) {
    form.people = ''
  } else if (num < 1) {
    form.people = '1'
  } else if (num > 50) {
    form.people = '50'
  } else {
    form.people = cleanVal
  }
}

  const onSubmit = () => {   
    const id = Date.now()
    const newTravel = {
    id,
    title: form.title,
    daterange:form.daterange,
    days: form.days,
    people: form.people,
  }

  const existing = JSON.parse(localStorage.getItem('list') || '[]')
  existing.push(newTravel)
  localStorage.setItem('list', JSON.stringify(existing))
  
  travelStore.setTravelForm(newTravel)
  travelStore.setDailyActivities(Array.from({ length: newTravel.days }, () => []))

  router.push({ name: 'CustomtravelContent', params: { id } })
  }

  const goBack = () => {router.push('/CustomtravelList')}
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

  .el-form-item{    
    font-weight: bold;
  }

  .backbtn{
    margin-top: 30px;
  }

  .el-button{
  font-size: 18px;
  height: 36px;
  padding: 6px 12px;
}
  </style>