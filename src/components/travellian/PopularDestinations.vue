<template>
  <section class="destinations">
    <h2 class="destinations__hdl">熱門主題</h2>

    <div class="l-subhdl-wrapper">
      <h3 class="destinations__text">
        世界各地最受歡迎的目的地，從歷史名勝到 自然奇觀。
      </h3>
      <nav class="carousel-nav">
        <div class="carousel-nav__left left-btn">
          <img
            src="/images/wide_arrow.svg"
            alt="Left arrow"
            class="left-btn__img"
          />
        </div>
        <div class="carousel-nav__right right-btn">
          <img
            src="/images/wide_arrow.svg"
            alt="Right arrow"
            class="right-btn__img"
          />
        </div>
      </nav>
    </div>

    <div class="destinations__carousel carousel">
      <div
        v-for="(item, index) in destinations"
        :key="index"
        class="carousel-item"
      >
        <img :src="item.image" alt="" class="carousel-item__img" />
        <h3 class="carousel-item__hdl">{{ item.title }}</h3>
        <p class="carousel-item__location">{{ item.location }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

// 假資料，之後可改成 API 取資料
const destinations = ref([
  {
    image: "/images/destination1.jpg",
    title: "Monument of Berlin",
    location: "Berlin, Germany",
  },
  {
    image: "/images/destination2.jpg",
    title: "Millenium Bridge",
    location: "London, United Kingdom",
  },
  {
    image: "/images/destination3.jpg",
    title: "Rialto Bridge",
    location: "Venice, Italy",
  },
  {
    image: "/images/destination4.jpg",
    title: "Sea of Orange Tiles",
    location: "Lisbon, Portugal",
  },
]);
</script>
