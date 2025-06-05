// src/stores/cart.js
import { defineStore } from 'pinia'; // 從 pinia 導入 defineStore 方法
import { ref, computed, watch } from 'vue'; // 從 vue 導入 ref (用於狀態) 和 computed (用於計算屬性/Getters)
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/zh-tw';

dayjs.extend(customParseFormat);
dayjs.locale('zh-tw');

const formatDateToStore = (dateInput) => {
  if (!dateInput || typeof dateInput !== 'string') { // 增加對非字串的檢查
    console.warn(`[CartStore] formatDateToStore: 輸入不是有效字串或為空:`, dateInput);
    return null;
  }

  console.log(`[CartStore] formatDateToStore - 正在嘗試格式化: "${dateInput}"`);

  // 嘗試解析特定中文格式 'YYYY年MM月DD日'
  // 即使導入了 locale，有時明確在解析時指定 locale 和 strict true 更有幫助
  let d = dayjs(dateInput, 'YYYY年MM月DD日', 'zh-tw', true); 

  if (!d.isValid()) {
    // 如果特定格式解析失敗，嘗試 dayjs 的默認解析（能處理 ISO, YYYY-MM-DD 等）
    console.log(`[CartStore] formatDateToStore - 中文格式解析失敗，嘗試 Day.js 默認解析: "${dateInput}"`);
    d = dayjs(dateInput);
  }
  
  if (d.isValid()) {
    const formattedDate = d.format('YYYY-MM-DD');
    console.log(`[CartStore] formatDateToStore - 解析成功，輸出: "${formattedDate}" (來自 "${dateInput}")`);
    return formattedDate;
  }

  // 如果所有嘗試都失敗
  console.warn(`[CartStore] formatDateToStore - 無效的日期輸入，最終無法格式化: "${dateInput}"`);
  return null; 
};

