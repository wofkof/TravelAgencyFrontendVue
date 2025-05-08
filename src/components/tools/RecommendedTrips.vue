<template>
    <div class="recommended-trips-section">
      <h3 class="section-title">為您推薦行程</h3>
      <div class="carousel-navigation-wrapper">
        <el-button
          class="carousel-arrow left-arrow"
          @click="scrollHorizontal(-1)"
          :icon="ArrowLeftBold"
          circle
          v-show="!isAtStart"
          title="上一頁"
        />
        <div class="carousel-container">
          <el-scrollbar ref="scrollbarRef" view-class="scrollbar-view" class="hide-native-scrollbar">
            <div class="trips-wrapper">
              <div v-for="trip in trips" :key="trip.id" class="trip-card-item">
                <el-card :body-style="{ padding: '0px' }" shadow="hover" class="trip-el-card">
                  <div class="trip-image-container">
                    <img :src="trip.imageUrl || '/img/placeholder.png'" class="trip-image" :alt="trip.destinationName || trip.name" />
                    <div class="destination-overlay">
                      <span class="destination-name">{{ trip.destinationName || '熱門目的地' }}</span>
                    </div>
                    <div class="image-actions">
                      <el-tooltip :content="trip.isFavorite ? '取消收藏' : '加入收藏'" placement="top">
                        <el-button
                          :type="trip.isFavorite ? 'danger' : ''"
                          circle
                          plain
                          size="small"
                          @click="toggleFavorite(trip)"
                          class="action-button favorite-button">
                          <FavoriteIcon :isFavorite="trip.isFavorite" size="16" />
                        </el-button>
                      </el-tooltip>
                      </div>
                    </div>
                  <div class="trip-content">
                    <h4 class="trip-name" :title="trip.name">{{ trip.name }}</h4>
                    <div class="trip-meta travel-info">
                      <span v-if="trip.travelDays" class="meta-item">
                        <el-icon :size="14"><Calendar /></el-icon>
                        {{ trip.travelDays }}天
                      </span>
                      <span v-if="trip.airline" class="meta-item">
                        <el-icon :size="14"><Plane /></el-icon>
                        {{ trip.airline }}
                      </span>
                    </div>
                    <p class="trip-features" :title="trip.details || trip.features">
                      {{ trip.details || trip.features || '暫無詳細規格' }}
                    </p>
                    <div class="trip-footer-elements">
                      <div class="trip-price-container">
                        <span class="price-label">TWD</span>
                        <span class="trip-price">{{ trip.price.toLocaleString() }}</span>
                        <span class="price-suffix">人起</span>
                      </div>
                      <div class="trip-actions">
                        <router-link :to="`/product/${trip.id}`" class="details-link">
                          <el-button type="primary" plain class="details-button">查看此行程</el-button>
                        </router-link>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <el-button
          class="carousel-arrow right-arrow"
          @click="scrollHorizontal(1)"
          :icon="ArrowRightBold"
          circle
          v-show="!isAtEnd"
          title="下一頁"
        />
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'; // 從 Element Plus Icons Vue 導入需要的圖標
import {
  ArrowLeftBold,
  ArrowRightBold,
  Calendar,
  Share,
} from '@element-plus/icons-vue';
import FavoriteIcon from '@/components/tools/FavoriteIcon.vue';
// 假設一個全局的 Cart Store 或 Product Store 來處理收藏狀態
// import { useProductStore } from '@/stores/product'; // 範例


