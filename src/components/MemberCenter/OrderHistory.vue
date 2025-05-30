<template>
  <div class="bg-white p-6 rounded shadow">
    <h2 class="text-xl font-bold mb-4">訂單管理</h2>

    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabChange">
      <el-tab-pane label="即將到來" name="Awaiting">
        <div v-if="orders.length === 0 && loaded" class="text-gray-500 mt-4">查無訂單資料</div>
        <div v-else>
          <table class="w-full border text-sm mt-4">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-2 border">訂單編號</th>
                <th class="px-4 py-2 border">訂單日期</th>
                <th class="px-4 py-2 border">行程名稱</th>
                <th v-if="activeTab === 'Awaiting'" class="px-4 py-2 border">付款狀態與操作</th>
                <th class="px-4 py-2 border">訂單細節</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="order in orders" :key="order.orderId">
                <tr>
                  <td class="px-4 py-2 border text-center">{{ order.orderId }}</td>
                  <td class="px-4 py-2 border text-center">{{ formatDate(order.createdAt) }}</td>
                  <td class="px-4 py-2 border text-center">{{ order.description }}</td>
                  <td v-if="activeTab === 'Awaiting'" class="px-4 py-2 border text-center align-middle">
                    <AwaitingOrderActionCell 
                    :order="order"
                    @order-visually-expired="handleOrderVisuallyExpired"  
                    />
                  </td>
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
                  <td
                    :colspan="activeTab === 'Awaiting' ? 5 : 4"
                    class="bg-gray-50 px-6 py-4 text-sm text-gray-700 text-left border-t border-gray-200"
                  >
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
import { ref, onMounted, computed, watch, onActivated } from 'vue';
import api from '@/utils/api';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/authStore';
import OrderDetail from './OrderDetail.vue';
import { debounce } from 'lodash-es';
import AwaitingOrderActionCell from '@/components/tools/AwaitingOrderActionCell.vue'; //柏亦新增

const authStore = useAuthStore();
const memberId = computed(() => authStore.memberId);

// 狀態選擇與對應 map
const activeTab = ref('Awaiting'); // 預設顯示 "即將到來" 以便測試
const statusMap = {
  'Completed': ['Completed'],
  'Awaiting': ['Awaiting'],
  'Cancelled': ['Cancelled', 'Expired']
};

// 資料與 UI 狀態
const orders = ref([]);
const expandedOrderId = ref(null);
const expandedOrderDetail = ref(null);
const loaded = ref(false);

// 日期格式
const formatDate = (dateStr) => dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '—';

// 展開訂單詳細資料
const toggleExpanded = async (orderId) => {
  if (expandedOrderId.value === orderId) {
    expandedOrderId.value = null;
    expandedOrderDetail.value = null;
    return;
  }
  try {
    const res = await api.get(`/OrderHistory/detail/${orderId}`);
    expandedOrderDetail.value = res.data;
    expandedOrderId.value = orderId;
  } catch (err) {
    console.error('取得訂單詳情失敗', err);
  }
};

const handleTabChange = (tab) => {
  const newStatuses = statusMap[tab.props.name];
  if (!newStatuses) return;
  activeTab.value = tab.props.name; // 切換分頁前先更新 activeTab
  fetchOrdersByStatuses(newStatuses);
};

  // 確保當前仍在 "即將到來" 分頁
const debouncedFetchAwaitingOrders = debounce(() => {
  if (activeTab.value === 'Awaiting') {
    console.log("Debounced: Fetching Awaiting orders...");
    fetchOrdersByStatuses(statusMap['Awaiting']);
  }
}, 1500);

const handleOrderVisuallyExpired = (expiredOrderId) => {
  console.log(`Order ${expiredOrderId} visually expired. Queueing debounced refresh for 'Awaiting' orders.`);
  // 調用 debounced 函數而不是直接 fetch
  debouncedFetchAwaitingOrders();
};

// 撈取對應狀態的訂單
const fetchOrdersByStatuses = async (statuses) => {
  if (!memberId.value) {
    console.warn('無法取得會員ID');
    orders.value = [];
    loaded.value = true;
    return;
  }

  loaded.value = false;
  expandedOrderId.value = null;
  expandedOrderDetail.value = null;

  try {
    const queryString = statuses.map(s => `statuses=${encodeURIComponent(s)}`).join('&');
    const url = `/OrderHistory/list/${memberId.value}?${queryString}`;
    const res = await api.get(url);
    orders.value = res.data;
    console.log('OrderHistory fetched orders:', JSON.parse(JSON.stringify(orders.value))); // 深入打印
  } catch (err) {
    console.error(`取得訂單列表 (狀態: ${statuses.join(',')}) 失敗:`, err);
    orders.value = [];
  } finally {
    loaded.value = true;
  }
};

onMounted(() => {
  if (authStore.isLoggedIn && memberId.value) {
      const defaultStatuses = statusMap[activeTab.value];
      fetchOrdersByStatuses(defaultStatuses);
  } else {
      const unwatch = watch(() => authStore.memberId, (newMemberId) => {
          if (newMemberId) {
              const defaultStatuses = statusMap[activeTab.value];
              fetchOrdersByStatuses(defaultStatuses);
              unwatch();
          }
      }, { immediate: true });

      if (!memberId.value && !authStore.isLoggedIn) { // 避免 immediate:true 時立即執行 fetch (如果 memberId 初始為 null)
          console.warn("OrderHistory: MemberId 未準備好，將在 memberId 可用時獲取訂單。");
          // 如果希望在 memberId 仍為 null 時顯示空狀態而不是持續載入
          // loaded.value = true;
          // orders.value = [];
      }
  }
});

onActivated(() => {
  console.log('OrderManagement component activated.');
  if (authStore.isLoggedIn && memberId.value) {
    const currentStatuses = statusMap[activeTab.value];
    if (currentStatuses) {
      fetchOrdersByStatuses(currentStatuses); // 刷新當前分頁的數據
    }
  }
});
</script>

<style scoped>
thead th,
tbody > tr:not(.detail-row) > td {
  text-align: center;
  vertical-align: middle; /* 使儲存格內容垂直居中 */
}
.detail-row td {
  text-align: left;
  background-color: #f9fafb;
  padding: 1.25rem;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}
.align-middle {
  vertical-align: middle;
}
</style>