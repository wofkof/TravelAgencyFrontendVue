
<template>
  <div class="accordion-section" :class="{ 'is-open': isOpen, 'is-disabled': isDisabled }">
    <div class="accordion-header" @click="handleHeaderClick">
      <span class="header-title">{{ title }}</span>
      <span class="header-icon">▼</span>
      </div>
    <div v-show="isOpen" class="accordion-content">
      <slot></slot> </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  sectionName: {
    type: String,
    required: true
  },
  openedSections: { // ** 接收的是 Set **
    type: Set,
    required: true
  },
  isDisabled: { // ** 接收禁用狀態 **
    type: Boolean,
    default: false
  }
  // isComplete: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle']);

// ** 判斷 sectionName 是否在 Set 中 **
const isOpen = computed(() => props.openedSections.has(props.sectionName));

// ** 加入 isDisabled 判斷 **
const handleHeaderClick = () => {
  if (props.isDisabled) {
    // console.log(`Section ${props.sectionName} is disabled.`);
    return; // 禁用時不觸發事件
  }
  emit('toggle', props.sectionName); // 正常觸發
};
</script>

<style scoped>
.accordion-section {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: opacity 0.3s ease;
}

/* 不同區塊背景色 */
.section-participant { background-color: #f8f9fa; }
.section-payment { background-color: #ffffff; }
.section-einvoice { background-color: #f8f9fa; }

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid transparent;
  transition: background-color 0.2s ease;
}

.accordion-section.is-open .accordion-header {
  border-bottom-color: #e0e0e0;
}

.header-title {
  font-weight: bold;
  font-size: 1.1em;
  color: #333;
}

.header-icon {
  transition: transform 0.3s ease;
  font-size: 0.8em;
  color: #666;
}

.accordion-section.is-open .header-icon {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

/* 禁用狀態的樣式 */
.accordion-section.is-disabled {
  opacity: 0.6;
}
.accordion-section.is-disabled .accordion-header {
  cursor: not-allowed;
}
.accordion-section.is-disabled .header-title,
.accordion-section.is-disabled .header-icon {
    color: #aaa;
}
</style>