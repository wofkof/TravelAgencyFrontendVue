<template>
  <div class="bg-white p-6 rounded shadow">
    <h2 class="text-xl font-bold mb-4">歷史訂單查詢</h2>

    <div v-if="orders.length === 0 && loaded" class="text-gray-500">查無訂單資料</div>

    <div v-else>
      <table class="w-full border text-sm">
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
            <tr v-if="expandedOrderId === order.orderId" class="detail-row">
              <td colspan="4" class="bg-gray-50 px-6 py-4 text-sm text-gray-700 text-left border-t border-gray-200">
                <div v-if="expandedOrderDetail" class="space-y-6 leading-6">
                  <div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">📌 行程相關資訊</h3>
                    <p><strong>行程名稱：</strong>{{ expandedOrderDetail.description }}</p>
                    <p><strong>出發日期：</strong>{{ formatDate(expandedOrderDetail.startDate) }}</p>
                    <p><strong>結束日期：</strong>{{ formatDate(expandedOrderDetail.endDate) }}</p>
                    <p><strong>人數：</strong>{{ expandedOrderDetail.totalPeople }} 人（成人：{{ expandedOrderDetail.adultCount }}、兒童：{{ expandedOrderDetail.childCount }}）</p>
                  </div>

                  <div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">👤 訂購人與旅客資訊</h3>
                    <p><strong>訂購人：</strong>{{ expandedOrderDetail.ordererName }}（{{ expandedOrderDetail.ordererPhone }} / {{ expandedOrderDetail.ordererEmail }}）</p>
                    <p><strong>備註：</strong>{{ expandedOrderDetail.note || '無' }}</p>
                    <ul class="list-disc pl-6">
                      <li v-for="(t, index) in expandedOrderDetail.participants" :key="index">
                        {{ t.name }}（{{ formatDate(t.birthDate) }}）
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 class="text-base font-semibold text-gray-800 mb-2">💳 付款與發票資訊</h3>
                    <p><strong>付款方式：</strong>{{ expandedOrderDetail.paymentMethod }}</p>
                    <p><strong>付款狀態：</strong>{{ expandedOrderDetail.status }}</p>
                    <p><strong>付款時間：</strong>{{ formatDate(expandedOrderDetail.createdAt) }}</p>
                    <p><strong>總金額：</strong>{{ expandedOrderDetail.totalAmount }} 元</p>
                    <p v-if="expandedOrderDetail.invoice">
                      <strong>發票號碼：</strong>{{ expandedOrderDetail.invoice.invoiceNumber }}<br />
                      <strong>發票狀態：</strong>{{ expandedOrderDetail.invoice.invoiceStatus }}<br />
                      <strong>發票類型：</strong>{{ expandedOrderDetail.invoice.invoiceType }}<br />
                      <strong>買受人：</strong>{{ expandedOrderDetail.invoice.buyerName }}（{{ expandedOrderDetail.invoice.buyerUniformNumber || '無統編' }}）<br />
                      <strong>發票金額：</strong>{{ expandedOrderDetail.invoice.totalAmount }} 元<br />
                      <strong>開立時間：</strong>{{ formatDate(expandedOrderDetail.invoice.createdAt) }}<br />
                    </p>
                    <p v-else><strong>發票號碼：</strong>未開立</p>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed} from 'vue'
import api from '@/utils/api'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()

const orders = ref([])
const expandedOrderId = ref(null)
const expandedOrderDetail = ref(null)
const loaded = ref(false)

const memberId = computed(() => authStore.memberId)

const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '—'

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
onMounted(async () => {
  if (!memberId.value) {
  console.warn('無法取得會員ID，未登入或 Pinia 尚未初始化')
  return
}
  try {
    const res = await api.get(`/OrderHistory/list/${memberId.value}`)
    orders.value = res.data
  } catch (err) {
    console.error('取得歷史訂單失敗:', err)
  } finally {
    loaded.value = true
  }
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
