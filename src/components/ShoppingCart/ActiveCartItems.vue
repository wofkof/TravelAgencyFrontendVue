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
                <span>{{ option.type }}</span>
                <div class="quantity-controls">
                  <el-button
                    @click="handleDecrementOptionQuantity(item, option)"
                    :disabled="option.quantity <= 0"
                    class="qty-el-btn"
                    size="small"
                    circle
                    :icon="Minus" title="減少數量"
                  />
                  <span class="qty-display">{{ option.quantity }}</span>
                  <el-button
                    @click="cartStore.updateOptionQuantity(item.id, option.type, 1)"
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
              class="simple-quantity"
            >
              <span>{{ item.quantity }} 張</span> <div class="quantity-controls">
                 <el-button
                  @click="handleDecrementSimpleQuantity(item)"
                  :disabled="item.quantity <= 0"
                  class="qty-el-btn"
                  size="small"
                  circle
                  :icon="Minus" title="減少數量"
                />
                <el-button
                  @click="cartStore.updateSimpleQuantity(item.id, 1)"
                  class="qty-el-btn"
                  size="small"
                  circle
                  :icon="Plus" title="增加數量"
                />
              </div>
            </div>
             <div v-else>
               </div>
          </div>

          <div class="item-price">
            NT$ {{ cartStore.calculateItemTotal(item) }}
          </div>

          <div class="item-actions-icons">
            <el-tooltip content="收藏" placement="top">
              <el-button
                :type="item.isFavorite ? 'warning' : ''"
                :icon="item.isFavorite ? StarFilled : Star" text
                circle
                plain
                @click="cartStore.toggleFavorite(item.id)"
              />
            </el-tooltip>
            <el-tooltip content="刪除" placement="top">
              <el-button
                type="danger"
                :icon="Delete" text
                circle
                plain
                @click="handleRemoveItem(item)"
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
            style="margin-left: 10px"
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
            前往結帳
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
import { useCartStore } from "@/stores/cart";

import { Minus, Plus, Star, StarFilled, Delete } from "@element-plus/icons-vue";
// ^^^ Element Plus *圖標* 的導入是 **必要** 的，因為它們在模板中被用作 :icon 屬性的變數值 (e.g., :icon="Minus")。
//     全域註冊圖標 (在 main.js) 使 <Minus /> 這種標籤可用，但不直接提供在 <script> 範圍內可用的 `Minus` 變數。

// --- 本地資源與工具 ---
import "@/assets/ActiveCartItems.css"; // 引入相關樣式表
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

