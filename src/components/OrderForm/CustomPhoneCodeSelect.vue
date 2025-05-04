<template>
    <div class="custom-select" @click="toggleDropdown" ref="selectRef">
      <div class="selected-value">{{ selectedLabel }}</div>
      <ul v-if="dropdownOpen" class="options">
        <li v-for="option in options"
            :key="option.value"
            @click.stop="selectOption(option)">
          {{ option.text }}
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  
  const props = defineProps({
    modelValue: { type: String, required: true },
    options: { type: Array, required: true } // { value: '+886', text: '+886 (台灣)' }
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const dropdownOpen = ref(false);
  const selectRef = ref(null);
  
  const selectedLabel = computed(() => {
    const selected = props.options.find(opt => opt.value === props.modelValue);
    return selected ? selected.value : ''; // 只顯示 +886
  });
  
  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };
  
  const selectOption = (option) => {
    emit('update:modelValue', option.value);
    dropdownOpen.value = false;
  };
  
  // 點擊外部自動關閉下拉
  const handleClickOutside = (event) => {
    if (selectRef.value && !selectRef.value.contains(event.target)) {
      dropdownOpen.value = false;
    }
  };
  
  onMounted(() => document.addEventListener('click', handleClickOutside));
  onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
  </script>
  
  <style scoped>
  .custom-select {
    position: relative;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px 12px;
    cursor: pointer;
    user-select: none;
    background-color: white;
  }
  
  .selected-value {
    font-size: 1em;
    color: #333;
  }
  
  .options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: white;
    border: 1px solid #ccc;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .options li {
    padding: 10px 12px;
    font-size: 0.95em;
    cursor: pointer;
  }
  
  .options li:hover {
    background-color: #f0f0f0;
  }
  </style>
  