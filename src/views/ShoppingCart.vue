<template>
  <div class="cart-page-container">

    <ActiveCartItems v-if="activeItems.length > 0" :items="activeItems" />

    <ReconfirmItems
      v-if="expiredItems.length > 0"
      :items="expiredItems"
      class="reconfirm-component-section"
    />
    <el-empty
      v-if="activeItems.length === 0 && expiredItems.length === 0"
      description="您的購物車是空的"
      :image-size="180"
      class="empty-cart-state"
    >
      <el-button type="primary" @click="goToExplore">前往探索商品</el-button>
    </el-empty>
    <h2 class="recommendations-title">熱門國內行程參考</h2>
    <RecommendedTrips
      :category="dynamicRecommendationCategory"
      class="hot-itineraries-section"
    />
  </div>
</template>

<script setup>
// --- 狀態管理 (Pinia) ---
import { storeToRefs } from 'pinia'; // 導入 Pinia 的輔助函數，用於將 store 中的 state 轉為 ref，保持響應性
import { useCartStore } from '@/stores/ShoppingCart'; // 導入購物車相關的 Pinia store
import { useRouter } from 'vue-router'; // 導入 Vue Router，用於導航
// --- 組件導入 ---
import ActiveCartItems from '@/components/ShoppingCart/ActiveCartItems.vue'; // 導入顯示活動項目的子組件
import ReconfirmItems from '@/components/ShoppingCart/ReconfirmItems.vue'; // 導入顯示待確認項目的子組件
import RecommendedTrips from '@/components/tools/RecommendedTrips.vue'; // 導入顯示推薦行程的子組件


// --- Store 實例與狀態獲取 ---
// 獲取購物車 store 的實例
const cartStore = useCartStore();
// 使用 storeToRefs 將 store 中的狀態 (activeItems, expiredItems, items) 解構為 ref
// 這樣在模板中使用時能保持數據的響應性
// items 可能用於判斷購物車整體狀態，例如是否完全為空
const { activeItems, expiredItems} = storeToRefs(cartStore);

const router = useRouter(); // 獲取路由實例

const goToExplore = () => {
  router.push('/');
};

    const dynamicRecommendationCategory = computed(() => {
      if (activeItems.value.length > 0) {
        const firstItemCategory = activeItems.value[0]?.category;

        // 新增的條件：如果第一個商品的分類是 "客製化旅遊"
        if (firstItemCategory === '客製化旅遊') {
          return "Domestic"; // 則推薦國內行程
        }

        // 如果不是 "客製化旅遊"，且該分類是有效的字串
        if (firstItemCategory && typeof firstItemCategory === 'string' && firstItemCategory.trim() !== '') {
          return firstItemCategory; //則使用該商品的分類
        }
      }
      // 如果購物車為空，或第一個商品的分類無效/為空（且不是 "客製化旅遊"）
      return "Domestic"; // 預設也推薦國內行程
    });
</script>

<style scoped>
/* scoped 樣式只會應用於當前組件的元素 */
.cart-page-container {
  max-width: 1080px; /* 限制最大寬度 */
  margin: 20px auto; /* 上下邊距 20px，左右自動邊距實現水平居中 */
  padding: 0 15px; /* 容器左右內邊距 15px，避免內容緊貼邊緣 */
}
.empty-cart-state {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  padding: 40px 0;
}

.hot-itineraries-section {
  margin-top: 30px;
}

.recommendations-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  margin-top: 30px;
}
</style>
