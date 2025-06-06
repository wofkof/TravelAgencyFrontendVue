<template>
  <div class="order-items-summary-card">
    <h2 class="card-title">訂購明細 <span class="unit-label">(單位: 新台幣)</span></h2>

    <div v-for="group in groupedData" :key="group.productName" class="product-group">
      
      <div class="main-product-name">
        商品名稱 - {{ group.productName }}
      </div>

      <el-table :data="group.participants" style="width: 100%" class="details-table" empty-text="暫無訂購項目">
        <el-table-column prop="departureDate" label="出發日期" align="center" width="140" />
        <el-table-column prop="travelerName" label="旅客" align="center" width="120" />
        <el-table-column prop="productAmount" label="商品金額" align="center">
            <template #default="scope">
              <span v-if="typeof scope.row.productAmount === 'number'">
                {{ scope.row.productAmount.toLocaleString() }}
              </span>
              <span v-else>
                {{ scope.row.productAmount }}
              </span>
            </template>
        </el-table-column>
        <el-table-column prop="paymentDeadlineDisplay" label="付款期限" align="center">
          <template #default="scope">
            <span class="deadline-text">{{ scope.row.paymentDeadlineDisplay }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatusDisplay" label="訂單狀態" align="center" />
      </el-table>
    </div>

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
  paymentDeadline: { type: String, default: '' },
  orderStatus: { type: String, default: 'N/A' },
});

const getProductNameFromDescription = (description) => {
  if (!description) return '其他項目';
  const parts = description.split(" - ");
  return parts[0] || description;
};

// 【最終修正】: 大幅簡化 groupedData 的邏輯
const groupedData = computed(() => {
  if (!props.items || props.items.length === 0) {
    return [];
  }

  const groups = new Map();
  const itemToProductMap = new Map();
  
  // 建立從 orderDetailId 到其對應 item 和 productName 的映射
  props.items.forEach(item => {
    const productName = getProductNameFromDescription(item.description);
    itemToProductMap.set(String(item.orderDetailId), { productName, item });
  });
  
  // 遍歷所有旅客
  props.participants.forEach(pax => {
    const productInfo = itemToProductMap.get(String(pax.orderDetailId));
    
    if (productInfo) {
      const { productName, item } = productInfo;

      if (!groups.has(productName)) {
        groups.set(productName, {
          productName: productName,
          participants: [],
        });
      }

      // 【簡化核心】: 無論是什麼商品類型，商品金額永遠直接取自它關聯的訂單明細的 price 欄位。
      // 後端現在已經確保了這個 price 是正確的均攤價。
      const amountToShow = Math.round(item.price) || 0;

      const participantData = {
        departureDate: formatDate(item.startDate),
        travelerName: pax.name,
        productAmount: amountToShow, // 直接使用上面計算的金額
        paymentDeadlineDisplay: paymentDeadlineDisplay.value,
        orderStatusDisplay: orderStatusDisplay.value,
      };

      groups.get(productName).participants.push(participantData);
    } else {
       console.warn(`找不到旅客 ${pax.name} (關聯ID: ${pax.orderDetailId}) 對應的訂單項目。`);
    }
  });

  return Array.from(groups.values());
});

// --- 以下的輔助函數保持不變 ---

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      if (dateString.startsWith('0001-')) return 'N/A';
      return dateString;
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (e) {
    return dateString;
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
    'Completed': '已完成',
    'Cancelled': '已取消',
    'InvoiceFailed': '付款成功但發票失敗',
    'Expired': '已過期',
};

const orderStatusDisplay = computed(() => {
  return orderStatusMap[props.orderStatus] || props.orderStatus;
});

const paymentDeadlineDisplay = computed(() => formatDeadline(props.paymentDeadline));

</script>

<style scoped>
.order-items-summary-card {
  background-color: var(--el-fill-color-blank, #ffffff);
  border: 1px solid var(--el-border-color-light, #e4e7ed);
  border-radius: var(--el-border-radius-base, 4px);
  padding: 20px 24px 24px 24px;
  margin-bottom: 25px;
  box-shadow: var(--el-box-shadow-light, 0 2px 12px 0 rgba(0,0,0,0.1));
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-top: 0;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* 新增：為第一個商品組上方的總標題加一個底線 */
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 20px;
}

.unit-label {
  font-size: 13px;
  font-weight: normal;
  color: var(--el-text-color-secondary);
}

/* 新增：每個商品分組的容器 */
.product-group:not(:last-child) {
  margin-bottom: 24px; /* 每個分組之間的間距 */
}

.main-product-name {
  font-size: 16px;
  color: var(--el-text-color-regular);
  /* 移除舊的 border-bottom，因為現在是每個表格前的標題 */
  margin-bottom: 15px;
  font-weight: 500;
}

.details-table {
  /* 移除舊的 margin-bottom，間距由 product-group 控制 */
}

:deep(.el-table__header-wrapper th) {
  font-weight: 600;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-lighter, #f5f7fa) !important;
}

:deep(.el-table td .cell) {
    color: var(--el-text-color-regular);
}

.deadline-text {
  color: #E6A23C;
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