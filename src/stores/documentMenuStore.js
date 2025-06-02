// src/stores/documentMenuStore.js
import { defineStore } from 'pinia';
import api from '@/utils/api'; // 請確保這個路徑與你的 axios 實例路徑正確

export const useDocumentMenuStore = defineStore('documentMenu', {
  state: () => ({
    // 這將保存從 API 抓取到的所有文件選單項目陣列。
    // 它會被抓取一次，然後由各個元件重複使用。
    allDocumentMenus: [],
    
    // 這將保存目前選定的文件選單項目。
    // 當使用者點擊「選擇」時，NewChangeup.vue 會更新此項目。
    selectedDocumentMenuItem: null, 
    
    // 主要抓取操作的載入和錯誤狀態
    loading: false,
    error: null,
  }),
  
  getters: {
    // 一個 Getter，可以根據 ID 輕鬆地檢索特定文件。
    // 當元件需要特定項目但 `selectedDocumentMenuItem` 中沒有時會很有用。
    getDocumentMenuById: (state) => (id) => {
      // 確保 ID 被解析為整數，以便在 menuId 為數字時進行嚴格比較
      return state.allDocumentMenus.find(item => item.menuId === parseInt(id));
    },
    
    // 一個 Getter，用於檢查資料是否已載入，以避免重複抓取。
    isDataLoaded: (state) => state.allDocumentMenus.length > 0,
  },
  
  actions: {
    // Action 用於從 API 抓取所有文件選單資料。
    // 這最好只被呼叫一次，例如在主要的 VisaView 元件載入時。
    async fetchAllDocumentMenus() {
      // 如果資料已經載入且之前沒有發生錯誤，則阻止重新抓取。
      if (this.isDataLoaded && !this.error) {
        console.log('文件選單資料已在 Store 中載入。跳過抓取。');
        return;
      }

      this.loading = true;
      this.error = null;
      try {
        const response = await api.get('/DocumentMenu'); // 你的 API 呼叫
        if (response.data) {
          this.allDocumentMenus = response.data;
        } else {
          this.allDocumentMenus = []; // 確保如果沒有資料，它是一個空陣列
        }
      } catch (err) {
        this.error = '無法載入文件選單資料。';
        console.error('抓取所有文件選單時發生錯誤:', err);
      } finally {
        this.loading = false;
      }
    },

    // Action 用於設定目前選定的文件選單項目。
    // 當使用者進行選擇時，NewChangeup.vue 會呼叫此 Action。
    setSelectedDocumentMenuItem(document) {
      this.selectedDocumentMenuItem = document;
    },

    // 此 Action 可由 VisainDetail.vue (或其他詳細資訊元件) 使用，
    // 以確保選定的項目可用，特別是在直接透過 URL 存取/重新整理時。
    async ensureSelectedDocumentMenuItem(id) {
        // 如果已經選定項目且與 ID 匹配，則無需重新抓取/查找。
        if (this.selectedDocumentMenuItem && this.selectedDocumentMenuItem.menuId === parseInt(id)) {
            return;
        }

        // 如果 allDocumentMenus 尚未載入，則抓取它。
        if (!this.isDataLoaded) {
            await this.fetchAllDocumentMenus();
        }

        // 現在嘗試從已載入的資料中查找項目。
        this.selectedDocumentMenuItem = this.getDocumentMenuById(id) || null;
        
        if (!this.selectedDocumentMenuItem) {
            console.warn(`找不到 ID 為 ${id} 的文件選單項目。`);
            // 如果項目是關鍵的，你可能需要在這裡設定錯誤狀態或重新導向。
        }
    }
  },
});