<template>
  <div class="active-cart-items-container">
    <h3>購物車商品</h3>

    <div>
      <ul class="cart-item-list">
        <li v-for="item in items" :key="item.id" class="cart-item">
          <el-checkbox
            :model-value="item.selected"
            @change="cartStore.setItemSelection(item.id, $event)"
            class="item-checkbox"
            size="large"
            title="選擇此項目"
          />

          <div class="item-image">
            <img
              :src="item.imageUrl || '/img/placeholder.png'"
              :alt="item.name"
            />
          </div>

          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-details">{{ item.details }}</p>
          </div>

          <div class="item-date-column">
            <span v-if="item.departureDate">{{ item.departureDate }}</span>
            <span v-else>-</span>
          </div>

          <div class="item-quantity-options">
            <div
              v-if="item.options && item.options.length > 0"
              class="options-list"
            >
              <div
                v-for="option in item.options"
                :key="option.type"
                class="option-item"
              >
                <div>{{ option.type }}</div>
                <div class="quantity-controls">
                  <el-button
                    @click="handleDecrementOptionQuantity(item, option)"
                    :disabled="item.productType === 'CustomTravel' || option.quantity <= 0"
                    class="qty-el-btn"
                    size="small"
                    circle
                    :icon="Minus" title="減少數量"
                  />
                  <span v-if="item.productType === 'CustomTravel'" class="qty-display">
                    {{ (item.productSpecificData && typeof item.productSpecificData.people !== 'undefined') ? item.productSpecificData.people + '人' : '人數 N/A' }}
                  </span>
                  <span v-else class="qty-display">
                    {{ option.quantity }}人 </span>
                  <el-button
                    @click="cartStore.updateOptionQuantity(item.id, option.type, 1)"
                    :disabled="item.productType === 'CustomTravel'"
                    class="qty-el-btn"
                    size="small"
                    circle
                    :icon="Plus" title="增加數量"
                  />
                </div>
              </div>
            </div>
            <div
              v-else-if="item.quantity !== undefined"
              class="quantity-controls simple-quantity-controls"
            >
                <el-button
                  @click="handleDecrementSimpleQuantity(item)"
                  :disabled="item.quantity <= 0"
                  class="qty-el-btn"
                  size="small"
                  circle
                  :icon="Minus" title="減少數量"
                />
                <span class="qty-display">{{ item.quantity }} 張</span>
                <el-button
                  @click="cartStore.updateSimpleQuantity(item.id, 1)"
                  class="qty-el-btn"
                  size="small"
                  circle
                  :icon="Plus" title="增加數量"
                />
            </div>
            <div v-else>
              </div>
          </div>

          <div class="item-price">
            NT$ {{ cartStore.calculateItemTotal(item) }}
          </div>

          <div class="item-actions-icons">
            <el-tooltip :content="item.isFavorite ? '取消收藏' : '加入收藏'" placement="top">
              <span
                class="action-icon favorite-icon-action" role="button"
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
                text       
                circle
                plain
                size="small" @click="handleRemoveItem(item)"
                class="action-button delete-button"
              />
            </el-tooltip>
          </div>
        </li>
      </ul>

      <el-divider />

      <div class="summary-select-all-container">
        <div class="select-all-section">
          <el-checkbox
            id="selectAllActive"
            v-model="isAllSelected"
            size="large"
          >
            全選 ({{ selectedItemCount }})
          </el-checkbox>
          <el-button
            v-if="selectedItemCount > 0"
            @click="handleRemoveSelectedItems"
            type="danger"
            plain
            size="small"
            :icon="Delete"  style="margin-left: 10px"
          >
            刪除已選項目
          </el-button>
        </div>
        <div class="summary-section">
          <span class="total-items">
            共 {{ selectedItemCount }} 件商品合計:
          </span>
          <span class="total-amount">NT$ {{ totalAmount }}</span>
          <el-button
            @click="goToCheckout"
            :disabled="selectedItemCount === 0"
            type="primary"
          >
            前往結帳 <el-icon class="el-icon--right"><ArrowRightBold /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- 核心依賴 ---
import { defineProps } from "vue"; // defineProps 在 <script setup> 中可直接使用，但顯式導入更清晰
import { useRouter } from "vue-router";

// --- 狀態管理 (Pinia) ---
import { storeToRefs } from "pinia";
import { useCartStore } from "@/stores/ShoppingCart";

