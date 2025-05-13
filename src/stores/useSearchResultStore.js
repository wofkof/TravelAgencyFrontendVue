// stores/useSearchResultStore.js
import { defineStore } from 'pinia';

export const useSearchResultStore = defineStore('searchResult', {
  state: () => ({
    searchInput: null,      // 儲存使用者送出的搜尋條件
    searchResult: [],       // 儲存從後端回傳的搜尋結果
  }),
});
