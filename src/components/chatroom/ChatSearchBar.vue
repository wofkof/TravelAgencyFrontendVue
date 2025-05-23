<!-- src/components/chatroom/ChatSearchBar.vue -->
<template>
  <div class="search-bar">
    <el-input
      v-model="searchTextLocal"
      placeholder="搜尋訊息..."
      style="width: 100px"
      clearable
      @clear="handleClearSearch"
      @keyup.enter="handleSearch"
      size="small"
      :prefix-icon="Search"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";

const emit = defineEmits(["update:searchText", "update:isSearching"]);

const searchTextLocal = ref("");

// 監聽輸入變化同步回父層
watch(searchTextLocal, (val) => {
  emit("update:searchText", val);
});

const handleSearch = () => {
  emit("update:isSearching", !!searchTextLocal.value.trim());
};

const handleClearSearch = () => {
  searchTextLocal.value = "";
  emit("update:isSearching", false);
};
</script>

<style scoped>
.search-bar {
  border-bottom: 1px solid #eee;
}
</style>
