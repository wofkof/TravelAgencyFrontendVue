<template>
  <div class="order-items-display">
    <el-empty v-if="!items || items.length === 0" description="沒有選擇任何商品。" :image-size="80" />

    <div v-else>
      <ul class="order-summary-list">
        <li v-for="item in items" :key="item.id" class="order-summary-item detailed-item">
          <div class="item-main-info">
            <el-image
              v-if="item.imageUrl"
              :src="item.imageUrl"
              fit="cover"
              class="item-image"
            />
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-date-range" v-if="item.startDate && item.endDate">
                <el-icon><Calendar /></el-icon>
                {{ item.startDate }} {{ item.startDayOfWeek ? `(${item.startDayOfWeek})` : '' }} ~
                {{ item.endDate }} {{ item.endDayOfWeek ? `(${item.endDayOfWeek})` : '' }}
                共 {{ item.totalDays }} 天
              </p>
              <p v-if="getDisplayPeopleCount(item)" class="item-people-info">
                <el-icon><User /></el-icon>
                參與人數：{{ getDisplayPeopleCount(item) }}
              </p>
              <p v-if="item.productType === 'GroupTravel' && item.productSpecificData?.internalCode" class="item-group-code">
                團號：{{ item.productSpecificData.internalCode }}
              </p>
            </div>
          </div>

          <div v-if="item.flights" class="item-section flight-info">
            <h4>參考航班</h4>
            </div>

          <div v-if="item.accommodation?.description" class="item-section accommodation-info">
            <h4>參考住宿</h4>
            <p>{{ item.accommodation.description }}</p>
            </div>

          <div v-if="item.productType === 'CustomTravel' && item.productSpecificData?.dailyActivities?.length > 0" class="item-section daily-activities-info">
            <h4>行程活動摘要</h4>
            <ul>
              <li v-for="activity in item.productSpecificData.dailyActivities.slice(0, 3)" :key="activity.day + activity.time + activity.itemId">
                 D{{ activity.day }} {{ activity.time }}: {{ activity.itemId }} ({{activity.category}}) {{ activity.accommodationName ? `- 宿: ${activity.accommodationName}` : ''}}
              </li>
              <li v-if="item.productSpecificData.dailyActivities.length > 3">...等更多活動</li>
            </ul>
          </div>

          <el-collapse v-model="activeItemCollapse[item.id]" class="item-pricing-collapse">
            <el-collapse-item name="details">
              <template #title>
                {{ activeItemCollapse[item.id] && activeItemCollapse[item.id].includes('details') ? '收合訂單明細' : '展開訂單明細' }}
                <span class="item-total-price-preview">
                  總計: NT$ {{ calculateItemSubtotal(item)?.toLocaleString() }}
                </span>
              </template>
              <div class="item-options-summary-wrapper">
                <div v-if="item.options && item.options.length > 0" class="item-options-summary">
                  <div v-for="option in item.options.filter(o => o.quantity > 0)" :key="option.type" class="option-detail">
                    <span>{{ option.type }} {{ option.unitLabel ? `(${option.unitLabel})` : '' }} x {{ option.quantity }}</span>
                    <span>NT$ {{ option.price?.toLocaleString() }}</span>
                    <span>小計: NT$ {{ (option.price * option.quantity)?.toLocaleString() }}</span>
                  </div>
                </div>
                <div v-else-if="item.quantity !== undefined && item.pricePerUnit !== undefined" class="item-simple-summary">
                  <span>數量: {{ item.quantity }}</span>
                  <span>單價: NT$ {{ item.pricePerUnit?.toLocaleString() }}</span>
                </div>
                <div class="item-total-price">
                  <strong>總計: NT$ {{ calculateItemSubtotal(item)?.toLocaleString() }}</strong>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, computed, watch } from 'vue';
// Props 保持不變
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
});

// 用於控制每個商品明細的展開/收合狀態
const activeItemCollapse = ref({});

// 使用 watch 來初始化或更新 activeItemCollapse
watch(() => props.items, (newItems) => {
  if (newItems) { // 確保 newItems 不是 undefined
    newItems.forEach(item => {
      if (item && item.id && activeItemCollapse.value[item.id] === undefined) { // 確保 item 和 item.id 有效
        activeItemCollapse.value[item.id] = []; // 預設收合
      }
    });
  }
}, { immediate: true, deep: true });


// 計算小計的方法
const calculateItemSubtotal = (item) => {
  if (!item) return 0; // 防禦性程式碼
  if (item.options && item.options.length > 0) {
    // 對於 CustomTravel，其 options[0].price 已經是總價
    // 對於 GroupTravel，需要累加 options
    // 你的 store 範例中，CustomTravel 的 options[0].price 是總價，quantity 是 1
    // GroupTravel 的 options 每個都有 price 和 quantity
    return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
  } else if (item.totalPrice !== undefined) { 
    return item.totalPrice;
  } else if (item.quantity !== undefined && item.pricePerUnit !== undefined) {
    return item.pricePerUnit * item.quantity;
  }
  return 0;
};

