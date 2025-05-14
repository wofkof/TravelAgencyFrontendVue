<template>
    <h1>自訂行程（狀態）</h1>
    <div class="custom-list-container">
      <div
        v-for="(item, index) in travelList"
        :key="index"
        class="travel-card"
      >
        <div class="travel-info">
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
        <div class="status-section">
          <div class="status-bar" :class="statusClass(item.statusText)">
            <span class="status-text">{{ item.statusText }}</span>
          </div>
            <div class="actions">
            <el-icon @click="viewTravel(item.customTravelId)"><View /></el-icon>
            <el-icon v-if="item.statusText === '審核完成'" @click="addToCart(item)" style="cursor: pointer"><ShoppingCart /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { View, ShoppingCart } from '@element-plus/icons-vue'
  import { useCartStore } from '@/stores/ShoppingCart'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'

  const travelList = ref([])
  const router = useRouter()
  const cartStore = useCartStore()
    
  const statusClass = (statusText) => {
    switch (statusText) {
      case '待審核': return 'status-pending'
      case '審核中': return 'status-review'
      case '審核完成': return 'status-success'
      case '已取消': return 'status-cancel'
      default: return ''
    }
  }

onMounted(async () => {
  try {
    const res = await axios.get('https://localhost:7265/api/List')
    travelList.value = res.data.map(item => ({
      customTravelId: item.customTravelId,
      title: item.note || '無標題',
      people: item.people,
      startDate: item.departureDate,
      endDate: item.endDate,
      days: item.days,
      statusText: item.statusText,
      daterange: [item.departureDate, item.endDate]
    }))
  } catch (error) {
    console.error('載入資料失敗:', error)
  }
})

const viewTravel = (id) =>{
  router.push({ name:'CustomtravelStatusContent',params:{id}})
}

const addToCart = (item) => {
  if (!cartStore.cartItems.some(x => x.customTravelId === item.customTravelId)) {
    cartStore.addItem(item)
    ElMessage.success('已加入購物車')
  } else {
    ElMessage.warning('此行程已在購物車中')
  }
}
  </script>
  
  <style scoped>
  .custom-list-container {
    background-color: #71b2d879;
    padding: 30px;
    border-radius: 25px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  h1 {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .travel-card {
    display: flex;
    align-items: stretch;
    background-color: #f0f8dc;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 2px 2px 8px #ccc;
    overflow: hidden;
  }
  
  .travel-info {
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
  
  .status-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100px;
    border-left: 1px solid #ccc;
    border-radius: 0 10px 10px 0;
    overflow: hidden;
  }
  
  .status-bar {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    writing-mode: vertical-rl;
    font-weight: bold;
    color: #000;
  }
  
  .status-text {
    writing-mode: vertical-rl;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }
  
  .actions { 
    flex: 1;
    background-color: #e3effd;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  .status-pending {
    background-color: #f7b267;
  }
  .status-review {
    background-color: #f7d674;
  }
  .status-success {
    background-color: #f4e04d;
  }
  .status-cancel {
    background-color: #f26c63;
  }
  </style>
  