// --- 行程數據 (範例，請確保包含新欄位) ---
const trips = ref([
  // 調整範例數據以包含新欄位
  { id: 'trip1', destinationName: '阿里山', name: '阿里山日出雲海與奮起湖懷舊二日精緻遊覽探索體驗', travelDays: 2, airline: '國光客運', features: '含專業導遊、小火車體驗、特色民宿住宿', price: 2800, imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqscdfzyoHE9jZuW5SYNrKK7H-CDZOic7DwA&s", isFavorite: false},
  { id: 'trip2', destinationName: '澎湖', name: '澎湖吉貝島水上活動無限暢玩與海洋牧場三日遊', travelDays: 3, airline: '立榮航空', features: '七合一水上活動、海鮮BBQ、機加酒', price: 5500, imageUrl: 'https://images.steamusercontent.com/ugc/929305561999670106/FF6E82614700452D6D005403BEE2DD5C12312196/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false', isFavorite: false},
  { id: 'trip3', destinationName: '東京', name: '東京迪士尼樂園/迪士尼海洋一日門票 (電子票)', travelDays: 1, airline: '自理', features: '免排隊購票、多種票券選擇、即買即用', price: 2200, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: true},
  { id: 'trip4', destinationName: '京都', name: '京都清水寺、金閣寺、嵐山經典古都一日遊', travelDays: 1, airline: 'JR列車', features: '中文導遊、和服體驗加購、抹茶品嚐', price: 3800, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: true},
  { id: 'trip5', destinationName: '宜蘭', name: '宜蘭龜山島登島賞鯨豚繞島三合一體驗半日遊', travelDays: 0.5, airline: '賞鯨船', features: '專業解說、見證龜山八景、含船票保險', price: 900, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: true},
  { id: 'trip6', destinationName: '首爾', name: '韓國首爾景福宮韓服體驗與N首爾塔夜景一日遊', travelDays: 1, airline: '地鐵', features: '多款韓服選擇、專業攝影、市區接送', price: 2600, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: true},
  { id: 'trip7', destinationName: '花蓮', name: '花蓮太魯閣峽谷奇景探秘一日遊 (拼車或包車)', travelDays: 1, airline: '觀光巴士', features: '燕子口、九曲洞、長春祠、七星潭', price: 1500, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: true},
  { id: 'trip8', destinationName: '台南', name: '台南府城慢活古蹟美食探索二日自由行 (含高鐵)', travelDays: 2, airline: '台灣高鐵', features: '赤崁樓、安平古堡、國華街小吃、文創旅宿', price: 4200, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: false},
  { id: 'trip9', destinationName: '曼谷', name: '曼谷丹嫩莎朵水上市場與美功鐵道市集經典一日遊', travelDays: 1, airline: '空調小巴', features: '含船票、手搖船體驗、火車進站奇觀', price: 1350, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: false},
  { id: 'trip10', destinationName: '日月潭', name: '日月潭纜車票、遊船、自行車環湖一日暢遊套票', travelDays: 1, airline: '自駕/客運', features: '水陸空三種視角體驗、九族文化村加購', price: 1100, imageUrl: 'https://media1.giphy.com/media/dnSDhYT5Y9a7yvtwmU/source.gif', isFavorite: false},
]);

// --- 滾動邏輯 (與之前類似，但 scrollAmount 可能需要調整) ---
const scrollbarRef = ref(null);
const scrollPosition = ref(0);
const cardWidth = ref(220 + 20);     // 卡片實際渲染寬度 (含 margin/gap)
const visibleCards = 4;              // 希望一次顯示的卡片數量

// const productStore = useProductStore(); // 如果收藏狀態由 store 管理

// // --- 切換收藏狀態的方法 ---
// const toggleFavorite = (trip) => {
//   trip.isFavorite = !trip.isFavorite;
//   // 如果收藏狀態需要持久化或與後端同步，在這裡調用 store action
//   // 例如：productStore.updateFavoriteStatus(trip.id, trip.isFavorite);
//   console.log(`行程 ${trip.name} 的收藏狀態變為: ${trip.isFavorite}`);
// };

// 判斷是否滾動到最左端
const isAtStart = computed(() => scrollPosition.value < cardWidth.value / 2); // 小於半個卡片寬度就算最左
// 判斷是否滾動到最右端
const isAtEnd = computed(() => {
  if (!scrollbarRef.value || !scrollbarRef.value.wrapRef) return true;
  const scrollableWidth = scrollbarRef.value.wrapRef.scrollWidth;
  const containerWidth = scrollbarRef.value.wrapRef.clientWidth;
  // 當 (可滾動總寬度 - 目前已滾動距離) 小於 (容器可見寬度 + 半個卡片寬度) 時，視為接近或到達最右端
  return (scrollableWidth - scrollPosition.value) < (containerWidth + cardWidth.value / 2);
});

const scrollHorizontal = (direction) => {
  if (!scrollbarRef.value || !scrollbarRef.value.wrapRef) return;
  const scrollAmount = cardWidth.value * 1; // 每次滾動一張卡片的寬度
  let newScrollLeft = scrollPosition.value + (scrollAmount * direction);

  scrollbarRef.value.setScrollLeft(newScrollLeft);
};

const handleScroll = () => {
    if (scrollbarRef.value && scrollbarRef.value.wrapRef) {
        scrollPosition.value = scrollbarRef.value.wrapRef.scrollLeft;
    }
};

const updateCardWidth = () => {
  nextTick(() => {
    if (scrollbarRef.value && scrollbarRef.value.wrapRef) {
      const firstCard = scrollbarRef.value.wrapRef.querySelector('.trip-card-item');
      const wrapper = scrollbarRef.value.wrapRef.querySelector('.trips-wrapper');
      if (firstCard && wrapper) {
        const cardStyle = window.getComputedStyle(firstCard);
        const wrapperStyle = window.getComputedStyle(wrapper);
        const cardMarginLeft = parseFloat(cardStyle.marginLeft) || 0;
        const cardMarginRight = parseFloat(cardStyle.marginRight) || 0;
        const wrapperGap = parseFloat(wrapperStyle.gap) || 0; // 從 .trips-wrapper 獲取 gap

        // 卡片的總佔用寬度 = 自身寬度 + 左右 margin + gap (如果 gap 是應用在項目間)
        // 這裡假設 gap 是定義在 .trips-wrapper 上的，所以每個項目間隔是 gap
        cardWidth.value = firstCard.offsetWidth + wrapperGap;
      }
    }
  });
};


onMounted(() => {
  updateCardWidth();
  window.addEventListener('resize', updateCardWidth);
  if (scrollbarRef.value && scrollbarRef.value.wrapRef) {
    scrollbarRef.value.wrapRef.addEventListener('scroll', handleScroll, { passive: true });
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateCardWidth);
   if (scrollbarRef.value && scrollbarRef.value.wrapRef) {
    scrollbarRef.value.wrapRef.removeEventListener('scroll', handleScroll);
  }
});

</script>

<style scoped>
.recommended-trips-section {
  margin-top: 40px;
  /* padding: 20px; */ /* 由內部容器控制 padding */
  border-radius: 8px;
}

.section-title {
  font-size: 1.6em; /* 稍微加大標題 */
  color: #303133;
  margin-bottom: 25px; /* 加大標題與輪播的間距 */
  text-align: left; /* 標題靠左，或根據您的設計調整 */
  font-weight: 600;
}

/* 包裹箭頭和滾動區域的容器 */
.carousel-navigation-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* 確保佔滿父容器寬度 */
}

