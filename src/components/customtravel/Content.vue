<template>
    <div class="container">
      <div class="header">
        <el-date-picker v-model="form.start" type="date" placeholder="Starts" disabled />
        <el-date-picker v-model="form.end" type="date" placeholder="End" disabled />
        <el-input v-model="form.days" placeholder="Days" disabled />
        <el-button type="primary" @click="goBack">返回</el-button>
      </div>
  
      <el-tabs v-model="activeDay" type="border-card" class="tabs">
        <el-tab-pane
          v-for="day in Number(form.days)"
          :key="day"
          :label="`Day ${day}`"
          :name="day.toString()"
        >
        <div class="scroll-wrapper">
          <el-timeline style="max-width: 600px">
            <el-timeline-item  placement="top"  
            v-for="(item, index) in dailyActivities[day - 1]"
            :key="index"
            :timestamp="item.time"
            :icon="LocationInformation">
            <el-card class="activity-card">
              <div class="content">
                <div class="category">{{item.category}}</div>
                <div class="title">{{ item.title }}</div>
                <div class="desc">{{ item.desc }}</div>           
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>       
      </div>
        </el-tab-pane>
      </el-tabs>
  
      <div class="budget">
        <label>預算總金額</label>
        <el-input v-model="form.budget" placeholder="Money" style="width: 200px" />
      </div>
<CRUDDialog :onAdd="addContent"/>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
  import { LocationInformation } from '@element-plus/icons-vue'  
import CRUDDialog from '@/components/customtravel/ContentDialog.vue'
  
const route = useRoute()
const router = useRouter()
const activeDay = ref('1') 
const dailyActivities = ref([])

const form = reactive({
  start: '',
  end: '',
  days: '',
  budget: '',
})

onMounted(() => {
  const index = parseInt(route.params.index)
  const stored = JSON.parse(localStorage.getItem('list') || '[]')
  const list = stored[index]

  if (list) {
    form.start = list.start
    form.end = list.end
    form.days = list.days

    const dayCount = parseInt(form.days)
    if (!isNaN(dayCount) && dayCount > 0) {
      const saved = JSON.parse(localStorage.getItem(`activities_${index}`) || '[]')
      dailyActivities.value = saved.length > 0
        ? saved
        : Array.from({ length: dayCount }, () => [])
    } else {
      console.warn('form.days 無效，無法產生活動陣列')
    }
  } else {
    router.push('/CustomtravelList')
  }
})

const goBack = () => {
  router.push('/CustomtravelList')
}

const addContent = (item) => {
  const dayIndex = parseInt(activeDay.value) - 1
  if (dayIndex >= 0 && dayIndex < dailyActivities.value.length) {
    dailyActivities.value[dayIndex].push(item)
  }
}

watch(dailyActivities, (newVal) => {
  localStorage.setItem(`activities_${route.params.index}`, JSON.stringify(newVal))
}, { deep: true })
    
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .tabs{
    background-color: #b5cff59f;
    border-radius: 10px;
    height: 800px;
  }
  
  .scroll-wrapper {
    max-height: 700px;
    overflow-y: auto;
    padding-right: 10px;
  }
  
  .activity-card {
    background-color: #6ab8e6;
    padding: 12px 20px;
    border-radius: 14px;
    margin-bottom: 15px;
    color: #fff;
    font-weight: bold;
  }
  
  .content{
    display: flex;
    justify-content: space-between;
  }
  
  .budget {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }
  </style>
  