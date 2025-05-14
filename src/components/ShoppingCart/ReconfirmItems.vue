<template>
  <div v-if="items && items.length > 0" class="reconfirm-section">
    <h3>須重新確認的商品</h3>
    <div class="reconfirm-container">
      <ul class="reconfirm-item-list">
        <li v-for="item in items" :key="item.id" class="reconfirm-item">
          <div class="item-image">
            <img :src="item.imageUrl || '/img/placeholder.png'" :alt="item.name">
          </div>
          <div class="item-info">
            <h4 class="item-name">{{ item.name }}</h4>
            <p class="item-details">{{ item.details }}</p>
          </div>
          <div class="item-date-column">
            <span v-if="item.departureDate">{{ item.departureDate }}</span>
            <span v-else>-</span>
            <span v-if="item.departureTime" class="item-time"> {{ item.departureTime }}</span>
          </div>
          <div class="item-expired-info">
            <div v-if="item.options && item.options.length > 0" class="options-display">
              <span v-for="option in item.options" :key="option.type">
                {{ option.type }} x {{ option.quantity }}
              </span>
            </div>
            <div v-else-if="item.quantity !== undefined">
              人數 x {{ item.quantity }} </div>
             <div class="expired-alert">
              <el-icon color="#F56C6C"><WarningFilled /></el-icon>
              <span>商品已過期，請選擇其他商品</span> </div>
          </div>
          <div class="item-actions-icons">
            <el-tooltip :content="item.isFavorite ? '取消收藏' : '加入收藏'" placement="top">
              <span
                class="action-icon favorite-icon-action"
                role="button"
                tabindex="0"
                :aria-pressed="item.isFavorite"
                :aria-label="item.isFavorite ? '取消收藏' : '加入收藏'"
                @click="cartStore.toggleFavorite(item.id)" >
                <FavoriteIcon
                  :is-favorite="item.isFavorite"
                  :size="18" :class="{ 'favorited': item.isFavorite }"
                />
              </span>
            </el-tooltip>

            <el-tooltip content="刪除" placement="top">
              <el-button
                type="danger"
                :icon="Delete"
                text circle plain
                size="small" @click="handleRemoveItem(item)"
                class="action-button delete-button" />
            </el-tooltip>
          </div>
        </li>
      </ul>
      <div class="reconfirm-footer">
        <el-button type="danger" plain @click="handleRemoveAll">全部移除</el-button> </div>
    </div>
  </div>
</template>

<script setup>
// --- 核心依賴 ---
import { computed } from 'vue'; // 導入 computed (雖然目前未使用，可能未來會用到)

// --- 狀態管理 (Pinia) ---
import { useCartStore } from '@/stores/ShoppingCart';

import { Delete } from '@element-plus/icons-vue'; // 需要的圖標 (用於 :icon 綁定)
// --- 本地工具 ---
import FavoriteIcon from "@/components/tools/FavoriteIcon.vue"; // 引入收藏圖標組件
import { useConfirmation } from '@/components/tools/useConfirmation'; // 引入確認對話框的 composable

// --- Props 定義 ---
// 從父組件接收需要重新確認的商品列表 (例如：已過期)
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [] // 提供一個空的默認值
  }
});

// --- 初始化 ---
const cartStore = useCartStore(); // 獲取購物車 store 實例
const { showConfirmDialog } = useConfirmation(); // 獲取確認對話框方法

// --- 本地方法 ---

/**
 * (未使用) 計算單個項目的總數量 (選項加總或直接取 quantity)
 * @param {object} item - 購物車項目
 * @returns {number} - 項目總數量
 */

/**
 * 處理移除單個需要重新確認的項目
 * @param {object} item - 要移除的項目對象
 */
const handleRemoveItem = async (item) => {
  const confirmed = await showConfirmDialog({
    title: '移除商品',
    message: `確定要移除已過期/須重新確認的「${item.name}」嗎？`, // 提示詞
    confirmButtonText: '確認移除',
    type: 'warning'
  });
  if (confirmed) {
    cartStore.removeFromCart(item.id); // 調用 store action
  }
};

/**
 * 處理移除所有顯示在此列表中的項目
 */
const handleRemoveAll = async () => {
  // 如果列表為空，則不執行
  if (!props.items || props.items.length === 0) return;

  const confirmed = await showConfirmDialog({
    title: '全部移除確認',
    message: `確定要移除所有 ${props.items.length} 個已過期/須重新確認的商品嗎？`,
    confirmButtonText: '確認全部移除',
    type: 'warning'
  });
  if (confirmed) {
    // 提取當前列表中所有項目的 ID
    const idsToRemove = props.items.map(item => item.id);
    // 調用 store action，批量移除這些 ID 對應的項目
    // 假設 store 中有 removeItemsByIds 方法
    cartStore.removeItemsByIds(idsToRemove);
  }
};

</script>

<style scoped>
/* --- 組件根元素樣式 --- */
.reconfirm-section {
  margin-top: 30px; /* 與上方內容 (例如 ActiveCartItems) 的間距 */
  background-color: #fdf6ec; /* Element Plus warning-light-9，用於視覺區分 */
  border: 5px solid #f3d19e; /* Element Plus warning-light-5 邊框 */
  border-radius: 8px;
  padding: 20px 25px; /* 內邊距 */
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
}

