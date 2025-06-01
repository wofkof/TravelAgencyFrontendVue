// stores/hesitationStore.js
import { defineStore } from 'pinia';
// dayjs 在你提供的原始 store 中並未使用，如果後續需要複雜日期操作可以保留

// 【新增】定義 localStorage 的鍵名，方便管理
const ACTIVATED_HESITATIONS_KEY = 'app_activatedHesitations_Orders'; // 儲存猶豫期訂單列表
const HAS_UNSEEN_HESITATION_NOTIFICATION_KEY = 'app_hasUnseenHesitationNotification'; // 儲存紅點提示狀態

export const useHesitationStore = defineStore('hesitation', {
  state: () => ({
    /**
     * 儲存已啟動猶豫期的訂單及其固定的到期時間
     * 格式: { orderId1: 'iso_timestamp_string', orderId2: 'iso_timestamp_string' }
     */
    activatedHesitations: {}, // 將由 loadPersistentState 初始化
    /**
     * 是否有尚未被用戶在 OrderHistory 頁面“查看”過的猶豫期訂單通知
     * 用於控制會員中心紅點提示
     */
    hasUnseenNotification: false, // 將由 loadPersistentState 初始化
  }),
  actions: {
    /**
     * 【新增】在應用或 Store 初始化時調用，從 localStorage 加載持久化狀態
     */
    loadPersistentState() {
      const storedActivated = localStorage.getItem(ACTIVATED_HESITATIONS_KEY);
      if (storedActivated) {
        try {
          this.activatedHesitations = JSON.parse(storedActivated);
        } catch (e) {
          console.error('[HesitationStore] Error parsing activatedHesitations from localStorage:', e);
          this.activatedHesitations = {}; // 解析失敗則重置
          localStorage.removeItem(ACTIVATED_HESITATIONS_KEY); // 清除損壞的數據
        }
      } else {
        this.activatedHesitations = {}; // 如果 localStorage 沒有，則為空對象
      }

      const storedUnseen = localStorage.getItem(HAS_UNSEEN_HESITATION_NOTIFICATION_KEY);
      // 只有當 localStorage 標記為 true 且確實還有活躍的猶豫期訂單時，才恢復紅點提示
      if (storedUnseen === 'true' && Object.keys(this.activatedHesitations).length > 0) {
        this.hasUnseenNotification = true;
      } else {
        this.hasUnseenNotification = false;
        // 如果沒有活躍的猶豫期訂單，即使 localStorage 說有未讀，也清除標記
        localStorage.removeItem(HAS_UNSEEN_HESITATION_NOTIFICATION_KEY);
      }
      console.log('[HesitationStore] Loaded persistent state:', { 
        activated: Object.keys(this.activatedHesitations).length, 
        unseen: this.hasUnseenNotification 
      });
    },

    /**
     * 【輔助】保存 activatedHesitations 到 localStorage
     */
    _saveActivatedHesitations() {
      localStorage.setItem(ACTIVATED_HESITATIONS_KEY, JSON.stringify(this.activatedHesitations));
    },

    /**
     * 當用戶首次離開 OrderForm 或 OrderPayment 前往其他頁面時調用。
     * @param {string | number} orderId 訂單 ID
     * @param {string} currentExpiresAt 訂單當前 props.order.expiresAt 的值 (ISO String)
     */
    startHesitationCountdown(orderId, currentExpiresAt) {
      if (!orderId || !currentExpiresAt) {
        console.warn('[HesitationStore] startHesitationCountdown: 無效的 orderId 或 currentExpiresAt.');
        return;
      }
      
      const orderIdStr = String(orderId); // 確保 orderId 是字串 key

      // 檢查是否是新的猶豫期，或者到期時間是否有更新
      // 如果訂單已存在且到期時間相同，可能不需要重新觸發紅點（除非它已被看過）
      const isNewOrUpdatedHesitation = !this.activatedHesitations[orderIdStr] || this.activatedHesitations[orderIdStr] !== currentExpiresAt;

      if (isNewOrUpdatedHesitation) {
        console.log(`[HesitationStore] Starting/Updating hesitation for order ${orderIdStr} with expiry ${currentExpiresAt}`);
        this.activatedHesitations[orderIdStr] = currentExpiresAt;
        this._saveActivatedHesitations();
      } else {
        console.log(`[HesitationStore] Hesitation for order ${orderIdStr} already active with the same expiry ${this.activatedHesitations[orderIdStr]}`);
      }
      
      // 【修改】👇 無論是新增還是更新已存在的猶豫期訂單（例如用戶來回切換頁面重新觸發），都標記為有未查看通知
      // 只要 activatedHesitations 中有任何訂單，就應該有潛在的通知需求，直到被 markNotificationAsSeen
      if (Object.keys(this.activatedHesitations).length > 0) {
          if(!this.hasUnseenNotification) { // 只有在當前沒有紅點時才重新設置並保存，避免不必要的localStorage寫入
            this.hasUnseenNotification = true;
            localStorage.setItem(HAS_UNSEEN_HESITATION_NOTIFICATION_KEY, 'true');
            console.log(`[HesitationStore] Set hasUnseenNotification to true for order ${orderIdStr}.`);
          }
      }
    },

    /**
     * 獲取訂單應該使用的到期時間。
     * 如果猶豫期已啟動，則返回記錄的固定到期時間；否則返回 null。
     * @param {string | number} orderId 訂單 ID
     * @returns {string | null} ISO 格式的時間戳字串或 null
     */
    getEffectiveExpiresAt(orderId) {
      return this.activatedHesitations[String(orderId)] || null;
    },

    /**
     * 清除特定訂單的猶豫期狀態。
     * 例如訂單完成、取消或後端服務確認已過期時調用。
     * @param {string | number} orderId 訂單 ID
     */
    clearHesitation(orderId) {
      const orderIdStr = String(orderId);
      if (this.activatedHesitations[orderIdStr]) {
        console.log(`[HesitationStore] Clearing hesitation for order ${orderIdStr}`);
        delete this.activatedHesitations[orderIdStr];
        this._saveActivatedHesitations();

        // 如果清除了所有猶豫期訂單，則也清除未查看通知狀態
        if (Object.keys(this.activatedHesitations).length === 0) {
          this.hasUnseenNotification = false;
          localStorage.removeItem(HAS_UNSEEN_HESITATION_NOTIFICATION_KEY);
          console.log('[HesitationStore] All hesitating orders cleared, unseen notification removed.');
        }
      }
    },

    /**
     * 【新增】當用戶訪問訂單管理頁面時調用，用於清除紅點提示。
     */
    markNotificationAsSeen() {
      if (this.hasUnseenNotification) {
        console.log('[HesitationStore] Marking hesitation notification as seen.');
        this.hasUnseenNotification = false;
        localStorage.removeItem(HAS_UNSEEN_HESITATION_NOTIFICATION_KEY);
      }
    }
  },
  getters: {
    /**
     * 【新增】提供給 UI 組件判斷是否顯示紅點。
     * 只有當 hasUnseenNotification 為 true 且確實還有活躍的猶豫期訂單時才返回 true。
     */
    shouldShowHesitationNotification(state) {
      return state.hasUnseenNotification && Object.keys(state.activatedHesitations).length > 0;
    }
  }
});