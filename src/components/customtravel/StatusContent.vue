<template>
   <div class="container">
    <div class="header">
      <el-date-picker
        v-model="form.daterange"
        type="daterange"
        start-placeholder="Start Date"
        end-placeholder="End Date"
        readonly
        style="max-width: 300px"
      />
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
            <el-timeline-item
              placement="top"
              v-for="(item, index) in dailyActivities[day - 1]"
              :key="index"
              :timestamp="item.time"
              :icon="LocationInformation"
            >
              <el-card class="activity-card">
                <div class="content">
                  <div class="category">{{ item.categoryText }}</div>
                  <div class="item">{{ item.itemName}}</div>
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
      <el-input v-model="form.budget" placeholder="Money" style="width: 200px" readonly/>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { LocationInformation } from '@element-plus/icons-vue'

const form = ref({
  daterange: [],
  days: 3,
  budget: 0
})

const route = useRoute()
const router = useRouter()
const customTravelId = route.params.id
const activeDay = ref('1')
const dailyActivities = ref([])

onMounted(async () => {
  try {
    const res = await axios.get(`https://localhost:7265/api/Content?id=${customTravelId}`)
    const raw = res.data

    const travelRes = await axios.get(`https://localhost:7265/api/List`)
    const travel = travelRes.data.find(t => t.customTravelId == customTravelId)

    if (travel) {
      form.value.daterange = [travel.departureDate, travel.endDate]
      form.value.days = travel.days
      form.value.budget = travel.totalAmount
    }

    const maxDay = Math.max(...raw.map(x => x.day), form.value.days)
    dailyActivities.value = Array.from({ length: maxDay }, () => [])

    raw.forEach(item => {
      dailyActivities.value[item.day - 1].push({
        time: item.time,
        categoryText: item.categoryText,
        itemName: item.itemName,
        desc: item.accommodationName
      })
    })
  } catch (err) {
    console.error('載入行程內容失敗:', err)
  }
})

const goBack = () => {router.push('/CustomtravelStatusList')}
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
    border-radius: 10px;
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