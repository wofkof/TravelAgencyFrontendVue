<script setup>
// --- 狀態管理 (Pinia) ---
import { storeToRefs } from 'pinia'; // 用於將 store state/getters 轉為 ref
import { useCartStore } from '@/stores/ShoppingCart'; // 導入購物車相關的 Pinia store
import { Delete } from '@element-plus/icons-vue'; // Delete 圖標因用於 :icon 綁定，故*需要*導入

// --- 本地工具 ---
import { useConfirmation } from '@/components/tools/useConfirmation'; // 確認對話框 composable

// --- 初始化 Store 和 Composable ---
const cartStore = useCartStore();
const { showConfirmDialog } = useConfirmation(); // 獲取確認對話框方法

// --- 從 Store 獲取響應式狀態與 Getters ---
// 只獲取此組件預覽所需的狀態/計算屬性
const {
  activeItems,  // 有效商品列表 (用於遍歷顯示)
  itemCount,    // 有效商品總單位數 (用於徽章顯示)
  totalPrice,   // 所有有效商品的總價 (用於頁腳顯示)
} = storeToRefs(cartStore);
// calculateItemTotal 會直接透過 cartStore.calculateItemTotal 調用

// --- 本地方法 ---

/**
 * 處理在預覽彈窗中點擊刪除單個商品的按鈕
 * @param {object} item - 要移除的商品對象
 */
const handleRemoveItem = async (item) => {
  // 顯示確認對話框
  const confirmed = await showConfirmDialog({
      title: '刪除商品',
      message: `您確定要從購物車中刪除「${item.name}」嗎？`,
      confirmButtonText: '確認刪除',
      type: 'warning'
  });
  // 如果用戶確認，則調用 store action 執行刪除
  if (confirmed) {
    cartStore.removeFromCart(item.id);
  } else {
    // console.log('取消刪除'); // 可選：用戶取消時的操作
  }
};

/**
 * 計算單個項目的顯示數量 (輔助函數)
 * (注意：此邏輯可能與其他組件重複，考慮整合到 Store 或 Utils)
 * @param {object} item - 購物車項目
 * @returns {number} - 項目總單位數量
 */
const getItemQuantity = (item) => {
    // return item.options ? item.options.reduce((sum, opt) => sum + opt.quantity, 0) : item.quantity;
    return 1;
};
</script>

<template>
  <el-popover
    placement="bottom-end"  位置="底部靠右對齊"
    title="我的購物車"       標題="彈窗標題"
    :width="400"            寬度="彈窗寬度"
    trigger="hover"         觸發方式="滑鼠懸停"
    popper-class="cart-popover"  自定義彈窗="自定義 CSS class"
  >

    <template #reference>
      <router-link
        to="/ShoppingCart"  導航目標="購物車頁面路由"
        class="main-menu__item cart-icon-link"  樣式="CSS class"
        active-class="main-menu__item--active"  活動狀態="活動路由 class"
        exact  精確匹配="路由精確匹配"
        title="購物車"  提示="滑鼠懸停提示文字"
      >
        <el-icon size="26"><ShoppingCart /></el-icon>
        <span v-if="itemCount > 0" class="cart-badge">
          {{ itemCount }}
        </span>
      </router-link>
    </template>

    <div class="cart-popover-content">
      <div v-if="activeItems.length === 0" class="empty-cart-message">
        您的購物車是空的
      </div>
      <div v-else>
        <ul class="cart-items-list-preview">
          <li v-for="item in activeItems" :key="item.id" class="cart-item-preview">
            <div class="item-image-preview">
              <img :src="item.imageUrl || '/img/placeholder.png'" :alt="item.name">
            </div>
            <div class="item-details-preview">
              <div class="item-name-preview">{{ item.name }}</div>
              <div class="item-description-preview">{{ item.details }}</div>
              <div class="item-meta-preview">
                <span v-if="item.departureDate">日期: {{ item.departureDate }}</span>
                <span>票數: {{ getItemQuantity(item) }}</span>
                <span>小計: NT$ {{ cartStore.calculateItemTotal(item) }}</span>
              </div>
            </div>
            <div class="item-actions-preview">
               <el-button
                  type="danger"
                  :icon="Delete" circle
                  size="small"
                  plain
                  @click="handleRemoveItem(item)"
                  title="刪除此商品"
               />
            </div>
          </li>
        </ul>
        <el-divider style="margin: 10px 0;" />
        <div class="popover-footer-preview">
            <span class="total-items-preview">共 {{ itemCount }} 件商品</span>
            <div class="footer-right">
              <span class="total-price-preview">總計: NT$ {{ totalPrice }}</span>
              <router-link to="/ShoppingCart">
                  <el-button type="primary" size="small">查看購物車</el-button>
              </router-link>
            </div>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
