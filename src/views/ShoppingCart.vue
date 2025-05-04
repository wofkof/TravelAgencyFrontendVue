<template>
  <div class="shopping-cart">
    <h2>購物車</h2>
    <div v-if="items.length === 0">
      <p>你的購物車是空的。</p>
    </div>
    <div v-else>
      <ul class="cart-item-list">
        <li v-for="item in items" :key="item.id" class="cart-item">
          <input
            type="checkbox"
            :checked="item.selected"
            @change="cartStore.setItemSelection(item.id, $event.target.checked)"
            class="item-checkbox"
           >
          <div class="item-image">
             <img :src="item.imageUrl || '/img/placeholder.png'" :alt="item.name">
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.name }}</h3>
            <p class="item-details">{{ item.details }}</p>
            <p class="item-date">出發日期: {{ item.departureDate }}</p>
          </div>
          <div class="item-quantity-options">
             <div v-if="item.options && item.options.length > 0" class="options-list">
               <div v-for="option in item.options" :key="option.type" class="option-item">
                 <span>{{ option.type }}</span>
                 <div class="quantity-controls">
                   <button @click="cartStore.updateOptionQuantity(item.id, option.type, -1)" :disabled="option.quantity <= 0" class="qty-btn">-</button>
                   <span class="qty-display">{{ option.quantity }}</span>
                   <button @click="cartStore.updateOptionQuantity(item.id, option.type, 1)" class="qty-btn">+</button>
                 </div>
               </div>
             </div>
             <div v-else-if="item.quantity !== undefined" class="simple-quantity">
                 <span>{{ item.quantity }} 張</span>
                 <div class="quantity-controls">
                   <button @click="cartStore.updateSimpleQuantity(item.id, -1)" :disabled="item.quantity <= 1" class="qty-btn">-</button>
                   <button @click="cartStore.updateSimpleQuantity(item.id, 1)" class="qty-btn">+</button>
                 </div>
             </div>
          </div>
          <div class="item-price">
             NT$ {{ cartStore.calculateItemTotal(item) }}
          </div>
          <div class="item-actions-icons">
            <button @click="cartStore.toggleFavorite(item.id)"
                    class="icon-btn favorite-btn"
                    :class="{ active: item.isFavorite }"
                    title="收藏">

              <svg v-if="item.isFavorite" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>

              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                  <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
              </svg>

            </button>
             <button @click="confirmRemoveItem(item)" class="icon-btn delete-btn" title="刪除">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
              </svg>
            </button>
          </div>
        </li>
      </ul>
      <hr />
      <div class="summary-select-all-container">
        <div class="select-all-section">
           <input type="checkbox" id="selectAllBottom" v-model="isAllSelected">
           <label for="selectAllBottom"> 全選 ({{ selectedItemCount }})</label>
           <button v-if="selectedItemCount > 0" @click="confirmRemoveSelectedItems" class="remove-selected-btn">
             刪除已選項目
           </button>
        </div>
        <div class="summary-section">
          <span class="total-items">共 {{ selectedItemCount }} 件商品合計:</span>
          <span class="total-amount">NT$ {{ totalAmount }}</span>
          <button @click="goToCheckout" :disabled="selectedItemCount === 0">前往結帳</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// import { ref, computed, onMounted } from 'vue'; // 移除不再需要的
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia'; // 匯入 storeToRefs
import { useCartStore } from '@/stores/cart'; // 匯入你的 Store
import '@/assets/ShoppingCart.css';

const router = useRouter();
const cartStore = useCartStore(); // 實例化 Store

// --- 使用 storeToRefs 來保持狀態和 Getters 的響應性 ---
// 這樣你就可以在模板中直接使用 items, selectedItemCount 等
const {
    items,              // State
    selectedItemCount,  // Getter
    totalAmount,        // Getter
    isAllSelected       // Computed with getter/setter
} = storeToRefs(cartStore);

// --- 元件本地方法，用於觸發 Store Actions 或處理 UI 邏輯 ---

// 處理移除單一商品前的確認
const confirmRemoveItem = (item) => {
  const confirmMessage = `您確定要從購物車中刪除「${item.name}」嗎？`;
  if (window.confirm(confirmMessage)) {
    cartStore.removeFromCart(item.id); // 調用 store action
  } else {
    console.log('取消刪除');
  }
};

// 處理移除選中商品前的確認
const confirmRemoveSelectedItems = () => {
  if (selectedItemCount.value > 0 && window.confirm(`確定要移除選中的 ${selectedItemCount.value} 個項目嗎？`)) {
    cartStore.removeSelectedItems(); // 調用 store action
  }
};

// 前往結帳 (路由邏輯保留在元件)
const goToCheckout = () => {
  if (selectedItemCount.value === 0) {
    alert('請至少選擇一個商品進行結帳！');
    return;
  }
  // 不需要手動 saveCart()，持久化插件會處理
  router.push('/order-form');
};
</script>