import { Minus, Plus, Delete } from "@element-plus/icons-vue";
// ^^^ Element Plus *圖標* 的導入是 **必要** 的，因為它們在模板中被用作 :icon 屬性的變數值 (e.g., :icon="Minus")。
//     全域註冊圖標 (在 main.js) 使 <Minus /> 這種標籤可用，但不直接提供在 <script> 範圍內可用的 `Minus` 變數。

// --- 本地資源與工具 ---
import FavoriteIcon from "@/components/tools/FavoriteIcon.vue"; // 引入收藏圖標組件
import { useConfirmation } from "@/components/tools/useConfirmation.js"; // 引入確認對話框的 composable

// --- Props 定義 ---
// 從父組件接收購物車項目列表
const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [], // 提供一個空的默認值，避免 undefined 錯誤
  },
});

// --- 初始化 ---
const router = useRouter(); // 獲取路由實例
const cartStore = useCartStore(); // 獲取購物車 store 實例
const { showConfirmDialog } = useConfirmation(); // 獲取確認對話框方法

// --- 從 Store 提取響應式狀態 (Getters/State) ---
// 使用 storeToRefs 確保從 store 取出的計算屬性 (getters) 保持響應性
const {
  isAllSelected,      // 是否全選 (通常是一個 writable computed 或 getter + action)
  selectedItemCount,  // 已選項目數量 (getter)
  totalAmount,        // 已選項目總金額 (getter)
} = storeToRefs(cartStore);

// --- 事件處理方法 ---

/**
 * 處理移除單個購物車項目的操作
 * @param {object} item - 要移除的項目對象
 */
const handleRemoveItem = async (item) => {
  const confirmed = await showConfirmDialog({
    title: "移除商品",
    message: `確定要從購物車中移除「${item.name}」嗎？`,
    confirmButtonText: "確認移除",
    type: "warning",
  });
  if (confirmed) {
    cartStore.removeFromCart(item.id); // 調用 store action 移除項目
  }
};

/**
 * 處理移除所有已選中項目的操作
 */
const handleRemoveSelectedItems = async () => {
  // 再次確認是否有選中項目 (雖然按鈕已禁用，但多一層保護)
  if (selectedItemCount.value === 0) return;

  const confirmed = await showConfirmDialog({
    title: "刪除已選項目",
    message: `確定要移除選中的 ${selectedItemCount.value} 個商品嗎？`, // 提示詞修正
    confirmButtonText: "確認移除",
    type: "warning",
  });
  if (confirmed) {
    cartStore.removeSelectedItems(); // 調用 store action 移除所有選中項目
  }
};

/**
 * 處理點擊 '-' 按鈕 (針對有 options 的項目)
 * @param {object} item - 購物車項目
 * @param {object} option - 被操作的選項
 */
const handleDecrementOptionQuantity = async (item, option) => {
  // 1. 計算此項目當前所有選項的總數量
  const currentTotalQuantityForItem = item.options.reduce(
    (sum, opt) => sum + opt.quantity,
    0
  );

  // 2. 檢查被點擊的選項數量是否 > 0 (按鈕本身應已處理 disabled)
  if (option.quantity > 0) {
    // 3. 判斷：如果這是此項目的最後一個單位 (總數量為 1)，則觸發確認移除對話框
    if (currentTotalQuantityForItem === 1) {
      const confirmed = await showConfirmDialog({
        title: "移除商品",
        message: `這是「${item.name} (${option.type})」的最後一個單位，確定要將整個商品「${item.name}」從購物車移除嗎？`,
        confirmButtonText: "確認移除",
        type: "warning",
      });

      if (confirmed) {
        // 確認移除，調用 store action 移除整個項目
        cartStore.removeFromCart(item.id);
      }
      // 若取消，則不做任何事
    } else {
      // 4. 如果總數量 > 1，則不需確認，直接調用 store action 更新該選項數量 (-1)
      cartStore.updateOptionQuantity(item.id, option.type, -1);
    }
  }
  // 理論上 option.quantity 為 0 時按鈕是 disabled，不會觸發此函式
};

/**
 * 處理點擊 '-' 按鈕 (針對無 options，只有簡單 quantity 的項目)
 * @param {object} item - 購物車項目
 */
const handleDecrementSimpleQuantity = async (item) => {
  // 如果當前數量為 1 或更少 (例如 0，雖然按鈕應 disabled)，則詢問是否刪除
  if (item.quantity <= 1) {
    const confirmed = await showConfirmDialog({
      title: "移除商品",
      message: `您確定要從購物車中刪除「${item.name}」嗎？`,
      confirmButtonText: "確認移除", // 統一用移除
      type: "warning",
    });
    if (confirmed) {
      cartStore.removeFromCart(item.id);
    }
    // 若取消，則不做任何事
  } else {
    // 如果數量 > 1，直接調用 store action 減少數量 (-1)
    cartStore.updateSimpleQuantity(item.id, -1);
  }
};

