<template>
  <form class="base-form" @submit.prevent="$emit('submit', formData)">
    <slot></slot>
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { defineEmits } from 'vue';

const formData = ref({});
const emit = defineEmits(['submit']);

// 你可以在這裡定義表單的欄位和驗證邏輯
</script>

<style scoped>
.base-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.base-form label {
  margin-bottom: 5px;
  font-weight: bold;
}

.base-form input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.base-form button {
  padding: 10px 15px;
  background-color: #409EFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>