/* 包裹 el-scrollbar 的容器，用於限制寬度 */
.carousel-container {
  /* 4 張完整 */
  width: calc(4 * 220px + 3 * 20px);
  overflow: hidden;
}

.carousel-arrow {
  flex-shrink: 0; /* 防止箭頭被壓縮 */
}
.carousel-arrow.left-arrow {
  margin-right: 12px; /* 與輪播區域的間距 */
}
.carousel-arrow.right-arrow {
  margin-left: 12px; /* 與輪播區域的間距 */
}

.el-scrollbar {
   width: 100%;  /* 由 flex-grow 控制 */
}

/* 用於隱藏 el-scrollbar 原生外觀的滾動條 */
.hide-native-scrollbar :deep(.el-scrollbar__bar) {
  display: none !important; /* 強制隱藏 Element Plus 生成的滾動條 */
}

/* 嘗試隱藏瀏覽器原生的滾動條 */
:deep(.el-scrollbar__wrap) {
    overflow-x: auto; /* 保持滾動功能 */
    overflow-y: hidden;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */
}
:deep(.el-scrollbar__wrap::-webkit-scrollbar) {
    display: none; /* Chrome, Safari, Opera */
}


:deep(.el-scrollbar__view) { /* el-scrollbar 內容的 class */
  white-space: nowrap; /* 確保卡片不換行 */
  height: auto; /* 讓高度自適應內容 */
}
:deep(.el-scrollbar__wrap) {
    overflow-x: auto;
    overflow-y: hidden;
}

