<script setup>
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/stores/ShoppingCart';
import { Delete, ShoppingCart, ShoppingCartFull } from '@element-plus/icons-vue';
import { useConfirmation } from '@/components/tools/useConfirmation';

const cartStore = useCartStore();
const { showConfirmDialog } = useConfirmation();

const {
  activeItems,
  itemCount,
  totalPrice,
} = storeToRefs(cartStore);

const badgeRef = ref(null);

const cartIconLinkRef = ref(null);

watch(itemCount, (newValue, oldValue) => {
  if (newValue > oldValue && badgeRef.value) {
    badgeRef.value.classList.add('animate-pop');
    setTimeout(() => {
      if (badgeRef.value) {
        badgeRef.value.classList.remove('animate-pop');
      }
    }, 500);
  }
  // 新增：圖示晃動動畫
  if (cartIconLinkRef.value) {
    cartIconLinkRef.value.$el.classList.add('animate-shake');
    setTimeout(() => {
      if (cartIconLinkRef.value) cartIconLinkRef.value.$el.classList.remove('animate-shake');
    }, 600); // 晃動畫持續時間
  }
});

const handleRemoveItem = async (item) => {
  const confirmed = await showConfirmDialog({
    title: '刪除商品',
    message: `您確定要從購物車中刪除「${item.name}」嗎？`,
    confirmButtonText: '確認刪除',
    type: 'warning'
  });
  if (confirmed) {
    cartStore.removeFromCart(item.id);
  }
};

const getItemQuantity = (item) => {
  if (item.productType === 'CustomTravel' && item.productSpecificData && typeof item.productSpecificData.people === 'number') {
    return item.productSpecificData.people;
  }
  else if (item.options && Array.isArray(item.options) && item.options.length > 0) {
    return item.options.reduce((sum, opt) => sum + (opt.quantity || 0), 0);
  }
  else if (typeof item.quantity === 'number') {
    return item.quantity;
  }
  console.warn(`無法確定商品 ${item.name} (ID: ${item.id}) 的數量/人數。`);
  return 0;
};
</script>

<template>
  <el-popover
    placement="bottom-end"
    title="我的購物車"
    :width="400"
    trigger="hover"
    popper-class="cart-popover"
  >
    <template #reference>
      <router-link
        ref="cartIconLinkRef"
        to="/ShoppingCart"
        class="main-menu__item cart-icon-link"
        active-class="main-menu__item--active"
        exact
        title="購物車"
      >
        <el-icon size="32" v-if="itemCount > 0"><ShoppingCartFull /></el-icon>
        <el-icon size="32" v-else><ShoppingCart /></el-icon>
        <span v-if="itemCount > 0" class="cart-badge" ref="badgeRef">
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
              <img :src="item.imageUrl || '/images/customtravel.png'" :alt="item.name">
            </div>
            <div class="item-details-preview">
              <div class="item-name-preview">{{ item.name }}</div>
              <div class="item-description-preview">{{ item.details }}</div>
              <div class="item-meta-preview">
                <span v-if="item.departureDate">日期: {{ item.departureDate }}</span>
                <span>人數: {{ getItemQuantity(item) }}</span>
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
            <span class="total-items-preview">共 {{ itemCount }} 項商品</span>
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
  padding: 10px;
  text-decoration: none;
  color: #040404;
  transition: color 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.main-menu__item.cart-icon-link .el-icon {
  transition: transform 0.2s ease-in-out;
  display: inline-block; /* 確保 transform 生效 */
}
.main-menu__item.cart-icon-link:hover .el-icon {
  transform: scale(1.2);
}
.main-menu__item:hover {
  color: #409EFF;
}
.main-menu__item .el-icon {
  vertical-align: middle;
}

.cart-badge {
  position: absolute;
  top: 3px;
  right: 1px;
  background-color: #F56C6C;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 6px;
  height: 18px;
  line-height: 16px;
  min-width: 18px;
  text-align: center;
  border: 1px solid white;
  box-sizing: border-box;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transform-origin: center center;
}

.cart-badge.animate-pop {
  animation: popEffect 0.5s ease-out;
}

.main-menu__item.animate-shake { /* 直接作用在 router-link 上 */
  animation: shakeEffect 0.6s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shakeEffect {
  10%, 90% {
    transform: translate3d(-1px, 0, 0) scale(1.05); /* 配合已有的 hover 放大效果 */
  }
  20%, 80% {
    transform: translate3d(2px, 0, 0) scale(1.05);
  }
  30%, 50%, 70% {
    transform: translate3d(-2px, 0, 0) scale(1.05);
  }
  40%, 60% {
    transform: translate3d(2px, 0, 0) scale(1.05);
  }
}

/* --- Popover 彈窗內容通用樣式 --- */
.cart-popover-content {
  font-size: 14px;
}
.empty-cart-message {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}
.cart-items-list-preview {
  list-style: none;
  padding: 0 5px 0 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc #f5f5f5;
}
.cart-items-list-preview::-webkit-scrollbar { width: 6px; }
.cart-items-list-preview::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 3px; }
.cart-items-list-preview::-webkit-scrollbar-thumb { background-color: #c0c4cc; border-radius: 3px; border: 1px solid #f5f5f5; }
.cart-items-list-preview::-webkit-scrollbar-thumb:hover { background-color: #a8abb2; }

.cart-item-preview {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  gap: 12px;
  border-bottom: 1px solid #ebeef5;
}
.cart-item-preview:last-child { border-bottom: none; }

.item-image-preview {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}
.item-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.item-details-preview {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.item-name-preview {
  font-weight: 500;
  color: #303133;
  line-height: 1.3;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: break-word;
}
.item-description-preview {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  margin-bottom: 4px;
}
.item-meta-preview {
  font-size: 12px;
  color: #606266;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.item-actions-preview {
  flex-shrink: 0;
  margin-left: auto;
  padding-top: 2px;
}
.item-actions-preview .el-button--danger.is-plain {
    --el-button-hover-text-color: var(--el-color-danger);
    --el-button-hover-bg-color: var(--el-color-danger-light-9);
    --el-button-hover-border-color: var(--el-color-danger-light-5);
}
.popover-footer-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}
.total-items-preview {
    font-size: 13px;
    color: #606266;
}
.footer-right {
    display: flex;
    align-items: center;
    gap: 10px;
}
.total-price-preview {
  font-weight: bold;
  color: #303133;
}
</style>