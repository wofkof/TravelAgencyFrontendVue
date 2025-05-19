<template>
    <div class="header">
      <h1 class="title">自訂行程</h1>
      <el-button class="create-btn" color="#74cc6c" @click="createNew" plain  round>新增行程</el-button>
    </div>
    
    <div class="container">
      <ConfirmDialog ref="confirmDialog"/>
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
            </div>
          </div>
          <div class="action-area">            
            <el-button color="#90CAF9" @click="editTravel(item)" :icon="Edit" circle />
            <el-button color="#f8c1c9"  @click="deleteTravel(index)" :icon="Delete" circle />
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
  import ConfirmDialog from '@/components/customtravel/ConfirmDialog.vue'
  import { ElMessage } from 'element-plus'

  const router = useRouter()
  const list = ref([])
  const travelStore = useTravelStore()
  const confirmDialog = ref(null)
  
  onMounted(() => {
  const stored = localStorage.getItem('list')
  if (stored) {
    list.value = JSON.parse(stored)
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
  
  const deleteTravel = async(index) => {
    try{
      await confirmDialog.value.open({
        title:'確認刪除',
        message:'確定要刪除這筆行程嗎?',
      })

      const id = list.value[index].id
      localStorage.removeItem(`activities_${id}`)
      localStorage.removeItem('dailyActivities')
      localStorage.removeItem('travelForm')

      travelStore.clearAll?.()
      list.value.splice(index, 1)
      localStorage.setItem('list', JSON.stringify(list.value))

      ElMessage.success('刪除成功')
    }
    catch{
      ElMessage.info('取消刪除')
    }
  }
  </script>
  
  <style scoped>
  .container {
    padding: 30px;
    background-color: #fcfcfc;
    border-radius: 20px;
    box-shadow: 2px 2px 8px #ccc;
    max-width: 800px;
    height: 600px;
    margin: 0 auto;
    overflow-y: auto;
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
    background-color: #F9FAFB;
  }
  
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .action-area .el-button {
  margin: 0;
  padding: 4px 8px;
}
  
  .action-area {
    width: 60px;
    background-color: #c2bfbfa6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  
  .el-button{
  font-size: 18px;
  height: 36px;
  padding: 6px 12px;
}
  </style>
  