// 使用 setup 函數語法定義購物車 store
export const useCartStore = defineStore('ShoppingCart', () => {
  const items = ref([]);


  // --- 計算屬性 (Getters) ---

  /**
  * 計算單個購物車項目總價的輔助函數。
  */
  const calculateItemTotal = (item) => {
    if (item.options && item.options.length > 0) {
      return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
    } else if (item.quantity !== undefined && item.pricePerUnit !== undefined) {
      return item.pricePerUnit * item.quantity;
    }
    return 0;
  };

  const expiredItems = computed(() => {
    const today = dayjs().startOf('day'); // 使用 dayjs 獲取今天的開始
    return items.value.filter(item => {
      if (!item.departureDate) return false;
      const departure = dayjs(item.departureDate);
      if (!departure.isValid()) {
        console.warn(`項目 ${item.id} 的 departureDate 格式無效: ${item.departureDate}`);
        return false;
      }
      return departure.isBefore(today);
    });
  });

  const activeItems = computed(() => {
    const expiredIds = new Set(expiredItems.value.map(item => item.id));
    return items.value.filter(item => !expiredIds.has(item.id));
  });

  const selectedItems = computed(() => activeItems.value.filter(item => item.selected));
  const selectedItemCount = computed(() => selectedItems.value.length);
  const totalAmount = computed(() =>
    selectedItems.value.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  );

  const isAllSelected = computed({
    get: () => activeItems.value.length > 0 && activeItems.value.every(item => item.selected),
    set: (value) => {
      activeItems.value.forEach(item => item.selected = value);
    }
  });

  const itemCount = computed(() => activeItems.value.length);

  const totalPrice = computed(() => {
    return activeItems.value.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  });


  // --- 方法 (Actions) ---

  function addItem(productToAdd) {
    console.log('[CartStore] addItem - 接收到的 productToAdd:', JSON.parse(JSON.stringify(productToAdd)));

    const formattedStartDate = formatDateToStore(productToAdd.startDate);
    const formattedEndDate = formatDateToStore(productToAdd.endDate);
    const formattedDepartureDate = formatDateToStore(productToAdd.departureDate);

    // 【關鍵檢查】如果任何一個必要的日期格式化失敗，則不添加商品並提示錯誤
    if (formattedStartDate === null || formattedEndDate === null || formattedDepartureDate === null) {
        console.error('[CartStore] addItem - 日期格式化失敗，至少一個關鍵日期為 null。無法添加商品:', {
            startDate: productToAdd.startDate, fStartDate: formattedStartDate,
            endDate: productToAdd.endDate, fEndDate: formattedEndDate,
            departureDate: productToAdd.departureDate, fDepartureDate: formattedDepartureDate
        });
        ElMessage.error('加入購物車失敗：商品日期資訊不正確。');
        return; // 中止添加
    } 
    const existingItem = items.value.find(
      item => item.productId === productToAdd.productId &&
              item.startDate === formattedStartDate 
    );

    if (existingItem) {
        // 商品已存在 (相同 productId 和相同 startDate)，合併數量
        if (existingItem.options && productToAdd.options) {
            productToAdd.options.forEach(newOpt => {
                const existingOpt = existingItem.options.find(opt => opt.type === newOpt.type);
                if (existingOpt) {
                    existingOpt.quantity += (newOpt.quantity || 0);
                } else {
                    existingItem.options.push({ ...newOpt });
                    console.warn(`商品 ${existingItem.name} 中原無選項 ${newOpt.type}，已新增該選項並合併數量。`);
                }
            });
        } else if (existingItem.quantity !== undefined && productToAdd.quantity !== undefined) {
            existingItem.quantity += (productToAdd.quantity || 0);
        } else {
            console.warn("addItem: 無法合併不同結構的項目或缺少必要數量欄位 (商品已存在但結構不符)。商品未有效更新。", productToAdd);
        }
        existingItem.selected = true; // 合併後也將其設為選中
    } else {
        // 商品不存在於購物車中，新增此商品

        // --- 正確的位置：為新商品設定預設圖片 ---
        let determinedImageUrl = productToAdd.imageUrl || null; // 先嘗試使用傳入的 imageUrl

        // 檢查 productType 是否為「會員自訂行程」的特定類型 (假設是 'CustomTravel')
        // 並且 determinedImageUrl 仍然是 null 或空 (falsy)
        if (productToAdd.productType === 'CustomTravel' && !determinedImageUrl) {
            determinedImageUrl = '/images/customtravel.png'; // 為「會員自訂行程」指定預設圖片
        }
        // (可選) 如果其他類型的商品也沒有圖片，可以給一個更通用的預設圖片
        else if (!determinedImageUrl) {
            determinedImageUrl = '/images/customtravel.png'; // 通用預設圖片
        }
    const newItem = {
        id: uuidv4(),
        productId: productToAdd.productId,
        productType: productToAdd.productType,
        name: productToAdd.name || '未命名商品',
        details: productToAdd.details || '',
        imageUrl: determinedImageUrl,
        destinationCountryCode: productToAdd.destinationCountryCode,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        departureDate: formattedDepartureDate,
        //startDayOfWeek: productToAdd.startDayOfWeek, 
        //endDayOfWeek: productToAdd.endDayOfWeek, 
        totalDays: productToAdd.totalDays,
        flights: productToAdd.flights ? JSON.parse(JSON.stringify(productToAdd.flights)) : null,
        accommodation: productToAdd.accommodation ? JSON.parse(JSON.stringify(productToAdd.accommodation)) : null,
        options: productToAdd.options ? JSON.parse(JSON.stringify(productToAdd.options)) : undefined,
        quantity: productToAdd.options ? undefined : (productToAdd.quantity || 0),
        pricePerUnit: productToAdd.options ? undefined : (productToAdd.pricePerUnit || 0),
        category: productToAdd.category || '',
        selected: true,
        isFavorite: productToAdd.isFavorite || false,
        productSpecificData: productToAdd.productSpecificData ? JSON.parse(JSON.stringify(productToAdd.productSpecificData)) : null,
      };
      items.value.push(newItem);
    }
  }

  function setItemSelection(itemId, isSelected) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      item.selected = isSelected;
    }
  }

  function toggleFavorite(itemId) {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      item.isFavorite = !item.isFavorite;
    }
  }

  function removeSelectedItems() {
    const selectedActiveItemIds = new Set(selectedItems.value.map(item => item.id));
    items.value = items.value.filter(item => !selectedActiveItemIds.has(item.id));
    console.log(`移除了 ${selectedActiveItemIds.size} 個選中的有效商品。`);
  }

  function updateOptionQuantity(itemId, optionType, change) {
    const item = items.value.find(i => i.id === itemId);
    if (item?.options) {
      const option = item.options.find(opt => opt.type === optionType);
      if (option) {
        const newQuantity = option.quantity + change;
        option.quantity = Math.max(0, newQuantity);
      }
    }
  }

  function updateSimpleQuantity(itemId, change) {
    const item = items.value.find(i => i.id === itemId);
    if (item && !item.options && item.quantity !== undefined) {
      const newQuantity = item.quantity + change;
      item.quantity = Math.max(0, newQuantity);
    }
  }
  
  function removeFromCart(itemId) {
    items.value = items.value.filter(i => i.id !== itemId);
  }

  function removeItemsByIds(itemIdsToRemove) {
    if (!Array.isArray(itemIdsToRemove)) {
      console.error("removeItemsByIds 需要一個 ID 陣列作為參數。");
      return;
    }
    const idsSet = new Set(itemIdsToRemove);
    items.value = items.value.filter(item => !idsSet.has(item.id));
  }

  function clearExpiredItems() {
    const expiredIds = new Set(expiredItems.value.map(item => item.id));
    if (expiredIds.size > 0) {
      console.log(`正在清除 ${expiredIds.size} 個過期商品...`);
      items.value = items.value.filter(item => !expiredIds.has(item.id));
    } else {
      console.log("沒有需要清除的過期商品。");
    }
  }

  watch(() => activeItems.value.length, (newLength, oldLength) => {
    console.log(`有效商品數量變化: ${oldLength} -> ${newLength}`);
    if (newLength === 0 && oldLength > 0) {
      console.log("偵測到有效購物車為空，將自動清除過期商品。");
      clearExpiredItems();
    }
  });


  // --- 匯出 Store 成員 ---
  return {
    items,
    activeItems,
    expiredItems,
    selectedItems,
    selectedItemCount,
    totalAmount,
    isAllSelected,
    itemCount,
    totalPrice,
    calculateItemTotal,
    setItemSelection,
    toggleFavorite,
    removeFromCart,
    removeSelectedItems,
    updateOptionQuantity,
    updateSimpleQuantity,
    addItem,
    removeItemsByIds,
    clearExpiredItems,
  };
}, {
  persist: {
    key: 'travel_agency_cart',
    storage: localStorage,
  },
})