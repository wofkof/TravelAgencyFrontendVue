<template>
  <!-- 主標題與副標題 -->
  <div class="lead" style="margin-top: 200px">
    <h1 class="lead__hdl fade-slide-up">探索世界的美麗</h1>
    <p class="lead__text fade-slide-up delay">嶼你同行，開啟您的夢想之旅</p>
  </div>

  <!-- 搜尋表單 -->
  <form class="search" @submit.prevent="handleSearch">
    <div class="search__wrapper">
      <div class="search__group">
        <label for="keyword" class="search__lbl">關鍵字</label>
        <input
          type="text"
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
      <button type="submit" class="search__btn">
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

const router = useRouter();
const searchResultStore = useSearchResultStore();

const search = reactive({
  keyword: "",
  person: 1,
  checkin: null,
  checkout: null
});

const handleSearch = async () => {
  const query = new URLSearchParams({
    destination: search.keyword,
    peopleCount: search.person,
    startDate: search.checkin ?? '',
    endDate: search.checkout ?? ''
  }).toString();

  try {
    const response = await fetch(`https://localhost:7265/api/OfficialSearch/search?${query}`);

    if (!response.ok) {
      throw new Error("查詢失敗：" + response.status);
    }

    const data = await response.json();

    // 存入 Pinia
    searchResultStore.searchInput = {
      destination: search.keyword,
      peopleCount: search.person,
      startDate: search.checkin,
      endDate: search.checkout
    };
    searchResultStore.searchResult = data;

    // 導向搜尋結果頁
    router.push("/SearchResult");

  } catch (err) {
    console.error(err);
    alert("請輸入正確關鍵字");
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

