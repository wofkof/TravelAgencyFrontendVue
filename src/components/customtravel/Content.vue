<template>
  <div class="container">
    <DeleteDialog ref="deleteDialog"/>
    <Dialog ref="dialogRef" :onAdd="addContent" :onEdit="updateContent" />
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
      <el-button type="success" @click="openCreateDialog">新增項目</el-button>
    </div>

    <el-tabs v-model="activeDay" type="border-card" class="tabs">
      <el-tab-pane
        v-for="day in Number(form.days)"
        :key="day"
        :label="`Day ${day}`"
        :name="day.toString()"
      >
        <div class="scroll-wrapper">
          <el-timeline style="width: 100%">
            <el-timeline-item
              placement="top"
              v-for="(item, index) in dailyActivities[day - 1].slice().sort((a, b) => a.time.localeCompare(b.time))"
              :key="index"
              :timestamp="`${item.time} ${CategoryName(item.category)}`"
              :icon="LocationInformation"
            >
              <div class="activity-card"> 
                <div class="info-area">
                <div class="row">
                  <div class="item">{{ ItemName(item.category, item.item) }}</div>
                </div>
                <div class="row">
                  <div class="desc">{{ item.desc }}</div>
                </div>
              </div>
              <div class="actions">
                    <el-button color="#626aef"  @click="editItem(day - 1, index)" :icon="Edit" circle></el-button>                    
                    <el-button type="danger" @click="removeItem(day - 1, index)" :icon="Delete" circle></el-button>
                </div>          
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="down">
    <div class="budget">
      <label>預算總金額</label>
      <el-input v-model="form.budget" placeholder="Money" style="width: 200px" />
    </div>
      <el-button type="success" @click="saveToServe">送出審核</el-button>
    </div>
    
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LocationInformation, Edit, Delete } from '@element-plus/icons-vue'
import Dialog from '@/components/customtravel/ContentDialog.vue'
import DeleteDialog from '@/components/customtravel/DeleteDialog.vue'
import axios from 'axios'
import { useTravelStore } from '@/stores/customtravelStore'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const travelStore = useTravelStore()
const activeDay = ref('1')
const dialogRef = ref(null)
const deleteDialog = ref(null)
const dailyActivities = ref([])
const city = ref([])
const district = ref([])
const attraction = ref([])
const restaurant = ref([])
const accommodation = ref([])
const transport = ref([])
const memberId = localStorage.getItem('memberId')

const form = reactive({
  title:'',
  daterange: [],
  days: '',
  budget: ''
})


onMounted(async ()=>{
  const id = route.params.id
  const stored = JSON.parse(localStorage.getItem('list') || '[]')
  const current = stored.find(x => x.id == id)

  if (!current) {
    router.push('/CustomtravelList') 
    return
  }

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

  travelStore.loadFromLocal()
  form.title = travelStore.travelForm.title
  form.daterange = travelStore.travelForm.daterange
  form.days = travelStore.travelForm.days
  form.budget = travelStore.travelForm.budget
  dailyActivities.value = travelStore.dailyActivities

  const dayCount = parseInt(form.days)
  if (!Array.isArray(dailyActivities.value) || dailyActivities.value.length !== dayCount) {
    dailyActivities.value = Array.from({ length: dayCount }, () => [])
  }

})

const goBack = () => router.push('/CustomtravelList')

const CategoryName = (id) => {
  switch (id) {
    case 0: return '🏡住宿'
    case 1: return '🗺景點'
    case 2: return '🍽餐廳'
    case 3: return '🚘交通'
    default: return '❓未知'
  }
}

const ItemName = (category, itemId) => {
  switch (category) {
    case 0:
      return accommodation.value.find(a => a.accommodationId === itemId)?.accommodationName || '未知'
    case 1:
      return attraction.value.find(a => a.attractionId === itemId)?.attractionName || '未知'
    case 2:
      return restaurant.value.find(r => r.restaurantId === itemId)?.restaurantName || '未知'
    case 3:
      return transport.value.find(t => t.transportId === itemId)?.transportMethod || '未知'
    default:
      return '未知'
  }
}

const removeItem = async(dayIndex, itemIndex) => {
  try{
    await deleteDialog.value.open({
      title:'確認刪除',
      message:'確定要刪除這筆行程內容嗎?',
    })
    dailyActivities.value[dayIndex].splice(itemIndex, 1)
    travelStore.setDailyActivities(dailyActivities.value)
   
    ElMessage.success('刪除成功')
  }catch{
    ElMessage.info('取消刪除')
  }
}


const addContent = (item) => {
  const dayIndex = parseInt(activeDay.value) - 1
  dailyActivities.value[dayIndex].push({ ...item })
  travelStore.setDailyActivities(dailyActivities.value)
}

const updateContent = ({ dayIndex, itemIndex, ...updated }) => {
  dailyActivities.value[dayIndex][itemIndex] = updated
  travelStore.setDailyActivities(dailyActivities.value)
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

const saveToServe = async() =>{ 
  if (!memberId) {
    ElMessage.warning('請先登入會員，才可送出審核!')
    return
  }
  const payload = {
    memberId: memberId,
    note: form.title,
    departureDate: form.daterange[0],
    endDate: form.daterange[1],
    days: Number(form.days),
    totalAmount: Number(form.budget),
    people: Number(travelStore.travelForm.people),
    contents: dailyActivities.value.flatMap((dayList, dayIndex) =>
      dayList.map(item => ({
        day: dayIndex + 1,
        time: item.time,
        itemId: item.item,
        category: item.category,
        accommodationName: item.desc
      }))
    )
  }

  try {
    await axios.post('https://localhost:7265/api/Content/Create', payload)

    const list = JSON.parse(localStorage.getItem('list') || '[]')
  const id = route.params.id
  const updatedList = list.filter(item => item.id != id)
  localStorage.setItem('list', JSON.stringify(updatedList))

  localStorage.removeItem('travelForm')
  localStorage.removeItem('dailyActivities')
  localStorage.removeItem(`activities_${route.params.id}`)
    travelStore.clearAll()

    ElMessage.success('送出成功，訂單已送出審核')
    router.push('/CustomtravelList')
  } catch (err) {
    ElMessage.error('發送失敗')
    console.error(err)
  }
}
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
    width: 100%;
  max-width: 700px;
    background-color: #6ab8e6;
    border-radius: 10px;
    padding: 5px;
    color: black;
    font-weight: bold;
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
  
  .actions .el-button {
  margin: 0;
  padding: 4px 8px;
}
  
  .actions {
  width: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding:0;
}

.down {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget {
  flex: 1;
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
  color: black;
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
  