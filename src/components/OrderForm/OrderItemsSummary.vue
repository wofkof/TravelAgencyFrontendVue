<template>
  <div class="order-items-summary-card">
    <h2 class="card-title">訂購明細 <span class="unit-label">(單位: 新台幣)</span></h2>

    <div v-if="mainProductName" class="main-product-name">
      商品名稱 - {{ mainProductName }}
    </div>

    <el-table :data="tableData" style="width: 100%" class="details-table" empty-text="暫無訂購項目">
      <el-table-column prop="departureDate" label="出發日期" width="140" />
      <el-table-column prop="travelerName" label="旅客" width="120" />
      <el-table-column prop="productAmount" label="商品金額" align="right">
        <template #default="scope">
          {{ scope.row.productAmount.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="pendingAmount" label="未付金額" align="right">
        <template #default="scope">
          {{ scope.row.pendingAmount.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column prop="paymentDeadlineDisplay" label="付款期限" width="180" align="center">
        <template #default="scope">
          <span class="deadline-text">{{ scope.row.paymentDeadlineDisplay }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatusDisplay" label="訂單狀態" width="120" align="center" />
    </el-table>

    <div class="summary-total-amount">
      <span>訂單總金額: </span>
      <span class="total-value">NT$ {{ totalAmount.toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';
import { ElTable, ElTableColumn } from 'element-plus';

const props = defineProps({
  orderNumber: { type: String, default: '' },
  items: { type: Array, default: () => [] }, // OrderDetailItemDto[]
  participants: { type: Array, default: () => [] }, // OrderParticipantDto[]
  totalAmount: { type: Number, default: 0 },
  paymentDeadline: { type: String, default: '' }, // ISO String from expiresAtFromRoute
  orderStatus: { type: String, default: 'N/A' }, // Backend OrderStatus string
});

// 從第一個 item 的 description 中提取主要商品名稱 (不含規格)
const mainProductName = computed(() => {
  if (props.items && props.items.length > 0) {
    const description = props.items[0].description;
    // 簡單地以 " - " 作為分隔符來提取主要名稱，您可以根據實際格式調整
    const parts = description.split(" - ");
    return parts[0] || description;
  }
  return '綜合旅遊商品';
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // 檢查日期是否有效
    if (isNaN(date.getTime())) {
        // 如果是 '0001-01-01T00:00:00' 或類似無效日期，返回 'N/A' 或其他提示
        if (dateString.startsWith('0001-')) return 'N/A';
        return dateString; // 返回原始字串如果無法解析
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (e) {
    return dateString; // 解析失敗則返回原字串
  }
};

const formatDeadline = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
     if (isNaN(date.getTime())) {
        if (dateString.startsWith('0001-')) return 'N/A';
        return dateString;
    }
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return dateString;
  }
};

const orderStatusMap = {
    'Awaiting': '待付款',
    'Processing': '處理中',
    'Confirmed': '已確認',
    'Completed': '已完成',
    'Cancelled': '已取消',
    'Refunded': '已退款',
    'Expired': '已過期',
    'InvoiceFailed': '付款成功但發票失敗',
    // ... 其他您可能有的狀態
};

const orderStatusDisplay = computed(() => {
  return orderStatusMap[props.orderStatus] || props.orderStatus;
});

const paymentDeadlineDisplay = computed(() => formatDeadline(props.paymentDeadline));

// 準備表格數據 (這是簡化版本，假設每個 participant 對應一個主要項目)
// 實際情況可能更複雜，例如每個 participant 的金額可能不同，或一個訂單有多個不同主商品
const tableData = computed(() => {
  if (!props.participants || props.participants.length === 0) {
    // 如果沒有參與者，但有訂單項目，可以考慮顯示訂單項目彙總
    if (props.items && props.items.length > 0) {
      return props.items.map(item => ({
        departureDate: formatDate(item.startDate || props.items[0]?.startDate), // 假設 item 有 startDate
        travelerName: `商品項目 (${item.quantity}份)`, // 或者其他通用描述
        productAmount: item.totalAmount, // 該項目的總金額
        pendingAmount: item.totalAmount, // 假設未付
        paymentDeadlineDisplay: paymentDeadlineDisplay.value,
        orderStatusDisplay: orderStatusDisplay.value,
      }));
    }
    return [];
  }

  // 按參與者顯示 (類似截圖)
  // 這裡假設每個參與者的 "商品金額" 是平均分攤或基於主要產品的單人價格
  // 您的截圖顯示每個參與者都是相同的 39,588，這可能是主要產品的成人價
  // 這裡我們使用訂單總金額除以參與者人數作為一個簡化的示例 "商品金額"
  // 或者，如果 props.items[0] 代表主要產品，可以用 props.items[0].price
  const perParticipantAmount = props.items.length > 0 ? props.items[0].price : (props.totalAmount / props.participants.length);

  return props.participants.map(pax => ({
    // 假設出發日期來自第一個訂單項目 (如果有多個項目，此邏輯需調整)
    departureDate: formatDate(props.items[0]?.startDate || 'N/A'),
    travelerName: pax.name || pax.Name, // 後端回傳的參與者 DTO 中 Name 屬性
    productAmount: Math.round(perParticipantAmount) || 0,
    pendingAmount: Math.round(perParticipantAmount) || 0, // 假設目前都是未付
    paymentDeadlineDisplay: paymentDeadlineDisplay.value,
    orderStatusDisplay: orderStatusDisplay.value,
  }));
});

</script>

<style scoped>
.order-items-summary-card {
  background-color: var(--el-fill-color-blank, #ffffff);
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: var(--el-border-radius-base, 4px);
  padding: 20px 24px 24px 24px; /* 下方padding多一點 */
  margin-bottom: 25px; /* 與下方付款方式區塊的間距 */
  box-shadow: var(--el-box-shadow-light, 0 2px 12px 0 rgba(0,0,0,0.1));
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-top: 0;
  margin-bottom: 8px; /* 標題和單位標籤間距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.unit-label {
  font-size: 13px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
}

.main-product-name {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.details-table {
  margin-bottom: 20px;
}

/* 使表格標頭字體加粗 */
:deep(.el-table__header-wrapper th) {
  font-weight: 600;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-lighter, #f5f7fa) !important; /* 強制背景色 */
}
/* 表格內容文字顏色 */
:deep(.el-table td .cell) {
    color: var(--el-text-color-regular);
}

.deadline-text {
  color: #E6A23C; /* 橙色，與截圖類似 */
  font-weight: 500;
}
.summary-total-amount {
  text-align: right;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.summary-total-amount .total-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-danger);
  margin-left: 8px;
}
</style>