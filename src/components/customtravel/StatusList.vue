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
              <el-button color="#E3F2FD" @click="viewTravel(item.customTravelId)" :icon="View" circle />         
              <el-button v-if="item.statusText === '已通過'" color="#E3F2FD" @click="addToCart(item)" style="cursor: pointer" :icon="ShoppingCart" circle />               
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
  import api from '@/utils/api'
  import { useAuthStore } from '@/stores/authStore'
  const authStore = useAuthStore() 
  const travelList = ref([])
  const router = useRouter()
  const cartStore = useCartStore()
    
  const statusClass = (statusText) => {
    switch (statusText) {
      case '待審核': return 'status-pending'
      case '已通過': return 'status-review'
      case '已完成': return 'status-success'
      case '已取消': return 'status-cancel'
      default: return ''
    }
  }

onMounted(async () => {
  try {
    const memberId = authStore.memberId // ✅ 從 Pinia 拿 memberId
    if (!memberId) {
      throw new Error("尚未登入，無法載入資料")
    }
    const res = await api.get(`/List?memberId=${memberId}`)
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

const emit = defineEmits(['view-detail'])
const viewTravel = (id) =>{
  emit('view-detail', id)
}

const addToCart = (item) => {
  console.log("目前購物車：", cartStore.activeItems.map(x => x.productId))
  console.log("嘗試加入：", item.customTravelId)
  if (!cartStore.activeItems.some(x => x.productId === item.customTravelId)) {
    cartStore.addItem(item)
    ElMessage.success('已加入購物車')
  } else {
    ElMessage.warning('此行程已在購物車中')
  }
}
  </script>
  
  <style scoped>
  .custom-list-container {
    padding: 30px;
    border-radius: 25px;
    max-width: 800px;
    height: 600px;
    margin: 0 auto;
    overflow-y: auto;
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
    background-color: #F9FAFB;
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

  .actions .el-button {
  margin: 0;
  padding: 4px 8px;
}
  
  .actions { 
    flex: 1;
    background-color: #c2bfbfa6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 15px;
  }
  
  .status-pending {
    background-color: #FFF3CD;
  }
  .status-review {
    background-color: #FFE082;
  }
  .status-success {
    background-color: #C8E6C9;
  }
  .status-cancel {
    background-color: #FFCDD2;
  }
  </style>
  