<template>
  <button class="base-button" :class="type">
    <slot></slot>
  </button>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  type: {
    type: String,
    default: 'default', // 可以是 default, primary, success, warning, danger, info
  },
});
</script>

<style scoped>
.base-button {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #fff;
}

.base-button.primary {
  background-color: #409EFF;
  color: #fff;
  border-color: #409EFF;
}

/* 可以添加更多樣式 */
</style>