<template>
  <div class="bg-white p-6 rounded shadow">
    <h2 class="text-xl font-bold mb-4">訂單管理</h2>

    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabChange">
      <!-- 即將到來 -->
      <el-tab-pane label="即將到來" name="Awaiting">
        <div v-if="orders.length === 0 && loaded" class="text-gray-500 mt-4">查無訂單資料</div>
        <div v-else>
          <table class="w-full border text-sm mt-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 border">訂單編號</th>
                <th class="px-4 py-2 border">訂單日期</th>
                <th class="px-4 py-2 border">行程名稱</th>
                <th class="px-4 py-2 border">訂單細節</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="order in orders" :key="order.orderId">
                 <tr>
                  <td class="px-4 py-2 border text-center">{{ order.orderId }}</td>
                  <td class="px-4 py-2 border text-center">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-4 py-2 border text-center">{{ order.description }}</td>
                  <td class="px-4 py-2 border text-center">
                    <button
                      @click="toggleExpanded(order.orderId)"
                      class="text-blue-600 hover:underline"
                    >
                      {{ expandedOrderId === order.orderId ? '收合詳情' : '查看詳情' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="expandedOrderId === order.orderId" :key="order.orderId + '-detail'" class="detail-row">
                  <td colspan="4" class="bg-gray-50 px-6 py-4 text-sm text-gray-700 text-left border-t border-gray-200">
                    <OrderDetail :detail="expandedOrderDetail" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </el-tab-pane>

      <!-- 已完成 -->
      <el-tab-pane label="已完成" name="Completed">
        <div v-if="orders.length === 0 && loaded" class="text-gray-500 mt-4">查無訂單資料</div>
        <div v-else>
          <table class="w-full border text-sm mt-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 border">訂單編號</th>
                <th class="px-4 py-2 border">訂單日期</th>
                <th class="px-4 py-2 border">行程名稱</th>
                <th class="px-4 py-2 border">訂單細節</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="order in orders" :key="order.orderId">
                <tr>
                  <td class="px-4 py-2 border text-center">{{ order.orderId }}</td>
                  <td class="px-4 py-2 border text-center">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-4 py-2 border text-center">{{ order.description }}</td>
                  <td class="px-4 py-2 border text-center">
                    <button
                      @click="toggleExpanded(order.orderId)"
                      class="text-blue-600 hover:underline"
                    >
                      {{ expandedOrderId === order.orderId ? '收合詳情' : '查看詳情' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="expandedOrderId === order.orderId" :key="order.orderId + '-detail'" class="detail-row">
                  <td colspan="4" class="bg-gray-50 px-6 py-4 text-sm text-gray-700 text-left border-t border-gray-200">
                    <OrderDetail :detail="expandedOrderDetail" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </el-tab-pane>

      <!-- 已取消 -->
      <el-tab-pane label="已取消" name="Cancelled">
        <div v-if="orders.length === 0 && loaded" class="text-gray-500 mt-4">查無訂單資料</div>
        <div v-else>
          <table class="w-full border text-sm mt-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 border">訂單編號</th>
                <th class="px-4 py-2 border">訂單日期</th>
                <th class="px-4 py-2 border">行程名稱</th>
                <th class="px-4 py-2 border">訂單細節</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="order in orders" :key="order.orderId">
                <tr>
                  <td class="px-4 py-2 border text-center">{{ order.orderId }}</td>
                  <td class="px-4 py-2 border text-center">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-4 py-2 border text-center">{{ order.description }}</td>
                  <td class="px-4 py-2 border text-center">
                    <button
                      @click="toggleExpanded(order.orderId)"
                      class="text-blue-600 hover:underline"
                    >
                      {{ expandedOrderId === order.orderId ? '收合詳情' : '查看詳情' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="expandedOrderId === order.orderId" :key="order.orderId + '-detail'" class="detail-row">
                  <td colspan="4" class="bg-gray-50 px-6 py-4 text-sm text-gray-700 text-left border-t border-gray-200">
                    <OrderDetail :detail="expandedOrderDetail" />
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/api'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/authStore'
import OrderDetail from './OrderDetail.vue'
const authStore = useAuthStore()
const memberId = computed(() => authStore.memberId)

// 狀態選擇與對應 map
const activeTab = ref('Completed') // 預設載入已完成訂單
const statusMap = {
  'Completed': ['Completed'],
  'Awaiting': ['Awaiting'],
  'Cancelled': ['Cancelled', 'Expired']
}

// 資料與 UI 狀態
const orders = ref([])
const expandedOrderId = ref(null)
const expandedOrderDetail = ref(null)
const loaded = ref(false)

// 日期格式
const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '—'

// 展開訂單詳細資料
const toggleExpanded = async (orderId) => {
  if (expandedOrderId.value === orderId) {
    expandedOrderId.value = null
    expandedOrderDetail.value = null
    return
  }
  try {
    const res = await api.get(`/OrderHistory/detail/${orderId}`)
    expandedOrderDetail.value = res.data
    expandedOrderId.value = orderId
  } catch (err) {
    console.error('取得訂單詳情失敗', err)
  }
}

// 撈取對應狀態的訂單
const fetchOrders = async () => {
  if (!memberId.value) {
    console.warn('無法取得會員ID，未登入或 Pinia 尚未初始化')
    return
  }

  loaded.value = false
  try {
    const statuses = statusMap[activeTab.value]
const queryString = `statuses=${statuses.map(s => encodeURIComponent(s)).join(',')}`
const url = `/OrderHistory/list/${memberId.value}?${queryString}`
const res = await api.get(url)

    orders.value = res.data
  } catch (err) {
    console.error('取得訂單管理失敗:', err)
    orders.value = []
  } finally {
    loaded.value = true
    expandedOrderId.value = null
    expandedOrderDetail.value = null
  }
}

// 切換 tab 時觸發
const handleTabChange = (tab) => {
  const newStatuses = statusMap[tab.props.name]
  if (!newStatuses) return
  fetchOrdersByStatuses(newStatuses)
}
const fetchOrdersByStatuses = async (statuses) => {
  if (!memberId.value) {
    console.warn('無法取得會員ID')
    return
  }

  loaded.value = false
  try {
    const queryString = statuses.map(s => `statuses=${encodeURIComponent(s)}`).join('&')
    const url = `/OrderHistory/list/${memberId.value}?${queryString}`
    const res = await api.get(url)
    orders.value = res.data
  } catch (err) {
    console.error('取得訂單管理失敗:', err)
    orders.value = []
  } finally {
    loaded.value = true
    expandedOrderId.value = null
    expandedOrderDetail.value = null
  }
}
onMounted(() => {
  const defaultStatuses = statusMap[activeTab.value]
  fetchOrdersByStatuses(defaultStatuses)
})

</script>


<style scoped>
thead th,
tbody > tr:not(.detail-row) > td {
  text-align: center;
}
.detail-row td {
  text-align: left;
  background-color: #f9fafb;
  padding: 1.25rem;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}
</style>
