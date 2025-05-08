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
      <el-button type="success" @click="openCreateDialog">新增行程</el-button>
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
                  <div class="category">{{ CategoryName(item.category) }}</div>
                  <div class="item">{{ ItemName(item.category, item.item) }}</div>
                  <div class="desc">{{ item.desc }}</div>
                </div>
                <div class="actions">
                  <el-button type="danger" size="small" @click="removeItem(day - 1, index)">刪除</el-button>
                  <el-button type="primary" size="small" @click="editItem(day - 1, index)">修改</el-button>
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

    <Dialog ref="dialogRef" :onAdd="addContent" :onEdit="updateContent" />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LocationInformation } from '@element-plus/icons-vue'
import Dialog from '@/components/customtravel/ContentDialog.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const activeDay = ref('1')
const dialogRef = ref(null)
const dailyActivities = ref([])
const city = ref([])
const district = ref([])
const attraction = ref([])
const restaurant = ref([])
const accommodation = ref([])
const transport = ref([])

const form = reactive({
  daterange: [],
  days: '',
  budget: ''
})


onMounted(async ()=>{
  try{
    const [cityRes, districtRes, attractionRes, restaurantRes, accommodationRes, transportRes] = await Promise.all([
      axios.get('https://localhost:7265/api/City'),
      axios.get('https://localhost:7265/api/District'),
      axios.get('https://localhost:7265/api/Attraction'),
      axios.get('https://localhost:7265/api/Restaurant'),
      axios.get('https://localhost:7265/api/Accommodation'),
      axios.get('https://localhost:7265/api/Transport'),
    ])

    city.value = cityRes.data
    district.value = districtRes.data
    attraction.value = attractionRes.data
    restaurant.value = restaurantRes.data
    accommodation.value = accommodationRes.data
    transport.value = transportRes.data
  }catch (err) {
    console.error('API 錯誤:', err)
  }
})

const CategoryName = (id) => {
  switch (id) {
    case 0: return '景點'
    case 1: return '餐廳'
    case 2: return '住宿'
    case 3: return '交通'
    default: return '未知'
  }
}

const CityName = (id) => city.value.find(c => c.cityId === id)?.cityName || '未知'
const DistrictName = (id) => district.value.find(d => d.districtId === id)?.districtName || '未知'

const ItemName = (category, itemId) => {
  switch (category) {
    case 0:
      return attraction.value.find(a => a.attractionId === itemId)?.attractionName || '未知'
    case 1:
      return restaurant.value.find(r => r.restaurantId === itemId)?.restaurantName || '未知'
    case 2:
      return accommodation.value.find(a => a.accommodationId === itemId)?.accommodationName || '未知'
    case 3:
      return transport.value.find(t => t.transportId === itemId)?.transportMethod || '未知'
    default:
      return '未知'
  }
}

const removeItem = (dayIndex, itemIndex) => {
  dailyActivities.value[dayIndex].splice(itemIndex, 1)
}

onMounted(() => {
  const id = route.params.id
  const stored = JSON.parse(localStorage.getItem('list') || '[]')
  const list = stored.find(x => x.id == id)

  if (list) {
    form.daterange = list.daterange
    form.days = list.days
    const dayCount = parseInt(form.days)
    dailyActivities.value = JSON.parse(localStorage.getItem(`activities_${id}`) || '[]') || Array.from({ length: dayCount }, () => [])
  } else {
    router.push('/CustomtravelList')
  }
})

const goBack = () => router.push('/CustomtravelList')

const addContent = (item) => {
  const dayIndex = parseInt(activeDay.value) - 1
  if (dayIndex >= 0 && dayIndex < dailyActivities.value.length) {
    dailyActivities.value[dayIndex].push({ ...item })
  }
}

const updateContent = ({ dayIndex, itemIndex, ...updated }) => {
  dailyActivities.value[dayIndex][itemIndex] = updated
}

const editItem = (dayIndex, itemIndex) => {
  const raw = dailyActivities.value[dayIndex][itemIndex]
  const data = {
    category: raw.category,
    item: Array.isArray(raw.item) ? raw.item[0] : raw.item,
    city: Array.isArray(raw.city) ? raw.city[0] : raw.city,
    district: Array.isArray(raw.district) ? raw.district[0] : raw.district,
    time: Array.isArray(raw.time) ? raw.time[0] : raw.time,
    desc: raw.desc
  }
  dialogRef.value?.openEdit({ data, dayIndex, itemIndex })
}

const openCreateDialog = () => {
  dialogRef.value?.openCreate()
}

watch(dailyActivities, (newVal) => {
  localStorage.setItem(`activities_${route.params.id}`, JSON.stringify(newVal))
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
  