// src/stores/cart.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // --- 狀態 (State) ---
  const items = ref([
    // 你可以保留預設值，或者讓持久化插件從 localStorage 加載
    {
        id: 'expo-123', productId: 'OSAKA-EXPO', name: '大阪世界博覽會 EXPO 2025 門票',
        details: '大阪、關西世博探索一日票...', imageUrl: null,
        departureDate: '2025/10/15', options: [
            { type: '嬰兒', quantity: 1, price: 500 }, { type: '兒童', quantity: 1, price: 1000 }, { type: '成人', quantity: 1, price: 2000 }
        ], category: '景點門票', selected: true, isFavorite: false
    },
    {
        id: 'busan-pass-456', productId: 'BUSAN-PASS', name: '韓國釜山通行證 VISIT BUSAN PASS',
        details: '【限時特惠】24小時通行證', imageUrl: null,
        departureDate: '2025/04/26', quantity: 1, pricePerUnit: 1245,
        category: '交通票券', selected: true, isFavorite: true
    }
  ]);

  // --- Getters (計算屬性) ---

  // 計算單項總價的輔助函式 (可以放在 store 內部或外部)
  const calculateItemTotal = (item) => {
    if (item.options && item.options.length > 0) {
      return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
    } else if (item.quantity && item.pricePerUnit) {
      return item.pricePerUnit * item.quantity;
    }
    return 0;
  };

  // 已選擇的商品
  const selectedItems = computed(() => items.value.filter(item => item.selected));

  // 已選擇的商品數量
  const selectedItemCount = computed(() => selectedItems.value.length);

  // 已選擇商品的總金額 (用於結帳)
  const totalAmount = computed(() => {
    return selectedItems.value.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  });

  // 全選狀態 (包含 getter 和 setter，方便 v-model 綁定)
  const isAllSelected = computed({
    get: () => items.value.length > 0 && items.value.every(item => item.selected),
    set: (value) => {
      items.value.forEach(item => item.selected = value);
      // 持久化插件會自動處理儲存，不需要手動 saveCart()
    }
  });

  // 購物車內商品總"件數" (考慮 options 和 quantity，用於 Navbar badge)
  const itemCount = computed(() => items.value.reduce((sum, item) => {
      if (item.options && item.options.length > 0) {
        return sum + item.options.reduce((optSum, opt) => optSum + opt.quantity, 0);
      } else if (item.quantity !== undefined) {
        return sum + item.quantity;
      }
      return sum; // 如果結構不符，則不增加
  }, 0));


  // 購物車內所有商品總金額 (用於 Navbar 預覽)
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  });


  // --- Actions (方法) ---
  // 注意：由於使用了持久化插件，Pinia 會在狀態變更後自動存儲，
  // 因此不需要在每個 Action 後手動呼叫 saveCart()。

  // (新) 設定單一商品選中狀態 (用於 checkbox change)
  function setItemSelection(itemId, isSelected) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      item.selected = isSelected;
    }
  }

  // 切換收藏
  function toggleFavorite(itemId) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      item.isFavorite = !item.isFavorite;
    }
  }

  // 從購物車移除單一商品
  function removeFromCart(itemId) {
    items.value = items.value.filter(i => i.id !== itemId);
  }

  // 移除所有選中的商品
  function removeSelectedItems() {
    items.value = items.value.filter(item => !item.selected);
  }

  // 更新有 Options 的商品數量
  function updateOptionQuantity(itemId, optionType, change) {
    const item = items.value.find(i => i.id === itemId);
    if (item?.options) {
      const option = item.options.find(opt => opt.type === optionType);
      if (option) {
        const newQuantity = option.quantity + change;
        if (newQuantity >= 0) { // 允許數量為 0
          option.quantity = newQuantity;
          // 檢查是否所有 options 數量都為 0
          const totalOptionQuantity = item.options.reduce((sum, opt) => sum + opt.quantity, 0);
          if (totalOptionQuantity <= 0) {
             // 直接調用，Pinia 會處理響應式更新
             removeFromCart(itemId);
          }
        }
      }
    }
  }

  // 更新無 Options 的商品數量
  function updateSimpleQuantity(itemId, change) {
    const item = items.value.find(i => i.id === itemId);
    if (item && !item.options && item.quantity !== undefined) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1) {
        item.quantity = newQuantity;
      } else if (newQuantity <= 0) {
        removeFromCart(itemId);
      }
    }
  }

  // (新) 添加商品到購物車 (範例，你需要在商品列表頁調用)
  function addItem(product) {
      const existingItemIndex = items.value.findIndex(item => item.productId === product.productId); // 用 productId 判斷是否已存在

      if (existingItemIndex > -1) {
          // 商品已存在，更新數量或其他邏輯 (此處僅為範例)
          const existingItem = items.value[existingItemIndex];
          if (existingItem.quantity !== undefined) {
              existingItem.quantity += (product.quantity || 1);
          } else if (existingItem.options && product.options) {
              // 如果有選項，需要更複雜的合併邏輯
              console.warn("需要實現 Options 合併邏輯");
          }
      } else {
          // 商品不存在，新增到購物車
          // 需要確保 product 物件包含 Pinia store items 所需的所有屬性
          const newItem = {
              id: product.id || `${product.productId}-${Date.now()}`, // 確保有唯一 ID
              productId: product.productId,
              name: product.name,
              details: product.details,
              imageUrl: product.imageUrl,
              departureDate: product.departureDate,
              options: product.options,
              quantity: product.quantity,
              pricePerUnit: product.pricePerUnit,
              category: product.category,
              selected: true, // 預設選中
              isFavorite: false, // 預設非收藏
          };
          items.value.push(newItem);
      }
  }


  // --- 匯出 ---
  return {
    // State
    items,
    // Getters
    selectedItems,
    selectedItemCount,
    totalAmount,
    isAllSelected,
    itemCount, // Navbar badge
    totalPrice, // Navbar preview
    calculateItemTotal, // 供外部使用 (例如元件內)
    // Actions
    setItemSelection,
    toggleFavorite,
    removeFromCart,
    removeSelectedItems,
    updateOptionQuantity,
    updateSimpleQuantity,
    addItem,
  };
}, {
  // --- 配置 Pinia 持久化 ---
  persist: {
    key: 'travel_agency_cart', // 與 localStorage 使用的 key 相同
    storage: localStorage, // 指定儲存方式，可以是 localStorage 或 sessionStorage
    // paths: ['items'], // 可選：如果只想持久化 items 狀態，可以取消註解此行
  },
});