.trips-wrapper {
  display: inline-flex; /* 讓卡片橫向排列 */
  gap: 20px; /* 卡片之間的間距，可調整 */
  padding: 10px 2px; /* 上下留白給陰影，左右一點點避免貼邊 */
}

.trip-card-item {
  width: 220px; /* 您可以根據容器寬度和 gap 計算，例如 (容器 - 3*gap) / 4 */
  flex-shrink: 0;
  box-sizing: border-box;
}
.trip-el-card { /* el-card 的 wrapper class */
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px; /* <--- 增加卡片圓角 (例如 12px 或 16px) */
  /* 可以給卡片增加一個最小高度，讓內容有更多空間 */
  min-height: 420px; /* <--- 增加最小高度 (例如 420px，您可以調整) */
  position: relative;
}

.trip-image-container {
  position: relative;
  width: 100%;
  height: 180px; /* 固定圖片區域高度 */
  overflow: hidden; /* 確保圖片圓角生效 */
  border-top-left-radius: 12px;  /* <--- 同 el-card 的 border-radius */
  border-top-right-radius: 12px; /* <--- 同 el-card 的 border-radius */
}
.trip-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.trip-card-item:hover .trip-image {
  transform: scale(1.05); /* 圖片懸停放大效果 */
}
.destination-overlay {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 12px;
  border-bottom-right-radius: 8px; /* 左上角疊加文字背景 */
  border-top-left-radius: 12px; /* <--- 同 el-card 的 border-radius */
}
.destination-name {
  color: white;
  font-size: 0.9em;
  font-weight: 500;
}
/* === 新增：圖片右上角操作按鈕樣式 === */
.image-actions {
  position: absolute;
  top: 10px; /* 調整與頂部的距離 */
  right: 10px; /* 調整與右側的距離 */
  z-index: 5; /* 確保在圖片上方 */
  display: flex;
  gap: 8px; /* 按鈕之間的間距 */
}
.action-button {
  /* background-color: rgba(255, 255, 255, 0.8) !important;  背景稍微不透明 */
}

/* 針對按鈕內的 el-icon 和 svg 來調整大小和線條 */
.action-button .el-icon,
.action-button :deep(svg) { /* :deep() 用於穿透到子組件的 SVG */
  font-size: 16px; /* <--- 調整此值來增大圖示，例如 16px, 18px */
  vertical-align: middle;
}

.action-button :deep(svg path),
.action-button :deep(svg line),
.action-button :deep(svg polyline) {
  stroke-width: 2.5; /* <--- 嘗試增加 stroke-width，例如 2, 2.5, 3。預設可能是 1.5 或 2 */
                     /* 如果是實心圖示，這個效果可能不明顯或影響邊緣 */
}

.action-button.favorite-button.el-button.is-danger {
    /* 如果是已收藏的紅色按鈕，可以微調樣式 */
  background-color: var(--el-color-danger-light-9);
}
.action-button.el-button.is-plain {
  background-color: rgba(240, 240, 240, 0.6); /* <--- 淺灰色半透明背景 */
  border-color: rgba(200, 200, 200, 0.5);   /* <--- 邊框也帶些透明度 */
}
.action-button.el-button.is-plain:hover,
.action-button.el-button.is-plain:focus {
  background-color: rgba(255, 255, 255, 0.85); /* <--- 懸停時背景更實一點 */
  border-color: #b0b0b0; /* <--- 懸停時邊框顏色 */
}
/* 特別處理已收藏 (danger type) 的 plain 按鈕，確保顏色對比 */
.action-button.favorite-button.el-button--danger.is-plain {
  /* Element Plus 的 danger plain 預設是紅色文字，透明背景 */
  /* 我們可以強化其 hover/focus 效果 */
}
.action-button.favorite-button.el-button--danger.is-plain:hover,
.action-button.favorite-button.el-button--danger.is-plain:focus {
  background-color: var(--el-color-danger-light-9); /* Element Plus 提供的淺紅色 */
  border-color: var(--el-color-danger-light-7);   /* Element Plus 提供的淺紅色邊框 */
  color: var(--el-color-danger);                  /* 保持紅色文字 */
}

