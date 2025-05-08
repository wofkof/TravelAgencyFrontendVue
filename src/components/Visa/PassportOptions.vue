<template>
  <div class="passport-form">
    <div class="icon-placeholder">
      <img src="@/assets/images/passport-icon.png" alt="護照圖示" width="80">
    </div>
    <p class="form-title">申辦中華民國護照</p>
    <div class="dropdown-container">
      <div class="dropdown-select" @click="toggleDropdown">
        <span id="selected-option">{{ selectedOption }}</span>
        <div class="dropdown-arrow" :class="{ open: isDropdownOpen }"></div>
      </div>
      <ul class="dropdown-options" v-if="isDropdownOpen">
        <li
          v-for="option in options"
          :key="option.value"
          :data-value="option.value"
          @click="selectOption(option.text, option.value)"
        >
          {{ option.text }}
        </li>
      </ul>
    </div>
    <button class="submit-button" @click="handleSubmit">開始申辦</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isDropdownOpen = ref(false);
const selectedOption = ref('所有項目');
const options = ref([
  { text: '新辦/更換 (14歲以上)', value: 'adult-new-renew' },
  { text: '新辦/更換 (14歲以下)', value: 'child-new-renew' },
  { text: '國外遺失 (14歲以上)', value: 'adult-lost' },
  { text: '國外遺失 (14歲以下)', value: 'child-lost' },
]);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectOption = (text, value) => {
  selectedOption.value = text;
  isDropdownOpen.value = false;
  console.log('選中的值:', value);
  // 在這裡可以處理選中不同選項後的邏輯
};

const handleSubmit = () => {
  console.log('開始申辦，選中的項目是:', selectedOption.value);
  // 在這裡處理提交表單的邏輯
};
</script>

<style scoped>
/* 這裡放置之前提供的 CSS 樣式 */
.passport-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 6px;
  background-color: #f9f9f9;
}

.icon-placeholder {
  margin-bottom: 10px;
}

.form-title {
  color: #555;
  font-size: 18px;
  margin-bottom: 15px;
}

.dropdown-container {
  position: relative;
  width: 100%;
  margin-bottom: 20px;
}

.dropdown-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  background-color: #fff;
}

.dropdown-arrow {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #777;
  transition: transform 0.3s ease-in-out;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-options {
  list-style: none;
  padding: 0;
  margin: 0;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  border: 1px solid #ccc;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  background-color: #fff;
  z-index: 10;
  display: none; /* 初始時隱藏 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dropdown-options li {
  padding: 10px;
  cursor: pointer;
}

.dropdown-options li:hover {
  background-color: #f0f0f0;
}

.dropdown-options[v-if] {
  display: block;
}

.submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0056b3;
}
</style>