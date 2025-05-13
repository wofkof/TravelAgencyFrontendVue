<template>
    <div class="header">
      <h1 class="title">自訂行程</h1>
      <el-button class="create-btn" type="primary" @click="createNew">新增行程</el-button>
    </div>
    
    <div class="container">
      <div class="travel-list">
        <div
          class="travel-card"
          v-for="(item, index) in list"
          :key="index"
        >
          <div class="info-area">
            <div class="row">
              <el-input v-model="item.title" placeholder="Title" readonly />
              <el-input v-model="item.people" placeholder="People" readonly style="width: 100px" />
              <span>人</span>
            </div>
            <div class="row">              
              <el-date-picker v-model="item.daterange" type="daterange" start-placeholder="Start Date" end-placeholder="End Date" readonly />
              <el-input v-model="item.days" placeholder="Days" readonly style="width: 100px" />
              <span>天</span>
              <!-- <el-icon ><Edit /></el-icon> -->
            </div>
          </div>
          <div class="action-area">
            <el-icon @click="editTravel(item)"><Edit /></el-icon>
            <el-icon @click="deleteTravel(index)"><Delete /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref , onMounted } from 'vue'
  import { Edit, Delete } from '@element-plus/icons-vue'
  import { useRouter } from 'vue-router'
  import { useTravelStore } from '@/stores/customtravelStore'

  const router = useRouter()
  const list = ref([])
  const travelStore = useTravelStore()
  
  onMounted(() => {
    const user = JSON.parse(localStorage.getItem('user'))
  if (!user?.userId) {
    router.push('/login')
    return
  }

  const stored = localStorage.getItem('list')
  if (stored) {
    const all = JSON.parse(stored)
    list.value = all.filter(x => x.userId === user.userId)
    } 
})

  const createNew = () => {   
    router.push('/CustomtravelCreate')
  }
  
  const editTravel = (item) => {
    travelStore.setTravelForm(item)
  travelStore.setDailyActivities(JSON.parse(localStorage.getItem(`activities_${item.id}`) || '[]'))
    router.push({ name: 'CustomtravelContent', params: { id: item.id } })
  }
  
  const deleteTravel = (index) => {
    const id = list.value[index].id
    localStorage.removeItem(`activities_${id}`)
    list.value.splice(index, 1)
    localStorage.setItem('list', JSON.stringify(list.value))
  }
  </script>
  
  <style scoped>
  .container {
    padding: 30px;
    background-color: #71b2d879;
    border-radius: 20px;
    max-width: 800px;
    height: 600px;
    margin: 0 auto;
  }
  
  .header {
    position: relative;
    margin-bottom: 30px;
    max-width: 800px;
  }
  
  .title {
    font-weight: bold;
    font-size: 28px;
    text-align: center;
    width: 100%;
    }
  
  .create-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
  
  .travel-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .travel-card {
    display: flex;
    align-items: stretch;
    border-radius: 12px;
    box-shadow: 2px 2px 8px #ccc;
    overflow: hidden;
  }
  
  .info-area {
    flex: 1;
    padding: 15px;
    background-color: #f1f8e9;
  }
  
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .action-area {
    width: 60px;
    background-color: #d7eafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
  }
  
  </style>
  