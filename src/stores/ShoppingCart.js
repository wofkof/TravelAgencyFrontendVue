// src/stores/cart.js
import { defineStore } from 'pinia'; // 從 pinia 導入 defineStore 方法
import { ref, computed, watch } from 'vue'; // 從 vue 導入 ref (用於狀態) 和 computed (用於計算屬性/Getters)
import { v4 as uuidv4 } from 'uuid';

// 使用 setup 函數語法定義購物車 store
export const useCartStore = defineStore('ShoppingCart', () => {

  const items = ref([
    // 原有商品範例 (稍作擴充，假設它是一個簡單行程，無特定航班/住宿細節)
    {
      id: uuidv4(), //uuid
      productId: '1',
      productType: 'GroupTravel',
      destinationCountryCode: 'TW', // 保留
      name: '台北經典三天兩夜探索之旅',
      details: '深入體驗台北魅力：暢遊故宮、登頂101、品嚐夜市小吃、漫步迪化街。包含兩晚市中心舒適住宿與部分景點門票。',
      imageUrl: '/images/tours/taipei-101-skyline.jpg',
      startDate: '2025/08/15', // 用於顯示開始日期
      startDayOfWeek: '五',    // 開始日的星期
      endDate: '2025/08/17',   // 假設是3天2夜，結束日期
      endDayOfWeek: '日',      // 結束日的星期
      totalDays: 3,            // 總天數

      flights: null, // 或留空，或提供一個通用描述
      accommodation: {
        description: '市中心舒適住宿', // 通用描述
        roomType: '標準雙人房',      // 預設房型
        // occupancy 資訊可以從 options 動態生成或在此處預設
      },
      options: [
        { type: '成人', quantity: 1, price: 10000, unitLabel: '佔床' }, // unitLabel 可用於住宿人數描述
        { type: '兒童', quantity: 0, price: 6500, unitLabel: '佔床' },
        { type: '嬰兒', quantity: 0, price: 1000, unitLabel: '不佔床' }
      ],
      category: '國內旅遊',
      selected: true,
      isFavorite: false,
      // --- 原有的 departureDate 可以保留，或者如果 startDate/endDate 更精確，則考慮其用途 ---
      departureDate: '2025/08/15',
    },

    // 澎湖花火節 - 假設可以添加一些通用交通/住宿資訊
    {
      id: uuidv4(), //uuid
      productId: '1',
      productType: 'CustomTravel',
      country: 'TW', // 建議統一使用 destinationCountryCode
      destinationCountryCode: 'TW',
      name: '澎湖國際海上花火節璀璨四日遊',
      details: '限定出發！欣賞壯麗海上花火秀，暢玩吉貝島水上活動、七美雙心石滬，含來回機票、住宿及部分餐食。',
      imageUrl: '/images/tours/penghu-fireworks.jpg',
      startDate: '2025/06/22',
      startDayOfWeek: '二',
      endDate: '2025/06/25', // 4天
      endDayOfWeek: '五',
      totalDays: 4,
      flights: { // 可以是通用描述或實際航班的簡化
        outbound: {
          airline: '立榮郵輪', // 範例
          flightNumber: 'B78888', // 範例
          date: '2025/06/22 (二)',
          departureTime: '09:00',
          departureCity: '台北(松山)',
          arrivalTime: '10:00',
          arrivalCity: '澎湖(馬公)'
        },
        return: {
          airline: '華信郵輪', // 範例
          flightNumber: 'AE333', // 範例
          date: '2025/06/25 (五)',
          departureTime: '17:00',
          departureCity: '澎湖(馬公)',
          arrivalTime: '18:00',
          arrivalCity: '台北(松山)'
        }
      },
      accommodation: {
        description: '澎湖市區精選飯店或同級民宿',
        roomType: '標準雙人房',
        // occupancy 來自 options
      },
      options: [
        { type: '成人', quantity: 1, price: 8400, unitLabel: '佔床' },
        { type: '兒童', quantity: 1, price: 6500, unitLabel: '佔床' },
        { type: '嬰兒', quantity: 1, price: 1500, unitLabel: '不佔床 (含保險)' }
      ],
      category: '國內旅遊',
      selected: true,
      isFavorite: true,
      departureDate: '2025/06/22',
    },

    {
      id: uuidv4(),
      productId: '3', // 新 Product ID
      productType: 'GroupTravel',
      destinationCountryCode: 'JP', // 日本
      name: '夏日紫戀薰衣草北海道～小樽函館山、富良野薰衣草、洞爺湖花火會、三大蟹溫泉香五日', // 截圖標題
      details: '暢遊北海道夏季限定美景：富良野夢幻薰衣草花田、美瑛拼布之路、小樽運河浪漫風情、函館百萬夜景，入住溫泉飯店，品嚐三大蟹料理。', // 補充一些描述
      imageUrl: '/images/tours/hokkaido-hakodate-night.jpg', // 假設這是函館夜景圖 (對應截圖)
      startDate: '2025/06/16',
      startDayOfWeek: '一',
      endDate: '2025/06/20',
      endDayOfWeek: '五',
      totalDays: 5,
      flights: {
        outbound: {
          airline: '星宇郵輪',
          flightNumber: 'JX860',
          date: '2025/06/16 (一)',
          departureTime: '12:00',
          departureCity: '台北(桃園)',
          arrivalTime: '16:45',
          arrivalCity: '函館市'
        },
        return: {
          airline: '星宇郵輪',
          flightNumber: 'JX861',
          date: '2025/06/20 (五)',
          departureTime: '17:45',
          departureCity: '函館市',
          arrivalTime: '20:55',
          arrivalCity: '台北(桃園)'
        }
      },
      accommodation: {
        description: '行程所示之團體飯店', // 截圖文字
        roomType: '預設雙人房',          // 截圖文字
        occupancy: null // 這裡可以留空，因為會從 options 計算 (例如 "成人佔床 X 2")
                        // 或者預設一個值，但優先使用 options 生成的
      },
      options: [
        { type: '成人', quantity: 2, price: 48800, unitLabel: '佔床' }, // 假設2位成人，每位價格
        { type: '兒童佔床', quantity: 0, price: 45800, unitLabel: '佔床' },
        { type: '兒童不佔床', quantity: 0, price: 38800, unitLabel: '不佔床' },
        { type: '嬰兒', quantity: 0, price: 5000, unitLabel: '不佔床 (含稅險)' }
      ],
      category: '國外旅遊',
      selected: true, // 假設預設選中
      isFavorite: false,
      departureDate: '2025/06/16', // 與 startDate 保持一致
    },

    // // 日本東京迪士尼
    // {
    //   id: uuidv4(),
    //   productId: '4',
    //   productType: 'GroupTravel',
    //   country: 'JP', // 建議統一使用 destinationCountryCode
    //   destinationCountryCode: 'JP',
    //   name: '日本東京迪士尼樂園與富士山經典五日遊',
    //   details: '夢幻迪士尼一日暢玩、遠眺富士山絕景、淺草觀音寺祈福、銀座時尚購物，含來回機票與精選酒店。',
    //   imageUrl: '/images/tours/tokyo-disney-fuji.jpg',
    //   startDate: '2025/06/20',
    //   startDayOfWeek: '五',
    //   endDate: '2025/06/24', // 5天
    //   endDayOfWeek: '二',
    //   totalDays: 5,
    //   flights: { // 範例航班資訊
    //     outbound: {
    //       airline: '中華郵輪',
    //       flightNumber: 'CI100',
    //       date: '2025/06/20 (五)',
    //       departureTime: '08:30',
    //       departureCity: '台北(桃園)',
    //       arrivalTime: '12:30',
    //       arrivalCity: '東京(成田)'
    //     },
    //     return: {
    //       airline: '中華郵輪',
    //       flightNumber: 'CI101',
    //       date: '2025/06/24 (二)',
    //       departureTime: '18:00',
    //       departureCity: '東京(成田)',
    //       arrivalTime: '21:00',
    //       arrivalCity: '台北(桃園)'
    //     }
    //   },
    //   accommodation: {
    //     description: '東京市區精選酒店或迪士尼好夥伴飯店',
    //     roomType: '標準雙人房',
    //     // occupancy 來自 options
    //   },
    //   options: [
    //     { type: '成人', quantity: 1, price: 35000, unitLabel: '佔床' },
    //     { type: '兒童', quantity: 1, price: 32000, unitLabel: '佔床' },
    //     { type: '嬰兒', quantity: 1, price: 3000, unitLabel: '不佔床' }
    //   ],
    //   category: '國外旅遊',
    //   selected: false,
    //   isFavorite: true,
    //   departureDate: '2025/06/20',
    // },

    // 花蓮太魯閣 (假設這是巴士團或火車團，無航班資訊)
    {
      id: uuidv4(),
      productId: '5',
      productType: 'GroupTravel',
      country: 'TW', // 建議統一使用 destinationCountryCode
      destinationCountryCode: 'TW',
      name: '花蓮太魯閣峽谷秘境二日遊',
      details: '探索雄偉的太魯閣峽谷，漫步砂卡礑步道，欣賞清水斷崖壯麗海景，夜宿特色民宿。',
      imageUrl: '/images/tours/hualien-taroko.jpg',
      startDate: '2025/04/10',
      startDayOfWeek: '四',
      endDate: '2025/04/11', // 2天
      endDayOfWeek: '五',
      totalDays: 2,
      flights: null, // 無航班資訊
      accommodation: {
        description: '花蓮特色民宿或同級',
        roomType: '標準雙人房',
        // occupancy 來自 options
      },
      options: [
        { type: '成人', quantity: 1, price: 4200, unitLabel: '佔床' },
        { type: '兒童', quantity: 1, price: 3500, unitLabel: '佔床' },
        { type: '嬰兒', quantity: 0, price: 500, unitLabel: '不佔床' }
      ],
      category: '國內旅遊',
      selected: true,
      isFavorite: false,
      departureDate: '2025/04/10', // 已過期日期 (相對於 2025/05/12)
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
      const existingItem = items.value[existingItemIndex];
      // 這裡的合併邏輯基於選項或簡單數量
      if (existingItem.options && product.options) {
        product.options.forEach(newOpt => {
          const existingOpt = existingItem.options.find(opt => opt.type === newOpt.type);
          if (existingOpt) {
            existingOpt.quantity += (newOpt.quantity || 0);
          } else {
            console.warn(`商品 ${existingItem.name} 中不存在選項 ${newOpt.type}，未添加/合併。`);
          }
        });
      } else if (existingItem.quantity !== undefined && product.quantity !== undefined) {
        existingItem.quantity += (product.quantity || 1);
      } else {
        console.warn("addItem: 無法合併不同結構的項目 (選項 vs 簡單數量) 或缺少必要欄位。商品未有效更新。", product);
      }
      existingItem.selected = true;

    } else {
      // 購物車中未找到此商品，將其作為新項目添加
      // 確保傳入的 'product' 物件包含購物車項目所需的所有欄位
      const newItem = {
        id: product.id || uuidv4(), // 使用 uuidv4() 生成唯一 ID，或使用傳入的 product.id
        productId: product.productId, // 後端產品 ID
        productType: product.productType,
        name: product.name || '未命名商品',
        details: product.details || '',
        imageUrl: product.imageUrl || null,
        destinationCountryCode: product.destinationCountryCode,
        startDate: product.startDate,
        startDayOfWeek: product.startDayOfWeek,
        endDate: product.endDate,
        endDayOfWeek: product.endDayOfWeek,
        totalDays: product.totalDays,
        flights: product.flights ? JSON.parse(JSON.stringify(product.flights)) : null,
        accommodation: product.accommodation ? JSON.parse(JSON.stringify(product.accommodation)) : null,

        // 深拷貝選項，確保每個購物車項目的選項是獨立的
        options: product.options ? JSON.parse(JSON.stringify(product.options)) : undefined,
        quantity: product.quantity, // 用於沒有 options 的商品
        pricePerUnit: product.pricePerUnit, // 用於沒有 options 的商品
        category: product.category || '',
        selected: true, // 新項目預設為選中
        isFavorite: false,
        departureDate: product.departureDate, // 確保傳遞 departureDate
        // 確保 product 物件中包含所有 cart item 所需的欄位
      };
      items.value.push(newItem);
    }
  }

  /**
   * 根據商品 ID 從購物車中完全移除單個商品。
   * @param {string} itemId - 要移除的商品 ID。
   */
  function removeFromCart(itemId) { // itemId 這裡會是 UUID
    items.value = items.value.filter(i => i.id !== itemId);
  }

  /**
   * 根據 ID 陣列從購物車中移除多個商品。
   * 用於 ReconfirmItems.vue 中清除過期商品。
   * @param {string[]} itemIdsToRemove - 要移除的商品 ID 陣列。
   */
  function removeItemsByIds(itemIdsToRemove) { // itemIdsToRemove 應為 UUID 陣列
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
    removeItemsByIds,
    clearExpiredItems,
  };
}, {
  // --- Pinia 持久化插件配置 ---
  persist: {
    key: 'travel_agency_cart', // 建議使用專案特定的名稱
    storage: localStorage,
    // 可選：指定只持久化 store 狀態中的某些部分。
    // 如果省略，則 store 的整個狀態 (在此例中是 'items') 都會被持久化。
    // paths: ['items'], // 如果只想持久化 items，可以取消此行註解
  },
});