/* --- 觸發元素 (購物車圖標連結) 的基礎樣式 --- */
.main-menu__item {
  padding: 10px; /* 增加點擊區域 */
  text-decoration: none;
  color: #040404; /* 圖標預設顏色 */
  transition: color 0.3s ease;
  position: relative; /* 相對定位，為了徽章的絕對定位 */
  display: inline-flex; /* 使用 inline-flex 佈局 */
  align-items: center; /* 垂直居中圖標 */
  justify-content: center; /* 水平居中圖標 */
  cursor: pointer;
}
.main-menu__item.cart-icon-link .el-icon {
  transition: transform 0.2s ease-in-out; /* 平滑縮放動畫，時長 0.2 秒 */
  display: inline-block; /* 或者 block */
}

/* 當滑鼠懸停在 *包含圖示的連結* 上時，放大圖示 */
.main-menu__item.cart-icon-link:hover .el-icon {
  transform: scale(1.2); /* 放大 20% (您可以調整 1.2 這個值) */
}
.main-menu__item:hover {
  transform: scale(1.2);
  color: #409EFF; /* 滑鼠懸停時變藍 */
}
/* 確保圖標垂直對齊 */
.main-menu__item .el-icon {
  vertical-align: middle;
}

/* --- 數量徽章樣式 (已修改) --- */
.cart-badge {
  position: absolute; /* 絕對定位，相對於 .main-menu__item */
  top: 3px; /* 靠近頂部 */
  right: 1px; /* 稍微移出圖標右側 */
  background-color: #F56C6C; /* 紅色背景 */
  color: white; /* 白色文字 */
  border-radius: 50%; /* 圓形 */
  font-size: 10px; /* 字體大小 */
  font-weight: bold; /* 字體加粗 */
  /* 增加內邊距，讓數字周圍有更多空間 */
  padding: 1px 6px; /* 上下 1px, 左右 6px */
  /* 調整高度和行高以適應內邊距 */
  height: 18px;
  line-height: 16px; /* 約等於 height 減去上下邊框寬度 */
  /* 確保最小寬度足夠容納數字和內邊距 */
  min-width: 18px;
  text-align: center; /* 文字居中 */
  border: 1px solid white; /* 白色邊框 */
  box-sizing: border-box; /* padding 和 border 計算在尺寸內 */
  z-index: 1; /* 確保在圖標上方 */
  display: inline-flex; /* 使用 flex 佈局使內容居中 */
  align-items: center;
  justify-content: center;
  user-select: none; /* 防止選中文本 */
}

/* --- Popover 彈窗內容通用樣式 --- */
.cart-popover-content {
  font-size: 14px; /* 設定基礎字體大小 */
}
/* 購物車為空時的提示訊息樣式 */
.empty-cart-message {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}