/* 如果是實心已收藏按鈕 (type="danger" 且非 plain) */
.action-button.favorite-button.el-button--danger:not(.is-plain) .el-icon,
.action-button.favorite-button.el-button--danger:not(.is-plain) :deep(svg) {
  color: white; /* 確保實心紅色按鈕上的圖示是白色 */
}
/* 對於 StarFilled (實心愛心)，stroke-width 主要影響其可能存在的細微邊框 */
/* 如果 StarFilled 是純粹的 fill 填充，則 stroke-width 不會改變其「胖瘦」*/
.action-button.favorite-button.el-button--danger:not(.is-plain) :deep(svg path) {
   /* stroke: white; */ /* 如果希望實心圖示有白色描邊可以嘗試，但通常不需要 */
   /* stroke-width: 1; */ /* 對於實心圖示，可能需要較細的 stroke-width 或不設定 */
}
.trip-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* 讓內容區塊填滿卡片剩餘高度 */
  justify-content: space-between; /* 將內容推向兩端 */
}

.trip-name {
  font-size: 1.05em; /* 產品名稱字體 */
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  margin: 0 0 10px 0;
  white-space: normal; /* 允許正常換行 */
  overflow-wrap: break-word; /* 在單詞邊界換行 */
  word-break: break-word; /* 允許在單詞內部換行 (如果需要) */
  /* 設定最小高度，確保至少能容納N行文字的空間 */
  /* 假設 1.05em * 1.4 (line-height) * 3 (行數) = 2.94em */
  min-height: 4.34em; /* <--- 預留兩行的高度 */
  
}

.trip-meta {
  font-size: 0.85em;
  color: #606266;
  margin-bottom: 12px;
  display: flex;
  gap: 12px; /* 天數和航空之間的間距 */
  align-items: center;
  flex-wrap: wrap; /* 空間不足時換行 */
}
.meta-item {
  display: inline-flex;
  align-items: center;
}
.meta-item .el-icon { /* 確保圖標和文字對齊 */
    margin-right: 4px;
    vertical-align: text-bottom; /* 或者 middle，視情況調整 */
}

.trip-features {
  font-size: 0.85em;
  color: #909399;
  line-height: 1.6;
  margin: 0 0 15px 0;
  white-space: normal;  /* 允許正常換行 */
  overflow-wrap: break-word;
  word-break: break-word;
  /* 設定最小高度 */
  /* 假設 0.85em * 1.6 (line-height) * 3 (行數) = 4.08em */
  min-height: 4.08em; /* <--- 預留三行的高度 */
  flex-grow: 1;
}

.trip-price-container {
  margin-top: auto; /* 將價格推到底部 (如果上面有 flex-grow) */
  padding-top: 12px; /* 與上方內容的間距 */
  text-align: right; /* 價格靠右 */
}
.price-label {
  font-size: 0.8em;
  color: #606266;
  margin-right: 4px;
}
.trip-price {
  font-size: 1.4em;
  color: #F56C6C; /* 價格用醒目顏色 */
  font-weight: bold;
}
.price-suffix {
  font-size: 0.8em;
  color: #606266;
  margin-left: 2px;
}

.trip-actions {
  margin-top: 20px; /* 與價格的間距 */
  text-align: right; /* 按鈕靠右 */
}
.details-button {
  width: 100%; /* 讓按鈕填滿寬度 */
}
.details-link {
    text-decoration: none;
}
</style>