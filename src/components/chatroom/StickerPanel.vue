<template>
  <div class="sticker-panel">
    <!-- 分類切換 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="{ active: cat === selectedCategory }"
        @click="loadStickers(cat)"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 貼圖顯示 -->
    <div class="sticker-list">
      <img
        v-for="s in stickers"
        :key="s.id"
        :src="s.url"
        class="sticker"
        @click="$emit('select', s.url)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/utils/api";

const stickers = ref([]);
const categories = ref([]);
const selectedCategory = ref("");

// 初始載入分類與第一組貼圖
onMounted(async () => {
  try {
    const res = await api.get("/stickers/all-categories");
    categories.value = res.data;
    if (categories.value.length > 0) {
      selectedCategory.value = categories.value[0];
      loadStickers(selectedCategory.value);
    }
  } catch (err) {
    console.error("無法載入貼圖分類", err);
  }
});

// 切換分類時載入對應貼圖
const loadStickers = async (category) => {
  try {
    selectedCategory.value = category;
    const res = await api.get("/stickers/by-category", {
      params: { category },
    });
    stickers.value = res.data;
  } catch (err) {
    console.error("無法載入貼圖", err);
  }
};
</script>

<style scoped>
.sticker-panel {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  width: 300px;
  position: absolute;
  bottom: 60px;
  right: 10px;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.category-tabs button {
  padding: 4px 10px;
  font-size: 14px;
  border: 1px solid #aaa;
  background: #f4f4f4;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.category-tabs button.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

.sticker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sticker {
  width: 60px;
  height: 60px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s;
}

.sticker:hover {
  transform: scale(1.1);
}
</style>