/* --- 預覽商品列表樣式 --- */
.cart-items-list-preview {
  list-style: none; /* 移除列表樣式 */
  padding: 0 5px 0 0; /* 右側留出滾動條空間 */
  margin: 0;
  max-height: 300px; /* 列表最大高度，超出會出現滾動條 */
  overflow-y: auto; /* 垂直方向自動顯示滾動條 */
  /* Element Plus 風格的滾動條 (可選，美化用) */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #c0c4cc #f5f5f5; /* Firefox */
}
/* Webkit 內核瀏覽器 (Chrome, Safari, Edge) 的滾動條樣式 */
.cart-items-list-preview::-webkit-scrollbar { width: 6px; /* 滾動條寬度 */ }
.cart-items-list-preview::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 3px; /* 軌道背景 */ }
.cart-items-list-preview::-webkit-scrollbar-thumb { background-color: #c0c4cc; border-radius: 3px; border: 1px solid #f5f5f5; /* 滑塊樣式 */ }
.cart-items-list-preview::-webkit-scrollbar-thumb:hover { background-color: #a8abb2; /* 滑鼠懸停時滑塊顏色 */ }


/* --- 單個預覽商品樣式 (Flex 佈局) --- */
.cart-item-preview {
  display: flex; /* 使用 Flex 佈局 */
  align-items: flex-start; /* 頂部對齊 */
  padding: 12px 0; /* 上下邊距 */
  gap: 12px; /* 項目間 (圖片、詳情、按鈕) 的間距 */
  border-bottom: 1px solid #ebeef5; /* Element Plus 邊框顏色 */
}
/* 最後一個項目移除底部分隔線 */
.cart-item-preview:last-child { border-bottom: none; }

/* 預覽圖片樣式 */
.item-image-preview {
  flex-shrink: 0; /* 防止圖片被壓縮 */
  width: 60px;
  height: 60px;
  border-radius: 4px; /* 圓角 */
  overflow: hidden; /* 隱藏超出部分 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa; /* 淺灰背景，防止圖片透明時不好看 */
}
.item-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 保持圖片比例完整顯示 */
}

/* 預覽商品詳情區塊 */
.item-details-preview {
  flex-grow: 1; /* 佔據剩餘空間 */
  min-width: 0; /* 防止內容溢出導致佈局問題 */
  display: flex;
  flex-direction: column; /* 內部元素垂直排列 */
  gap: 4px; /* 內部元素 (名稱、描述、meta) 的間距 */
}
/* 商品名稱樣式 */
.item-name-preview {
  font-weight: 500; /* 中等粗細 */
  color: #303133; /* Element Plus 主要文字顏色 */
  line-height: 1.3; /* 行高 */
  /* 自動換行 */
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
}
/* 商品描述樣式 */
.item-description-preview {
  font-size: 12px;
  color: #909399; /* Element Plus 次要文字顏色 */
  line-height: 1.4;
  /* 限制最多顯示兩行，超出部分顯示省略號 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; /* 允許換行 */
  margin-bottom: 4px; /* 與下方 meta 信息的間距 */
}
/* 商品 Meta 信息 (日期、票數、小計) */
.item-meta-preview {
  font-size: 12px;
  color: #606266; /* Element Plus 常規文字顏色 */
  display: flex;
  flex-wrap: wrap; /* 允許換行 */
  gap: 8px; /* Meta 信息之間的間距 */
}

/* 預覽商品操作按鈕 (刪除按鈕) */
.item-actions-preview {
  flex-shrink: 0; /* 防止按鈕被壓縮 */
  margin-left: auto; /* 將按鈕推到最右側 */
  padding-top: 2px; /* 稍微向下調整對齊 */
}
/* 使刪除按鈕 (plain 模式) 不那麼突兀 */
.item-actions-preview .el-button--danger.is-plain {
    --el-button-hover-text-color: var(--el-color-danger);
    --el-button-hover-bg-color: var(--el-color-danger-light-9);
    --el-button-hover-border-color: var(--el-color-danger-light-5);
}

/* --- 彈窗底部樣式 --- */
.popover-footer-preview {
  display: flex;
  justify-content: space-between; /* 左右內容分開 */
  align-items: center; /* 垂直居中 */
  margin-top: 12px; /* 與上方列表/分隔線的間距 */
  padding-top: 10px; /* 與上方分隔線的視覺間距 */
  border-top: 1px solid #ebeef5; /* 頂部分隔線 */
}
/* 總件數文字 */
.total-items-preview {
    font-size: 13px;
    color: #606266;
}
/* 右側區域 (總計 + 按鈕) */
.footer-right {
    display: flex;
    align-items: center;
    gap: 10px; /* 總計和按鈕的間距 */
}
/* 總計金額文字 */
.total-price-preview {
  font-weight: bold;
  color: #303133;
}
/* "查看購物車" 按鈕可以繼承 el-button 預設樣式 */
</style>