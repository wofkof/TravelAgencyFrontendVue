<template>
    <span class="favorite-icon-wrapper" :class="{ 'is-favorite': isFavorite }">
      <svg
        v-if="isFavorite"
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        fill="currentColor" class="bi bi-suit-heart-fill favorite-icon favorite-icon--filled"
        viewBox="0 0 16 16"
      >
        <path d="M4 1c2.21 0 4 1.755 4 3.92C8 2.755 9.79 1 12 1s4 1.755 4 3.92c0 3.263-3.234 4.414-7.608 9.608a.513.513 0 0 1-.784 0C3.234 9.334 0 8.183 0 4.92 0 2.755 1.79 1 4 1"/>
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        :width="size"
        :height="size"
        fill="currentColor" class="bi bi-suit-heart favorite-icon favorite-icon--outlined"
        viewBox="0 0 16 16"
      >
        <path d="m8 6.236-.894-1.789c-.222-.443-.607-1.08-1.152-1.595C5.418 2.345 4.776 2 4 2 2.324 2 1 3.326 1 4.92c0 1.211.554 2.066 1.868 3.37.337.334.721.695 1.146 1.093C5.122 10.423 6.5 11.717 8 13.447c1.5-1.73 2.878-3.024 3.986-4.064.425-.398.81-.76 1.146-1.093C14.446 6.986 15 6.131 15 4.92 15 3.326 13.676 2 12 2c-.777 0-1.418.345-1.954.852-.545.515-.93 1.152-1.152 1.595zm.392 8.292a.513.513 0 0 1-.784 0c-1.601-1.902-3.05-3.262-4.243-4.381C1.3 8.208 0 6.989 0 4.92 0 2.755 1.79 1 4 1c1.6 0 2.719 1.05 3.404 2.008.26.365.458.716.596.992a7.6 7.6 0 0 1 .596-.992C9.281 2.049 10.4 1 12 1c2.21 0 4 1.755 4 3.92 0 2.069-1.3 3.288-3.365 5.227-1.193 1.12-2.642 2.48-4.243 4.38z"/>
      </svg>
    </span>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  defineProps({
    /**
     * 控制愛心是否為實心 (已收藏) 狀態
     */
    isFavorite: {
      type: Boolean,
      required: true, // 這個狀態必須由父元件傳遞
      default: false
    },
    /**
     * 控制圖示的大小
     */
    size: {
      type: [String, Number],
      default: 16 // 預設大小與 SVG 原始尺寸一致
    }
  });
  </script>
  
  <style scoped>
  .favorite-icon-wrapper {
    display: inline-flex; /* 讓 span 的行為類似行內元素，但內部可用 flex 對齊 */
    align-items: center;    /* 垂直居中 SVG */
    justify-content: center; /* 水平居中 SVG */
    line-height: 0;         /* 避免繼承的行高影響佈局 */
    /* 預設繼承父元素的文字顏色，可被覆蓋 */
    color: inherit;
  }
  
  .favorite-icon {
    display: block; /* 確保 SVG 不會有多餘的底部空間 */
  }
  
  </style>