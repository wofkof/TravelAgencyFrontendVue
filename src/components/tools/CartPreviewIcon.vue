<script setup>
// --- 匯入需要的元件、圖標和 Store ---
import { ElIcon, ElPopover, ElButton, ElDivider } from 'element-plus';
import { ShoppingCart } from '@element-plus/icons-vue';
import { useCartStore } from '@/stores/cart'; // 匯入購物車 Store

// --- 使用 Store ---
const cartStore = useCartStore();
</script>

<template>
  <el-popover
    placement="bottom-end"
    title="我的購物車"
    :width="350"
    trigger="hover"
    popper-class="cart-popover" >
    <template #reference>
      <router-link
        to="/Cart"
        class="main-menu__item cart-icon-link"
        active-class="main-menu__item--active"
        exact
        title="購物車"
      >
        <el-icon size="26"><ShoppingCart /></el-icon>
        <span v-if="cartStore.itemCount > 0" class="cart-badge">
          {{ cartStore.itemCount }}
        </span>
      </router-link>
    </template>

    <div class="cart-popover-content">
      <div v-if="cartStore.items.length === 0" class="empty-cart-message">
        您的購物車是空的
      </div>
      <div v-else>
        <ul class="cart-items-list">
          <li v-for="item in cartStore.items.slice(0, 5)" :key="item.id" class="cart-item">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-quantity">
                x {{ item.options ? item.options.reduce((sum, opt) => sum + opt.quantity, 0) : item.quantity }}
            </span>
            <span class="item-price">NT$ {{ cartStore.calculateItemTotal(item) }}</span>
          </li>
          <li v-if="cartStore.items.length > 5" class="more-items">...</li>
        </ul>
        <el-divider style="margin: 8px 0;" />
        <div class="popover-footer">
            <span class="total-price">總計: NT$ {{ cartStore.totalPrice }}</span>
            <router-link to="/cart">
                <el-button type="primary" size="small">查看購物車</el-button>
            </router-link>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>

/* main-menu__item 的基本樣式也移到這裡，因為它是連結的一部分 */
.main-menu__item {
  padding: 10px; /* 調整圖標周圍的 padding */
  text-decoration: none;
  color: #333;
  transition: color 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.main-menu__item:hover {
  color: #409EFF;
}
/* Active 狀態的樣式，直接應用於 router-link */
.main-menu__item.router-link-exact-active {
  /* 也許不需要特別的 active 樣式，或者只是改變圖標顏色? */
  /* color: #409EFF; */
}
.main-menu__item .el-icon {
    vertical-align: middle;
}


/* Badge 樣式 */
.cart-badge {
  position: absolute;
  top: 0px;
  right: -2px;
  background-color: #F56C6C;
  color: white;
  border-radius: 50%;
  padding: 0px 5px;
  font-size: 10px;
  line-height: 14px;
  min-width: 16px;
  height: 16px;
  text-align: center;
  border: 1px solid white;
  box-sizing: border-box;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Popover 內容樣式 */
.cart-popover-content {
  font-size: 13px;
}
.empty-cart-message {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
.cart-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}
.cart-item:last-child {
  border-bottom: none;
}
.item-name {
  flex-grow: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-quantity {
  margin-right: 8px;
  color: #606266;
  white-space: nowrap;
}
.item-price {
  color: #303133;
  white-space: nowrap;
}
.more-items {
    text-align: center;
    color: #909399;
    font-size: 12px;
    padding: 5px 0;
}
.popover-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}
.total-price {
    font-weight: bold;
}
</style>