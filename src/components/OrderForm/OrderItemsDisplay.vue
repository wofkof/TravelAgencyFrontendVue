<template>
  <div class="order-items-display">
    <el-empty v-if="!items || items.length === 0" description="沒有選擇任何商品。" :image-size="80" />

    <div v-else>
      <ul class="order-summary-list">
        <li v-for="item in items" :key="item.id" class="order-summary-item">
          <div class="item-info">
            <strong>{{ item.name }}</strong>
            <span v-if="item.category"> ({{ item.category }})</span>
            <div v-if="item.options && item.options.length > 0" class="item-options-summary">
              <span v-for="option in item.options.filter(o => o.quantity > 0)" :key="option.type" class="option-detail">
                {{ option.type }} x {{ option.quantity }} NT$ {{ option.price?.toLocaleString() }}
              </span>
            </div>
            <div v-else-if="item.quantity !== undefined && item.pricePerUnit !== undefined" class="item-simple-summary">
              <span>數量: {{ item.quantity }} NT$ {{ item.pricePerUnit?.toLocaleString() }}</span>
            </div>
          </div>
          <div class="item-total-price">
            小計: NT$ {{ calculateItemSubtotal(item)?.toLocaleString() }}
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
// import { ElEmpty } from 'element-plus'; // 如果未全域註冊，需要導入

// 定義 props (保持不變)
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
});

// 計算小計的方法 (保持不變)
const calculateItemSubtotal = (item) => {
  if (item.options && item.options.length > 0) {
    return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
  } else if (item.quantity !== undefined && item.pricePerUnit !== undefined) {
    return item.pricePerUnit * item.quantity;
  }
  return 0;
};
</script>

<style scoped>
/* --- 恢復您原本提供的樣式，並稍作調整以使用 Element Plus 變數 --- */

.order-items-display {
  /* 可以保留或移除外層 padding，看 AccordionSection/el-collapse-item 的設定 */
   padding: 0 5px; /* 左右稍微留點空間 */
}

/* 如果您還需要標題的話 */
h3 {
  margin-top: 0; /* 確保與 el-collapse-item 的 header 有間距 */
  margin-bottom: 15px;
  font-size: 1.1em;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.order-summary-list {
  list-style: none;
  padding: 0;
  margin: 0; /* 移除 ul 預設 margin */
}

.order-summary-item {
  display: flex;
  justify-content: space-between; /* 左右分開 */
  align-items: flex-start; /* 頂部對齊 */
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5); /* 使用 Element Plus 邊框色 */
  padding: 12px 0; /* 上下邊距 */
}
/* 最後一個項目移除底部分隔線 */
.order-summary-item:last-child {
  border-bottom: none;
}

.item-info {
  flex-grow: 1; /* 佔據左側空間 */
  margin-right: 20px; /* 與右側小計的間距 */
}

.item-info strong { /* 商品名稱 */
  font-size: var(--el-font-size-base); /* 使用 Element Plus 基礎字號 */
  color: var(--el-text-color-primary);
  font-weight: 500; /* 中等粗細 */
  line-height: 1.5; /* 增加行高 */
}

.item-info > span { /* 分類 */
  font-size: var(--el-font-size-small);
  color: var(--el-text-color-secondary);
  margin-left: 5px;
}

.item-options-summary,
.item-simple-summary {
  font-size: 0.9em; /* 選項/數量文字稍小 */
  color: var(--el-text-color-regular, #606266);
  margin-top: 6px; /* 與商品名稱的間距 */
  line-height: 1.6; /* 增加行高 */
}

.option-detail {
    display: block; /* 每個選項佔一行 */
    margin-left: 10px; /* 選項縮排 */
    margin-top: 4px; /* 選項間距 */
    color: var(--el-text-color-secondary); /* 使用次要文字顏色 */
}

.item-simple-summary span {
  color: var(--el-text-color-secondary);
}

.item-total-price { /* 小計 */
  font-weight: 500; /* 中等粗細 */
  white-space: nowrap; /* 防止換行 */
  color: var(--el-text-color-primary);
  font-size: var(--el-font-size-base);
  padding-top: 2px; /* 微調垂直對齊 */
}

/* 空狀態樣式 */
.el-empty {
  padding: 30px 0; /* 上下留白 */
}

</style>