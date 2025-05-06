// src/stores/cart.js
import { defineStore } from 'pinia'; // 從 pinia 導入 defineStore 方法
import { ref, computed, watch } from 'vue'; // 從 vue 導入 ref (用於狀態) 和 computed (用於計算屬性/Getters)

// 使用 setup 函數語法定義購物車 store
export const useCartStore = defineStore('cart', () => {
  // --- 狀態 (State) ---
  // 核心狀態：一個包含購物車項目的陣列。
  // 初始狀態可以是空陣列或預設項目。
  // 持久化插件會在加載時使用 localStorage 中的數據覆蓋此狀態。
  const items = ref([
    // 範例項目：包含選項 (options)
    {
        id: 'expo-123', productId: 'OSAKA-EXPO', name: '大阪世界博覽會 EXPO 2025 門票',
        details: '大阪、關西世博探索一日票...', imageUrl: null, // 考慮添加一個預設圖片 URL
        departureDate: '2025/10/15', // 假設日期格式為 YYYY/MM/DD
        options: [
            { type: '嬰兒', quantity: 1, price: 500 },
            { type: '兒童', quantity: 1, price: 1000 },
            { type: '成人', quantity: 1, price: 2000 }
        ],
        category: '景點門票',
        selected: true, // 項目是否被選中用於結帳
        isFavorite: false // 項目是否被標記為收藏
    },
    // 範例項目：只有簡單數量 (quantity) 和單價 (pricePerUnit)
    {
       id: 'busan-pass-789', productId: 'BUSAN-PASS', name: '韓國釜山通行證 VISIT BUSAN PASS',
       details: '【限時特惠】24小時通行證', imageUrl: null,
       departureDate: '2025/05/26', 
       quantity: 1, // 簡單數量
       pricePerUnit: 1245, // 單位價格
       category: '交通票券',
       selected: true,
       isFavorite: true
    },
    // 範例項目：包含選項 (根據目前日期 2025/05/06 判斷，此項目可能已過期)
    {
       id: 'expo-456', productId: 'OSAMI-TRIP', name: '京都三天兩夜旅遊行程',
       details: '京都三日游', imageUrl: null,
       departureDate: '2025/05/01', // 已過期
       options: [
            { type: '嬰兒', quantity: 1, price: 500 }, { type: '兒童', quantity: 1, price: 1000 }, { type: '成人', quantity: 1, price: 2000 }
       ], category: '', selected: true, isFavorite: false
    },
    // 範例項目：只有簡單數量 (quantity) 和單價 (pricePerUnit)
    {
        id: 'busan-pass-456', productId: 'BUSAN-PASS', name: '韓國釜山通行證 VISIT BUSAN PASS',
        details: '【限時特惠】24小時通行證', imageUrl: null,
        departureDate: '2025/04/26', // 已過期
        quantity: 1, // 簡單數量
        pricePerUnit: 1245, // 單位價格
        category: '交通票券',
        selected: true,
        isFavorite: true
    }
  ]);

  // --- 計算屬性 (Getters) ---

  /**
   * 計算單個購物車項目總價的輔助函數。
   * 處理包含 options 或 簡單 quantity/pricePerUnit 結構的項目。
   * 在 store 內部定義，但可選擇性匯出供外部使用。
   * @param {object} item - 購物車項目物件。
   * @returns {number} - 該項目的總價格。
   */
  const calculateItemTotal = (item) => {
    if (item.options && item.options.length > 0) {
      // 計算所有選項的價格 * 數量 的總和
      return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
    } else if (item.quantity !== undefined && item.pricePerUnit !== undefined) {
      // 計算單價 * 數量
      return item.pricePerUnit * item.quantity;
    }
    // 如果無法計算價格，返回 0
    return 0;
  };

  /**
   * 計算屬性：根據 departureDate 判斷已過期的商品。
   * 假設 departureDate 格式為 'YYYY/MM/DD'。
   */
  const expiredItems = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 設定為今天的開始時間，以便精確比較日期

    return items.value.filter(item => {
      if (!item.departureDate) return false; // 沒有出發日期的商品不算過期

      try {
        const parts = item.departureDate.split('/');
        if (parts.length !== 3) {
            console.warn(`項目 ${item.id} 的日期格式無效: ${item.departureDate}`);
            return false; // 格式無效
        }
        // 注意：JavaScript Date 物件的月份是從 0 開始的 (0=一月, 1=二月, ...)
        const departure = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        departure.setHours(0, 0, 0, 0); // 也設定為出發日期的開始時間

        // 檢查出發日期是否嚴格早於今天
        return departure < today;
      } catch (e) {
        console.error(`解析項目 ${item.id} 的日期時出錯: ${item.departureDate}`, e);
        return false; // 將解析錯誤視為未過期
      }
    });
  });

  /**
   * 計算屬性：未過期的有效商品。
   * 過濾掉 ID 出現在 expiredItems 列表中的項目。
   */
  const activeItems = computed(() => {
    // 使用 Set 提高查找效率
    const expiredIds = new Set(expiredItems.value.map(item => item.id));
    return items.value.filter(item => !expiredIds.has(item.id));
  });

  /**
   * 計算屬性：已被選中用於結帳的有效商品。
   */
  const selectedItems = computed(() => activeItems.value.filter(item => item.selected));

  /**
   * 計算屬性：已選中的有效商品的數量。
   */
  const selectedItemCount = computed(() => selectedItems.value.length);

  /**
   * 計算屬性：所有已選中的有效商品的總金額。
   */
  const totalAmount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  );

  /**
   * 計算屬性：用於「全選」複選框的狀態 (針對有效商品)。
   * 包含 getter 和 setter，方便 v-model 綁定。
   */
  const isAllSelected = computed({
    // get：判斷是否所有有效商品都被選中
    get: () => activeItems.value.length > 0 && activeItems.value.every(item => item.selected),
    // set：根據傳入的值 (true/false) 更新所有有效商品的 selected 狀態
    set: (value) => {
      activeItems.value.forEach(item => item.selected = value);
      // 持久化插件會自動處理更新後的 'items' 狀態儲存
    }
  });

  /**
   * 計算屬性：有效購物車內所有商品的總「單位」數量。
   * 會計算選項內的數量及簡單數量。適用於導航欄購物車圖標的計數。
   */
  const itemCount = computed(() => activeItems.value.reduce((sum, item) => {
    if (item.options && item.options.length > 0) {
      // 加總此商品所有選項的數量
      return sum + item.options.reduce((optSum, opt) => optSum + opt.quantity, 0);
    } else if (item.quantity !== undefined) {
      // 加上此商品的簡單數量
      return sum + item.quantity;
    }
    // 如果商品既沒有 options 也沒有 quantity，總數不變
    return sum;
  }, 0));


  /**
   * 計算屬性：所有有效商品的總價格 (無論是否選中)。
   * 可能用於顯示購物車預覽小計。
   */
  const totalPrice = computed(() => {
    return activeItems.value.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  });

  // --- 方法 (Actions) ---
  // 注意：由於使用了 pinia-plugin-persistedstate，對 `items.value` 的修改會被自動持久化。

  /**
   * 根據商品 ID 設定單個商品的選中狀態。
   * @param {string} itemId - 商品 ID。
   * @param {boolean} isSelected - 新的選中狀態。
   */
  function setItemSelection(itemId, isSelected) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      item.selected = isSelected;
    }
  }

  /**
   * 根據商品 ID 切換商品的收藏狀態。
   * @param {string} itemId - 商品 ID。
   */
  function toggleFavorite(itemId) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      item.isFavorite = !item.isFavorite;
    }
  }

  /**
   * 根據商品 ID 從購物車中完全移除單個商品。
   * @param {string} itemId - 要移除的商品 ID。
   */
  function removeFromCart(itemId) {
    items.value = items.value.filter(i => i.id !== itemId);
  }

  /**
   * 移除所有當前被標記為選中的商品。
   * 此操作會檢查 `items` 陣列中的所有項目，可能移除已過期但被選中的商品。
   * 如果只想移除有效的選中商品，應先過濾 `activeItems`。
   */
  function removeSelectedItems() {
    // 1. 獲取當前所有被選中的有效商品並提取這些商品的 ID 到一個 Set 中，方便快速查找。
    const selectedActiveItemIds = new Set(selectedItems.value.map(item => item.id));

    // 3. 過濾原始的 items 陣列：
    //    只保留那些 ID *不* 在 selectedActiveItemIds 集合中的項目。
    //    這樣就能確保：
    //      - 未選中的有效商品被保留。
    //      - 所有過期商品 (無論是否選中) 都被保留。
    //      - 只有被選中的有效商品被移除。
    items.value = items.value.filter(item => !selectedActiveItemIds.has(item.id));
  
    console.log(`移除了 ${selectedActiveItemIds.size} 個選中的有效商品。`);
  }

  /**
   * 更新商品中特定選項的數量。
   * 確保數量不會低於 0。
   * @param {string} itemId - 商品 ID。
   * @param {string} optionType - 選項的類型標識符。
   * @param {number} change - 數量的變化量 (+1 或 -1)。
   */
  function updateOptionQuantity(itemId, optionType, change) {
    const item = items.value.find(i => i.id === itemId);
    // 可選鏈 ?. 避免在 item 或 item.options 為 null/undefined 時出錯
    if (item?.options) {
      const option = item.options.find(opt => opt.type === optionType);
      if (option) {
        const newQuantity = option.quantity + change;
        // 防止數量變為負數
        option.quantity = Math.max(0, newQuantity);
        // 可選：如果一個商品的所有選項數量都變為 0，可以在此處添加移除該商品的邏輯。
      }
    }
  }

  /**
   * 更新具有簡單數量屬性的商品的數量。
   * 確保數量不會低於 0。
   * @param {string} itemId - 商品 ID。
   * @param {number} change - 數量的變化量 (+1 或 -1)。
   */
  function updateSimpleQuantity(itemId, change) {
    const item = items.value.find(i => i.id === itemId);
    // 檢查項目是否存在，不是基於選項的項目，且具有 quantity 屬性
    if (item && !item.options && item.quantity !== undefined) {
      const newQuantity = item.quantity + change;
      // 防止數量變為負數
      item.quantity = Math.max(0, newQuantity);
      // 可選：如果數量變為 0，可以在此處添加移除該商品的邏輯。
    }
  }

  /**
   * 將一個商品添加到購物車。
   * 檢查具有相同 productId 的商品是否已存在。
   * 對於簡單數量的商品進行基本合併；選項合併需要更複雜的邏輯。
   * @param {object} product - 要添加的商品物件 (結構應與購物車項目匹配)。
   */
  function addItem(product) {
    // 使用 productId 檢查是否存在，假設它是產品本身的穩定標識符
    const existingItemIndex = items.value.findIndex(item => item.productId === product.productId);

    if (existingItemIndex > -1) {
      // 購物車中已存在相同 productId 的商品
      const existingItem = items.value[existingItemIndex];
      if (existingItem.quantity !== undefined && product.quantity !== undefined) {
        // 簡單數量：增加現有項目的數量
        existingItem.quantity += (product.quantity || 1); // 如果傳入的 product 沒有 quantity，則默認加 1
      } else if (existingItem.options && product.options) {
        // 基於選項：需要根據業務規則實現複雜的合併邏輯。
        console.warn("合併已存在商品的選項需要具體實作。");
        // 範例：遍歷新商品的選項，更新現有商品中匹配選項的數量？
        product.options.forEach(newOpt => {
            const existingOpt = existingItem.options.find(opt => opt.type === newOpt.type);
            if(existingOpt) {
                existingOpt.quantity += (newOpt.quantity || 0); // 合併數量
            } else {
                // 可選：如果現有商品沒有這個選項類型，是否要添加？
                // existingItem.options.push({...newOpt}); // 深拷貝新選項
            }
        });

      } else {
           // 類型不匹配 (例如：一個有選項，一個沒有)，合併邏輯未定義
           console.warn("無法合併不同類型的項目 (選項 vs 簡單數量)。商品未有效添加/更新。", product);
      }
       // 其他考慮：如果重新添加一個已過期的商品，是否應該使其變為有效？
       // 或者添加操作只應更新數量，不應更改 departureDate 等？
       // 如果商品已過期，重新添加可能需要重置其 selected 狀態？
       // existingItem.selected = true; // 範例：更新或添加時重新選中

    } else {
      // 購物車中未找到此商品，將其作為新項目添加
      // 確保傳入的 'product' 物件包含購物車項目所需的所有欄位
      const newItem = {
        id: product.id || `${product.productId}-${Date.now()}`, // 如果需要，生成唯一 ID
        productId: product.productId,
        name: product.name || '未命名商品',
        details: product.details || '',
        imageUrl: product.imageUrl || null,
        departureDate: product.departureDate || null,
        options: product.options ? JSON.parse(JSON.stringify(product.options)) : undefined, // 深拷貝選項陣列
        quantity: product.quantity,
        pricePerUnit: product.pricePerUnit,
        category: product.category || '',
        selected: true, // 新項目預設為選中
        isFavorite: false, // 新項目預設為非收藏
      };
      items.value.push(newItem);
    }
  }

  /**
   * 根據 ID 陣列從購物車中移除多個商品。
   * 用於 ReconfirmItems.vue 中清除過期商品。
   * @param {string[]} itemIdsToRemove - 要移除的商品 ID 陣列。
   */
  function removeItemsByIds(itemIdsToRemove) {
    if (!Array.isArray(itemIdsToRemove)) {
      console.error("removeItemsByIds 需要一個 ID 陣列作為參數。");
      return;
    }
    const idsSet = new Set(itemIdsToRemove); // 使用 Set 提高查找效率
    items.value = items.value.filter(item => !idsSet.has(item.id));
  }
  /** 從購物車中移除所有已過期的商品。**/
  function clearExpiredItems() {
    // 獲取當前所有過期商品的 ID (依賴於 expiredItems getter)
    const expiredIds = new Set(expiredItems.value.map(item => item.id));

    // 如果確實有過期商品需要清除
    if (expiredIds.size > 0) {
      console.log(`正在清除 ${expiredIds.size} 個過期商品...`);
      // 過濾原始 items 陣列，只保留 ID *不* 在 expiredIds 集合中的項目
      items.value = items.value.filter(item => !expiredIds.has(item.id));
    } else {
      console.log("沒有需要清除的過期商品。");
    }
  }
  watch(() => activeItems.value.length, (newLength, oldLength) => {
    console.log(`有效商品數量變化: ${oldLength} -> ${newLength}`);
    // 條件：當有效商品的新數量變為 0，且舊數量大於 0 時
    // (確保只在從有變為無的那個瞬間觸發)
    if (newLength === 0 && oldLength > 0) {
      console.log("偵測到有效購物車為空，將自動清除過期商品。");
      // 調用清除過期商品的 action
      clearExpiredItems();
    }
  }); 
  // --- 匯出 Store 成員 ---
  // 將狀態、計算屬性 (Getters) 和方法 (Actions) 匯出，供組件使用
  return {
    // State
    items, // 如果需要，可以直接訪問原始 items 陣列，但建議優先使用 Getters

    // Getters
    activeItems,        // 用於顯示主要購物車列表
    expiredItems,       // 用於顯示待確認區塊
    selectedItems,      // 已選中的有效商品列表
    selectedItemCount,  // 已選中的有效商品數量 (用於摘要)
    totalAmount,        // 已選中的有效商品總價 (用於結帳按鈕)
    isAllSelected,      // 用於綁定「全選」複選框
    itemCount,          // 有效購物車中商品總單位數 (用於導航欄計數)
    totalPrice,         // 所有有效商品的總價 (用於可能的導航欄預覽)
    calculateItemTotal, // 如果組件需要單獨計算項目總價，可匯出此輔助函數

    // Actions
    setItemSelection,
    toggleFavorite,
    removeFromCart,
    removeSelectedItems,
    updateOptionQuantity,
    updateSimpleQuantity,
    addItem,
    removeItemsByIds, // 確保匯出此方法
  };
}, {
  // --- Pinia 持久化插件配置 ---
  persist: {
    // 在 localStorage 中儲存購物車數據所使用的鍵名 (Key)。
    key: 'travel_agency_cart', // 建議使用專案特定的名稱
    // 指定儲存媒介：localStorage 或 sessionStorage。
    storage: localStorage,
    // 可選：指定只持久化 store 狀態中的某些部分。
    // 如果省略，則 store 的整個狀態 (在此例中是 'items') 都會被持久化。
    // paths: ['items'], // 如果只想持久化 items，可以取消此行註解
  },
});