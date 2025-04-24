<template>
  <!-- 主標題與副標題 -->
  <div class="lead">
    <h1 class="lead__hdl">
      Start your unforgettable<br />
      journey with us
    </h1>
    <p class="lead__text">The best travel for your journey begins now</p>
  </div>

  <!-- 搜尋表單 -->
  <form class="search" @submit.prevent="handleSearch">
    <div class="search__wrapper">
      <div class="search__group">
        <label for="destination" class="search__lbl">Destination</label>
        <input
          type="text"
          id="destination"
          v-model="search.destination"
          class="search__input"
          placeholder="Dubai"
        />
      </div>
      <div class="search__group">
        <label for="person" class="search__lbl">Person</label>
        <select id="person" v-model="search.person" class="search__input">
          <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
        </select>
      </div>
      <div class="search__group">
        <label for="checkin" class="search__lbl">Check In</label>
        <input
          type="date"
          id="checkin"
          v-model="search.checkin"
          class="search__input"
        />
      </div>
      <div class="search__group">
        <label for="checkout" class="search__lbl">Check Out</label>
        <input
          type="date"
          id="checkout"
          v-model="search.checkout"
          class="search__input"
        />
      </div>
      <button type="submit" class="search__btn">
        <span class="l-search-btn-wrapper" data-text="Book">
          Book<br />Now
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
