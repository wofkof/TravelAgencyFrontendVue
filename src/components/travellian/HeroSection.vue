<template>
  <!-- 主標題與副標題 -->
  <div class="lead" style="margin-top: 200px">
    <h1 class="lead__hdl fade-slide-up">探索世界的美麗</h1>
    <p class="lead__text fade-slide-up delay">嶼你同行，開啟您的夢想之旅</p>
  </div>

  <!-- 搜尋表單 -->
  <form class="search" @submit.prevent="handleSearch" style="max-width: 97%;">
    <div class="search__wrapper" style="height: 150px;">
      <div class="search__group">
        <label for="keyword" class="search__lbl">關鍵字</label>
        <input
          type="link"
          id="keyword"
          v-model="search.keyword"
          class="search__input"
          placeholder="請輸入關鍵字..."
        />
      </div>
      <div class="search__group">
        <label for="person" class="search__lbl">人數</label>
        <select id="person" v-model="search.person" class="search__input">
          <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
      <div class="search__group">
        <label for="checkin" class="search__lbl">最早出發日</label>
        <input
          type="date"
          id="checkin"
          v-model="search.checkin"
          class="search__input"
        />
      </div>
      <div class="search__group">
        <label for="checkout" class="search__lbl">最晚出發日</label>
        <input
          type="date"
          id="checkout"
          v-model="search.checkout"
          class="search__input"
        />
      </div>
      <button type="submit" class="search__btn" style="height: 150px;">
        <span class="l-search-btn-wrapper" data-text="Book">
          立即<br />預訂
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { useRouter } from "vue-router";
import { reactive } from "vue";
import { useSearchResultStore } from "@/stores/useSearchResultStore";
import { ElMessage } from 'element-plus';
import api from "@/utils/api";

const router = useRouter();
const searchResultStore = useSearchResultStore();

const search = reactive({
  keyword: "",
  person: 1,
  checkin: null,
  checkout: null
});

// 將日期轉為 yyyy-MM-dd 格式，空值不送
const formatDate = (date) => {
  return date instanceof Date ? date.toISOString().slice(0, 10) : "";
};

const handleSearch = async () => {
  const params = {
    destination: search.keyword,
    peopleCount: search.person,
  };

  // 只有有填才加進參數
  const startDate = formatDate(search.checkin);
  const endDate = formatDate(search.checkout);
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  try {
    const response = await api.get("/OfficialSearch/search", { params });

    searchResultStore.searchInput = {
      destination: search.keyword,
      peopleCount: search.person,
      startDate: search.checkin,
      endDate: search.checkout
    };
    searchResultStore.searchResult = response.data;

    router.push("/SearchResult");

  } catch (err) {
    console.error(err);
    ElMessage({
        message: '輸入正確的關鍵字！',
        type: 'error',
      });
  }
};
</script>

<style>
.fade-slide-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 1s ease-out forwards;
}

.fade-slide-up.delay {
  animation-delay: 0.5s;
}

@keyframes fadeSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

