<template>
  <div class="order-items-summary-card">
    <h2 class="card-title">訂購明細 <span class="unit-label">(單位: 新台幣)</span></h2>

    <div v-if="mainProductName" class="main-product-name">
      商品名稱 - {{ mainProductName }}
    </div>

    <el-table :data="tableData" style="width: 100%" class="details-table" empty-text="暫無訂購項目">
      <el-table-column prop="departureDate" label="出發日期" align="center" width="140" />
      <el-table-column prop="travelerName" label="旅客" align="center" width="120" />
      <el-table-column prop="productAmount" label="商品金額" align="center">
        <template #default="scope">
          {{ scope.row.productAmount.toLocaleString() }}
        </template>
      </el-table-column>
      <!-- <el-table-column prop="pendingAmount" label="未付金額" align="right">
        <template #default="scope">
          {{ scope.row.pendingAmount.toLocaleString() }}
        </template>
      </el-table-column> -->
      <el-table-column prop="paymentDeadlineDisplay" label="付款期限" align="center">
        <template #default="scope">
          <span class="deadline-text">{{ scope.row.paymentDeadlineDisplay }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderStatusDisplay" label="訂單狀態"align="center" />
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
    'Completed': '已完成',
    'Cancelled': '已取消',
    'InvoiceFailed': '付款成功但發票失敗',
    'Expired': '已過期',
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
        travelerName: `${item.description || '商品項目'} (${item.quantity}份)`, // 或者其他通用描述
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

  return props.participants.map(pax => {
    // 假設:
    // 1. 參與者物件 (pax) 有一個屬性 (例如 `orderDetailId` 或 `OrderDetailID`) 可以用來關聯到 `props.items` 中的某個項目。
    // 2. 訂單明細項目物件 (item in props.items) 也有一個對應的ID屬性 (例如 `orderDetailId` 或 `OrderDetailID`)。
    // 3. 訂單明細項目物件 (item) 中的 `price` 屬性是該類型參與者的單人價格。
    //    (注意：API返回的 OrderDetailItemDto 中的 `price` 通常是單價, `totalAmount` 是 `price * quantity`)

    // 嘗試找到與當前參與者 (pax) 關聯的訂單明細項目 (item)
    // 請確認您的 Participant DTO 和 OrderDetailItem DTO 中用於關聯的ID欄位名稱是否確實是 `orderDetailId` (小寫d)
    const linkedItem = props.items.find(
      item => String(item.orderDetailId) === String(pax.orderDetailId)
    );

    let participantAmount = 0;
    let departureDateForItem = formatDate(props.items[0]?.startDate || 'N/A'); // 預設出發日期

    if (linkedItem) {
      // 從關聯到的 item 中獲取單價
      // 如果 linkedItem.price 是該參與者類型的單價，則直接使用
      // 如果 linkedItem 代表的是一組相同類型參與者的總和 (例如2個成人)，則需要進一步處理
      // 但從您的截圖來看，每個明細項目似乎對應一個價格類型 ("成人", "兒童", "嬰兒") 且數量為1
      // 所以，linkedItem.price 應該就是這位參與者的價格
      participantAmount = linkedItem.price;
      departureDateForItem = formatDate(linkedItem.startDate || props.items[0]?.startDate); // 使用關聯項目的出發日期
    } else {
      // 如果找不到關聯項目，這可能表示數據結構或關聯邏輯有問題
      // 您可以在控制台打印警告，以幫助調試
      console.warn(
        `OrderItemsSummary: 找不到參與者 ${pax.name} (ID: ${pax.id}, 關聯 OrderDetailID: ${pax.orderDetailId}) 對應的訂單項目。請檢查資料完整性和關聯鍵。可用項目 OrderDetailIDs: ${props.items.map(i => i.orderDetailId).join(', ')}`
      );
      // 此時 participantAmount 會是 0，您可能需要根據業務邏輯決定如何處理這種情況
    }

    return {
      // 假設出發日期來自第一個訂單項目 (如果有多個項目，此邏輯需調整)
      departureDate: departureDateForItem,
      travelerName: pax.name || pax.Name, // 從 Participant DTO 獲取旅客姓名
      productAmount: Math.round(participantAmount) || 0,
      pendingAmount: Math.round(participantAmount) || 0, // 假設未付金額與商品金額相同
      paymentDeadlineDisplay: paymentDeadlineDisplay.value,
      orderStatusDisplay: orderStatusDisplay.value,
    };
  });
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