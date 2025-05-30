// stores/hesitationStore.js
import { defineStore } from 'pinia';
import dayjs from 'dayjs';

export const useHesitationStore = defineStore('hesitation', {
    state: () => ({
    /**
     * 儲存已啟動猶豫期的訂單及其固定的到期時間
     * 格式: { orderId1: 'iso_timestamp_string', orderId2: 'iso_timestamp_string' }
     */
    activatedHesitations: {},
  }),
  actions: {
    /**
     * 當用戶首次離開 OrderForm 或 OrderPayment 前往其他頁面時調用。
     * @param {string} orderId 訂單 ID
     * @param {string} currentExpiresAt 訂單當前 props.order.expiresAt 的值
     */
    startHesitationCountdown(orderId, currentExpiresAt) {
      if (!orderId || !currentExpiresAt) return;

      // 只有當該訂單的猶豫期尚未被啟動時，才記錄其到期時間
      if (!this.activatedHesitations[orderId]) {
        console.log(`[HesitationStore] Starting hesitation for order ${orderId} with expiry ${currentExpiresAt}`);
        this.activatedHesitations[orderId] = currentExpiresAt;
      } else {
        console.log(`[HesitationStore] Hesitation for order ${orderId} already started with expiry ${this.activatedHesitations[orderId]}`);
      }
    },
    /**
     * 獲取訂單應該使用的到期時間。
     * 如果猶豫期已啟動，則返回記錄的固定到期時間；否則返回 null。
     * @param {string} orderId 訂單 ID
     * @returns {string | null} ISO 格式的時間戳字串或 null
     */
    getEffectiveExpiresAt(orderId) {
        return this.activatedHesitations[orderId] || null;
    },
    // 可能需要一個清除方法，例如訂單完成或取消時
    clearHesitation(orderId) {
    if (this.activatedHesitations[orderId]) {
        console.log(`[HesitationStore] Clearing hesitation for order ${orderId}`);
        delete this.activatedHesitations[orderId];
    }
    }
},
  // 如果希望猶豫期狀態在頁面刷新後依然保留，可以考慮使用 pinia-plugin-persistedstate
  // persist: true, // 需要安裝和配置 pinia-plugin-persistedstate
});