// 【新增】👇 獲取用於顯示的參與人數描述
const getDisplayPeopleCount = (item) => {
  if (!item) return '';
  if (item.productType === 'CustomTravel') {
    return item.productSpecificData?.people ? `${item.productSpecificData.people} 人` : '';
  } else if (item.productType === 'GroupTravel') {
    if (item.options && item.options.length > 0) {
      const totalParticipants = item.options.reduce((sum, opt) => sum + (Number(opt.quantity) || 0), 0);
      if (totalParticipants > 0) {
        const details = item.options
          .filter(opt => opt.quantity > 0)
          .map(opt => `${opt.type}：${opt.quantity}`)
          .join('、');
        return `${totalParticipants} 人 (${details})`;
      }
    }
  }
  return ''; // 如果無法確定，返回空字串
};

// 如果需要從 options 動態生成住宿人數描述
const generateOccupancyFromOptions = (options) => {
  if (!options) return '';
  return options
    .filter(opt => opt.quantity > 0 && opt.unitLabel)
    .map(opt => `${opt.unitLabel} X ${opt.quantity}`)
    .join(', ');
};

</script>

<style scoped>
/* --- 您需要添加新的樣式 --- */
.detailed-item {
  display: flex;
  flex-direction: column; /* 讓各區塊垂直排列 */
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.detailed-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.item-main-info {
  display: flex;
  gap: 15px; /* 圖片和文字間的距離 */
  margin-bottom: 15px;
}

.item-image {
  width: 120px; /* 調整圖片大小 */
  height: 90px; /* 調整圖片大小 */
  border-radius: 4px;
  flex-shrink: 0; /* 防止圖片被壓縮 */
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中文字內容 */
}

.item-details h3 {
  font-size: 1.1em; /* 調整標題大小 */
  color: var(--el-text-color-primary);
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.item-date-range {
  font-size: 0.9em;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
}
.item-date-range .el-icon {
  font-size: 1.1em;
}

.item-section {
  background-color: #f9f9f9; /* 給區塊一個淺底色 */
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  border: 1px solid var(--el-border-color-extra-light, #f2f6fc);
}
.item-section h4 {
  font-size: 1em;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 10px 0;
}
.item-section p {
  font-size: 0.9em;
  color: var(--el-text-color-regular);
  margin: 0 0 5px 0;
  line-height: 1.5;
}

.flight-info .flight-leg {
  display: grid; /* 使用 grid 方便對齊 */
  grid-template-columns: auto 1fr auto auto auto auto; /* 調整列的分配 */
  gap: 8px 12px; /* 行間距 列間距 */
  align-items: center;
  font-size: 0.85em;
  padding: 5px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter, #ebeef5);
}
.flight-info .flight-leg:last-child {
  border-bottom: none;
}
.flight-info .flight-leg span:nth-child(1) { /* 去程/回程 標籤 */
  font-weight: bold;
  color: var(--el-color-primary);
}


/* 折疊區域樣式 */
.item-pricing-collapse {
  border: none; /* 移除 el-collapse 自身邊框 */
  margin-top: 10px;
}
.item-pricing-collapse :deep(.el-collapse-item__header) {
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  font-size: 0.95em;
  font-weight: 500;
  justify-content: space-between; /* 讓標題和價格預覽分開 */
}
.item-pricing-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
.item-pricing-collapse :deep(.el-collapse-item__content) {
  padding-top: 15px;
  padding-bottom: 5px;
}
.item-total-price-preview {
  font-weight: bold;
  font-size: 1em;
  color: var(--el-color-error); /* 強調價格 */
}


/* 原本的選項和價格樣式，可能需要微調 */
.item-options-summary-wrapper {
  /* padding: 10px; */
}
.option-detail {
  display: grid; /* 改用 grid 以便對齊多列 */
  grid-template-columns: repeat(3, auto); /* 三列，自動寬度 */
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px dotted var(--el-border-color-extra-light, #f2f6fc);
  font-size: 0.9em;
}
.option-detail:last-child{
  border-bottom: none;
}
.option-detail span {
  color: var(--el-text-color-secondary);
}
.option-detail span:first-child {
  color: var(--el-text-color-regular);
}


.item-total-price { /* 總計 */
  text-align: right;
  font-weight: 600;
  margin-top: 10px;
  font-size: 1.1em;
  color: var(--el-text-color-primary);
}

/* 您原有的樣式可以保留或根據新佈局調整 */
.order-items-display {
  padding: 0 5px;
}
.order-summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
/* .item-info, .item-simple-summary 等舊樣式可能不再完全適用，或需要整合到新結構中 */
</style>