/**
 * 導航至結帳頁面
 */
const goToCheckout = () => {
  // 再次檢查是否有選中項目 (按鈕已處理 disabled，但可作為額外檢查)
  if (selectedItemCount.value === 0) {
    // 提示用戶至少選擇一個商品進行結帳
    alert("請至少選擇一個商品進行結帳！");
    return;
  }
  // 導航到訂單表單頁面
  router.push("/order-form");
};
</script>

<style scoped>
/* ActiveCartItems.css */
/* 主要定義 ActiveCartItems.vue 組件內元素樣式 */

.active-cart-items-container {
  background-color: #ffffff; /* 白色背景 */
  border-radius: 10px; /* 圓角 */
  padding: 25px 30px; /* 內部留白，上下 25px, 左右 30px */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12); /* 添加細微陰影增加立體感 */
  border: 5px solid #e8ecf6;
}

.active-cart-items-container h3 { /* 使 h3 樣式限定在容器內 */
  margin-top: 0; /* 移除容器內標題的上邊距 */
  margin-bottom: 25px; /* 標題與下方內容的間距 */
  font-size: 1.4em; /* 調整標題大小 */
  color: #303133; /* Element Plus 的主要文字顏色 */
  font-weight: 600; /* 加粗 */
  text-align: left; /* 標題靠左 */
}

/* --- 列表基礎樣式 --- */
.cart-item-list {
  list-style: none; /* 移除 ul 的默認項目符號 */
  padding: 0;
  margin: 0; /* 移除默認的內外邊距 */
}

/* --- 購物車單項樣式 (使用 Grid 佈局) --- */
.cart-item {
  display: grid;
  grid-template-columns: auto 80px 1fr 100px 240px 120px auto;
  align-items: center;
  gap: 10px 15px; /* 行間距 10px，列間距 15px */
  padding: 15px 0; /* 上下內邊距 15px */
  border-bottom: 1px solid #eee; /* 項目間的分隔線 */
  align-items: baseline;
}

/* 可以為選中的項目添加不同的背景色 */
.cart-item.item-selected {
  background-color: #f0f8ff; /* 淡藍色背景 */
}

/* --- Grid 佈局下的子元素定位 --- */
/* 根據 grid-template-columns 的定義，為各部分指定其佔據的列 */
.item-checkbox { grid-column: 1 / 2; } /* 複選框在第 1 列 */
.item-image { grid-column: 2 / 3; } /* 圖片在第 2 列 */
.item-info {
  grid-column: 3 / 4; /* 商品資訊在第 3 列 */
  min-width: 0; /* 允許內容收縮，避免溢出 */
}
.item-date-column {
  grid-column: 4 / 5; /* 日期在第 4 列 */
  text-align: center;
  font-size: 0.9em;
  color: #333;
}
.item-quantity-options {
  grid-column: 5 / 6; /* 數量選項在第 5 列 */
  display: flex;
  flex-direction: column; /* 選項垂直排列 */
  gap: 5px; /* 選項之間的間距 */
  align-items: flex-start; /* 左對齊 */
}
.item-price {
  grid-column: 6 / 7; /* 價格在第 6 列 */
  font-weight: bold;
  text-align: left; /* 價格靠左對齊 */
  align-self: start;
}
.item-actions-icons {
  grid-column: 7 / 8; /* 操作按鈕在第 7 列 */
  display: flex;
  align-items: center; /* 圖標垂直居中對齊 */
  gap: 8px; /* 按鈕間幾乎無間距 (或根據需要調整) */
  justify-content: center; /* 圖標在自己的列中居中 */
  min-width: 50px;
}

.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%; /* 讓懸停背景變圓 */
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-icon:hover {
  background-color: #f5f7fa; /* 淺灰色背景 */
}

/* 設定收藏圖標的顏色 */
.favorite-icon-action {
  color: #ca0d1d;
  /* 可以設定預設顏色，但通常由內部 :deep 規則控制 */
}

