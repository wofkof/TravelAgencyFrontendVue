<template>
   <div class="container">
    <h1>{{ form.title }}</h1>
    <div class="header">
      <el-date-picker
        v-model="form.daterange"
        type="daterange"
        start-placeholder="Start Date"
        end-placeholder="End Date"
        readonly
        style="max-width: 300px"
      />
      <div class="budget">
      <label>預算總金額</label>
      <el-input v-model="form.budget" placeholder="Money" style="width: 200px" readonly/>
    </div>
      <el-button color="#62b9ff" @click="goBack" plain  round>返回</el-button>
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
              :timestamp="`${item.time} ${item.categoryText}`"
              :icon="LocationInformation"
            >
               <div class="activity-card"> 
                <div class="info-area">
                <div class="row">
                  <div class="item">{{ item.itemName}}</div>                 
                </div>                
                <div class="row">
                  <div class="desc">{{ item.desc }}</div>
             </div>
              </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
  
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'
import { LocationInformation } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
import { computed } from 'vue'
const memberId = computed(() => authStore.memberId)


const form = ref({
  title: '',
  daterange: [],
  days: '',
  budget: ''
})

const route = useRoute()
const router = useRouter()
const { customTravelId } = defineProps({
  customTravelId: Number
})
const activeDay = ref('1')
const dailyActivities = ref([])

onMounted(async () => {
  try {
    const res = await api.get(`/Content?id=${customTravelId}`)
    const raw = res.data
    const travelRes = await api.get(`/List?memberId=${memberId.value}`) 
    const travel = travelRes.data.find(t => t.customTravelId == customTravelId)

    if (travel) {
      form.value.title = travel.note
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

const emit = defineEmits(['go-back'])
const goBack = () => {emit('go-back')}
</script>
  
<style scoped>
   .container {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  }
  
h1 {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }

  .header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .tabs{
    background-color: #f0f2f3;
    border-radius: 10px;
    height: 800px;
  }
  
  .scroll-wrapper {
    max-height: 700px;
    overflow-y: auto;
    padding-right: 10px;
  }
  
  .activity-card {
    width: 100%;
  max-width: 700px;
    background-color: #F9FAFB;
    border-radius: 10px;
    padding: 5px;
    color: #263238;
    display: flex;
  align-items: stretch;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.233);
  }
  
.info-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
}

  .row{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .budget {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .item {
  font-size: 20px;
  font-weight: bold;
}

.desc {
  font-size: 16px;
  color: #333;
}

.el-button{
  font-size: 18px;
  height: 36px;
  padding: 6px 12px;
}

::v-deep(.el-timeline-item__timestamp) {
  font-size: 17px;
  color: #616161;
}
::v-deep(.el-timeline-item__icon) {
  font-size: 16px;
  color: #274106;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
}
</style>