/* --- 組件內標題樣式 --- */
.reconfirm-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2em; /* 標題稍大 */
  color: #dda756; /* Element Plus Warning 顏色 */
  font-weight: 600;
}

/* --- 內部容器樣式 --- */
.reconfirm-container {
  border-radius: 4px; /* 可以保留一個小的圓角 */
  padding: 0; /* 移除內邊距，由子元素控制 */
}

/* --- 項目列表樣式 --- */
.reconfirm-item-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* --- 單個項目樣式 (使用 Grid 佈局) --- */
.reconfirm-item {
  display: grid;
  /* 定義網格列：圖片 | 商品資訊 | 日期 | 過期/數量提示 | 操作按鈕 */
  grid-template-columns: 60px 1fr 100px 1fr min-content;
  gap: 10px 15px; /* 行間距 10px, 列間距 15px */
  padding: 15px 0; /* 上下內邊距 */
  border-bottom: 1px solid #140f0f; /* 項目間分隔線 */
  align-items: flex-start; /* 內容頂部對齊 */
}

/* 最後一個項目移除底部分隔線 */
.reconfirm-item:last-child {
  border-bottom: none;
}

/* --- Grid 佈局下的子元素定位與樣式 --- */
.item-image { grid-column: 1 / 2; }
.item-info { grid-column: 2 / 3; min-width: 0; } /* 允許收縮 */
.item-name { font-size: 1em; font-weight: bold; margin-bottom: 4px; color: #303133; }
.item-details { font-size: 0.85em; color: #666; margin-bottom: 4px; line-height: 1.4; }

.item-date-column {
  grid-column: 3 / 4;
  text-align: center;
  font-size: 0.9em;
  color: #333;
  padding-top: 2px; /* 微調垂直對齊 */
}
.item-time {
  font-size: 0.8em;
  display: block; /* 時間換行顯示 */
  color: #666;
  margin-top: 2px;
}

/* 過期/數量資訊區塊 */
.item-expired-info {
  grid-column: 4 / 5;
  font-size: 0.9em;
  padding-top: 2px; /* 微調垂直對齊 */
}
.options-display span {
  display: block; /* 每個選項佔一行 */
  margin-bottom: 3px;
  color: #606266; /* 次要文字顏色 */
}
/* 簡單數量顯示 */
.item-expired-info > div:not(.options-display):not(.expired-alert) {
   color: #606266;
   margin-bottom: 8px; /* 與下方提示間距 */
}

/* 過期提示框樣式 */
.expired-alert {
  margin-top: 8px; /* 與上方數量資訊的間距 */
  padding: 6px 10px; /* 內邊距 */
  background-color: #fef0f0; /* Element Plus Danger Light 9 */
  border: 1px solid #fde2e2; /* Element Plus Danger Light 8 */
  border-radius: 4px;
  color: #F56C6C; /* Element Plus Danger */
  font-size: 0.85em;
  display: flex;
  align-items: center;
  gap: 6px; /* 圖標和文字間距 */
}
.expired-alert span {
  flex-grow: 1; /* 文字佔滿剩餘空間 */
  line-height: 1.3;
}
/* 微調提示框內的 el-icon 大小 */
.expired-alert .el-icon {
  font-size: 1.1em;
}

/* 操作按鈕區塊 */
.item-actions-icons {
  grid-column: 5 / 6;
  display: flex;
  gap: 12px; /* 按鈕間距 */
  align-items: center; /* 按鈕在列中居中 */
  padding-top: 2px; /* 微調垂直對齊 */
}
/* 移除 Element Plus 按鈕可能自帶的外邊距，確保 gap 生效 */
.item-actions-icons .el-button {
  margin: 0 !important;
}
.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; /* 與 small circle button 類似 */
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-icon:hover {
  background-color: rgba(0, 0, 0, 0.06); /* 在淺色背景上用稍暗的懸停效果 */
}

/* === 新增：收藏圖示的顏色設定 === */
.favorite-icon-action {
  color: #ca0d1d;
 }

/* 未收藏時 (空心) 的顏色 */
.favorite-icon-action :deep(.favorite-icon-wrapper) {
   color: #909399; /* 灰色 */
   transition: color 0.2s ease;
}
.favorite-icon-action:hover :deep(.favorite-icon-wrapper) {
   color: #ca0d1d; /* 懸停時加深 */
}

/* 已收藏時 (實心) 的顏色 */
.favorite-icon-action :deep(.favorite-icon-wrapper.is-favorite) {
   color: #ca0d1d; /* Warning 橙黃色 */
}

/* 確保刪除按鈕視覺上協調 */
.action-button.delete-button {
  margin: 0 !important; /* 移除 el-button 可能的預設 margin */
}
/* 調整刪除圖示大小 */
.action-button.delete-button .el-icon,
.action-button.delete-button :deep(svg) {
    font-size: 18px; /* 使其與收藏圖標視覺大小接近 */
}

/* --- 列表底部操作區 --- */
.reconfirm-footer {
  margin-top: 20px; /* 與列表的間距 */
  padding-top: 15px; /* 與上方分隔線的間距 */
  border-top: 1px solid #e0e0e0; /* 頂部分隔線 */
  text-align: left; /* 按鈕靠左 */
}
</style>