/* 使用 :deep() 選中 FavoriteIcon 元件內部的元素來設定顏色 */
/* 未收藏時 (空心) 的顏色 */
.favorite-icon-action :deep(.favorite-icon-wrapper) {
    color: #909399;
    transition: color 0.2s ease, transform 0.2s ease;
}
.favorite-icon-action:active :deep(.favorite-icon-wrapper) {
    transform: scale(0.9) rotate(-15deg);
}
.favorite-icon-action:hover :deep(.favorite-icon-wrapper) {
   color: #606266; /* 懸停時顏色加深 */
   transform: scale(1.1); /* 懸停時放大 */
}
.favorite-icon-action :deep(.favorite-icon-wrapper.is-favorite) {
    color: #ca0d1d;
}
.favorite-icon-action :deep(.favorite-icon-wrapper.is-favorite:active) { /* 已收藏點擊時 */
    transform: scale(0.9);
}

/* 確保刪除按鈕視覺上協調 */
.action-button.delete-button {
  margin: 0; /* 可能需要移除預設 margin */
}
/* 如果需要調整刪除圖示大小 */
.action-button.delete-button .el-icon,
.action-button.delete-button :deep(svg) {
   font-size: 25px; /* 例如，使其與收藏圖標視覺大小接近 */
}
.action-button.delete-button:hover {
    background-color: #fef0f0;
    color: #e71414; /* 如果需要，也可以改變圖示顏色 */
}

/* --- 項目內部元素樣式 --- */
.item-image img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 6px;
}

.item-name {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 5px;
  color: #303133; /* 主要文字顏色 */
}

.item-details {
  font-size: 0.9em;
  color: #666; /* 次要文字顏色 */
  margin-bottom: 8px;
  line-height: 1.4; /* 增加行高提高可讀性 */
}

.options-list .option-item span {
  white-space: nowrap; /* 保持文字不換行 */
  display: inline-block; /* 需要是塊級或行內塊級元素才能設定寬度 */
  width: 70px; /* 嘗試一個像素值，你可能需要微調 */
  text-align: center;
}

.options-list .option-item div {
  white-space: nowrap; /* 保持文字不換行 */
  display: inline-block; /* 需要是塊級或行內塊級元素才能設定寬度 */
  width: 70px; /* 嘗試一個像素值，你可能需要微調 */
  text-align: left;
}

.options-list .option-item {
  display: flex;
  justify-content: flex-start; /* 讓內容靠左排列 */
  align-items: center; /* 垂直居中對齊 */
  font-size: 0.9em;
  gap: 10px; /* 調整這個值來控制間距 */
}

/* 數量控制按鈕組合 (+/- 按鈕和數字) */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
}


/* 數量顯示的數字 */
.qty-display {
  display: block; 
  min-width: 24px; /* 數字區域的最小寬度 */
  text-align: center; /* 置中文字 */
  font-weight: bold;
  font-size: 1em;
  color: #303133;
  flex-shrink: 0; /* 防止縮小 */
}

/* 微調 Element Plus 按鈕樣式 (用於數量控制) */
.quantity-controls .el-button.is-circle {
  width: 22px; /* 圓形按鈕尺寸 */
  height: 22px;
  margin: 3px 0; /* 按鈕間距 */
  padding: 0; /* 去除內邊距 */
}

.quantity-controls {
  display: flex;
  align-items: center;
  /* **調整 gap 值來控制按鈕和數字之間的間距** */
  gap: 8px; /* 例如設置為 8px，這樣 `-` 到數字和數字到 `+` 之間都是 8px 間距 */
  min-width: 90px;
  flex-shrink: 0;
}

/* --- 摘要與全選區塊樣式 --- */
.summary-select-all-container {
  display: flex;
  justify-content: space-between; /* 全選區塊和總結區塊左右分開 */
  align-items: center;
  padding: 15px 0; /* 上下內邊距 */
  margin-top: 5px; /* 與上方列表/分隔線的間距 */
  border-top: 1px solid #ccc; /* 頂部分隔線 */
}

.select-all-section {
  display: flex;
  align-items: center;
}

/* 使用 :deep() 穿透 Scoped CSS，修改 Element Plus Checkbox 內部樣式 */
:deep(.select-all-section .el-checkbox) {
  margin-right: 10px; /* 調整 checkbox 和 "全選" 文字之間的間距 */
}
:deep(.select-all-section .el-checkbox__label) {
  /* 可以調整 "全選" 文字的樣式 */
  font-size: 1em;
}

/* 使 "全選" 文字也可點擊觸發 checkbox */
.select-all-section label {
  cursor: pointer;
}

.summary-section {
  display: flex;
  align-items: center;
  gap: 15px; /* 總計、金額、按鈕之間的間距 */
}

.total-items {
  font-size: 0.9em;
  color: #555;
}

.total-amount {
  font-size: 1.2em;
  font-weight: bold;
  color: #d9534f; /* 醒目的紅色表示金額 */
}
</style>
