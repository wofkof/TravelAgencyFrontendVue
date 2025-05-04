<template>
    <div class="order-items-display">
      <h3>訂單商品</h3>
      <div v-if="!items || items.length === 0">
        <p>沒有選擇任何商品。</p>
        </div>
      <div v-else>
        <ul class="order-summary-list">
          <li v-for="item in items" :key="item.id" class="order-summary-item">
            <div class="item-info">
              <strong>{{ item.name }}</strong>
              <span v-if="item.category"> ({{ item.category }})</span>
              <div v-if="item.options && item.options.length > 0" class="item-options-summary">
                <span v-for="option in item.options.filter(o => o.quantity > 0)" :key="option.type" class="option-detail">
                  {{ option.type }} x {{ option.quantity }} NT$ {{ option.price }}
                </span>
              </div>
              <div v-else-if="item.quantity && item.pricePerUnit" class="item-simple-summary">
                <span>數量: {{ item.quantity }} NT$ {{ item.pricePerUnit }}</span>
              </div>
            </div>
            <div class="item-total-price">
              小計: NT$ {{ calculateItemSubtotal(item) }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  // 定義接收的 props
  const props = defineProps({
    items: {
      type: Array,
      required: true,
      default: () => [] // 提供預設空陣列
    }
  });
  
  // 將計算小計的邏輯移到子元件中，或者也可以從父元件傳遞
  const calculateItemSubtotal = (item) => {
    if (item.options && item.options.length > 0) {
      return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
    } else if (item.quantity && item.pricePerUnit) {
      return item.pricePerUnit * item.quantity;
    }
    return 0;
  };
  </script>
  
  <style scoped>
  /* 複製 OrderForm.vue 中相關的樣式過來 */
  .order-summary-list {
    list-style: none;
    padding: 0;
    margin-top: 10px;
  }
  .order-summary-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #eee;
    padding: 10px 0;
    margin-bottom: 10px;
  }
  .item-info {
    flex-grow: 1;
    margin-right: 20px;
  }
  .item-options-summary, .item-simple-summary {
    font-size: 0.9em;
    color: #555;
    margin-top: 5px;
  }
  .option-detail {
      display: block;
      margin-left: 10px;
  }
  .item-total-price {
    font-weight: bold;
    white-space: nowrap;
  }
  h3 {
      margin-bottom: 15px;
  }
  </style>