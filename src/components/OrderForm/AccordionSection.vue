<template>
  <el-collapse-item :name="sectionName" :disabled="isDisabled">
    <template #title>
      <div class="collapse-item-title-content">
        <span class="collapse-item-title">{{ title }}</span>
        <el-tooltip v-if="isDisabled && tooltipDisabled" :content="tooltipDisabled" placement="top">
           <el-icon style="margin-left: 8px; color: #c0c4cc; cursor: help;"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
    </template>
    <div class="collapse-item-content-wrapper">
      <slot></slot>
    </div>
  </el-collapse-item>
</template>

<script setup>
import { defineProps, computed } from 'vue';

// Props 定義
const props = defineProps({
  /**
   * 手風琴區塊的標題
   */
  title: {
    type: String,
    required: true
  },
  /**
   * 區塊的唯一名稱，用於 el-collapse 的 v-model
   */
  sectionName: {
    type: String,
    required: true
  },
  /**
   * 是否禁用此區塊的展開/收合
   */
  isDisabled: {
    type: Boolean,
    default: false
  },
  /**
   * 禁用時顯示的 Tooltip 文字
   */
  tooltipDisabled: {
    type: String,
    default: ''
  }
});

</script>

<style scoped>

/* --- 新增：標題插槽內的樣式 --- */
.collapse-item-title-content {
  display: flex;
  align-items: center;
  width: 100%; /* 確保佔滿標題區域 */
}


.collapse-item-title {
   font-weight: 500; /* 標題字重 */
   font-size: 1.05em; /* 標題字號 */
   color: var(--el-text-color-primary); /* 標題顏色 */
   flex-grow: 1; /* 讓標題文字佔據剩餘空間 */
}

/* --- el-collapse-item 的樣式微調 (使用 :deep() 穿透) --- */

/* 可以調整標題區域的 padding 和 hover 效果 */
:deep(.el-collapse-item__header) {
  /* padding: 15px 20px; */ /* Element Plus 通常有預設 padding */
  /* background-color: #fafafa; */ /* 可選：標頭背景色 */
  border-bottom: 1px solid transparent; /* 預設無下邊框 */
  transition: border-color 0.3s ease;
}
/* 展開時顯示下邊框 */
:deep(.el-collapse-item__header.is-active) {
   border-bottom-color: var(--el-border-color-lighter, #ebeef5);
}

/* 禁用狀態的標題樣式 (Element Plus 會處理大部分，這裡可微調) */
:deep(.el-collapse-item__header.is-disabled) {
  /* cursor: not-allowed; */ /* Element Plus 已處理 */
}
:deep(.el-collapse-item__header.is-disabled) .collapse-item-title,
:deep(.el-collapse-item__header.is-disabled) .collapse-item-icon {
    color: var(--el-text-color-placeholder, #c0c4cc); /* 禁用時的顏色 */
}

/* 內容區域的樣式 */
:deep(.el-collapse-item__wrap) {
  /* background-color: #ffffff; */ /* 內容區域背景色 */
  border-bottom: none; /* 通常內容區不需要下邊框 */
}
:deep(.el-collapse-item__content) {
  padding-top: 15px; /* 內容頂部 padding */
  padding-bottom: 20px; /* 內容底部 padding */
  padding-left: 20px; /* 內容左側 padding */
  padding-right: 20px; /* 內容右側 padding */
  font-size: var(--el-font-size-base); /* 內容字體大小 */
  color: var(--el-text-color-regular); /* 內容文字顏色 */
  line-height: 1.6; /* 內容行高 */
}
</style>