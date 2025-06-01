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
  const items = ref([
    // 範例商品：官方團體旅遊
    {
      id: uuidv4(),
      productId: '1',
      productType: 'GroupTravel',
      destinationCountryCode: 'TW',
      name: '台北經典三天兩夜探索之旅',
      details: '深入體驗台北魅力：暢遊故宮、登頂101、品嚐夜市小吃、漫步迪化街。包含兩晚市中心舒適住宿與部分景點門票。',
      imageUrl: '/images/tours/taipei-101-skyline.jpg',
      startDate: '2025-08-20',
      endDate: '2025-08-22',
      totalDays: 3,
      departureDate: '2025-08-20',
      flights: null,
      accommodation: {
        description: '市中心舒適住宿',
        roomType: '標準雙人房',
      },
      options: [
        { type: '成人', quantity: 1, price: 10000, unitLabel: '佔床' },
        { type: '兒童', quantity: 0, price: 6500, unitLabel: '佔床' },
        { type: '嬰兒', quantity: 0, price: 1000, unitLabel: '不佔床' }
      ],
      category: '國內旅遊',
      selected: true,
      isFavorite: false,
      productSpecificData: { internalCode: 'TPE001-G' }
    },

    // --- 修改後的客製化旅遊範例 ---
    {
      id: uuidv4(), // 購物車項目的唯一 ID
      productId: '1', // 更真實的客製化行程產品 ID (例如 "CT_" + customTravelId + "_MEMBER" + memberId)
      productType: 'CustomTravel',
      name: '我的夏日沖繩七日遊', // 來自前端的 itemFromList.title (原 Note)
      details: '會員自訂行程 - 我的夏日沖繩七日遊. 共 7 天, 2 人參與.', // 根據前端格式
      imageUrl: '/images/tours/custom-default.jpg', // 前端使用的預設圖片
      destinationCountryCode: 'CUSTOM', // 前端設定的值

      startDate: '2025-07-10', // 範例日期
      endDate: '2025-07-16',     // 範例日期
      totalDays: 7,              // 範例天數
      departureDate: '2025-07-10', // 同 startDate

      flights: null, // 前端設定為 null
      accommodation: { description: '依客製化需求安排' }, // 前端設定的描述

      options: [
        {
          type: '客製化專案',
          quantity: 1, // 固定為 1
          price: 60000, // 範例總價
          unitLabel: '總計 (2人)' // 根據前端格式 (假設2人)
        }
      ],
      category: '客製化旅遊', // 前端設定的值
      selected: true,        // 預設選中
      isFavorite: false,       // 預設未收藏
      productSpecificData: {
        memberId: 77, // 範例會員 ID
        people: 2,    // 範例人數
        originalNote: '我的夏日沖繩七日遊', // 同 name
        dailyActivities: [ // 範例每日活動，或保持空陣列 []
          { day: 1, time: '10:00', itemId: 'OKINAWA_BEACH_001', category: '景點', accommodationName: '海濱飯店A' },
          { day: 1, time: '19:00', itemId: 'OKINAWA_RESTAURANT_002', category: '餐飲', accommodationName: null },
          { day: 2, time: '全天', itemId: 'OKINAWA_AQUARIUM_003', category: '景點', accommodationName: '海濱飯店A' }
        ]
      }
    },
  ]);


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
        console.warn("addItem: 無法合併不同結構的項目或缺少必要數量欄位。商品未有效更新。", productToAdd);
      }
      existingItem.selected = true; // 合併後也將其設為選中
    } else {
      const newItem = {
        id: uuidv4(),
        productId: productToAdd.productId,
        productType: productToAdd.productType,
        name: productToAdd.name || '未命名商品',
        details: productToAdd.details || '',
        imageUrl: productToAdd.imageUrl || null,
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