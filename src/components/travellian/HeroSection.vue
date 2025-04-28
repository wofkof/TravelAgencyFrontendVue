<template>
  <!-- 主標題與副標題 -->
  <div class="lead">
    <h1 class="lead__hdl">
      探索世界的美麗<br />
      <span style="font-size: 80px"> 留下永恆的回憶 </span>
    </h1>
    <p class="lead__text">嶼你同行，開啟您的夢想之旅</p>
  </div>

  <!-- 搜尋表單 -->
  <form class="search" @submit.prevent="handleSearch">
    <div class="search__wrapper">
      <div class="search__group">
        <label for="destination" class="search__lbl">目的地</label>
        <input
          type="text"
          id="destination"
          v-model="search.destination"
          class="search__input"
          placeholder="請輸入目的地..."
        />
      </div>
      <div class="search__group">
        <label for="person" class="search__lbl">人數</label>
        <select id="person" v-model="search.person" class="search__input">
          <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
      <div class="search__group">
        <label for="checkin" class="search__lbl">出發日</label>
        <input
          type="date"
          id="checkin"
          v-model="search.checkin"
          class="search__input"
        />
      </div>
      <div class="search__group">
        <label for="checkout" class="search__lbl">結束日</label>
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
import { reactive } from "vue";

// 搜尋表單的資料綁定
const search = reactive({
  destination: "",
  person: 1,
  checkin: "",
  checkout: "",
});

// 處理搜尋提交
const handleSearch = () => {
  console.log("Search Data:", search);
  alert(
    `Searching trips to ${search.destination} for ${search.person} person(s)!`
  );
};
</script>
