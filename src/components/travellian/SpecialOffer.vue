<template>
  <section class="offer">
    <h2 class="offer__hdl">Special Offer</h2>
    <div class="l-offer-subhdl">
      <nav class="carousel-nav">
        <div class="carousel-nav__left left-btn" @click="prevSlide">
          <img
            src="/images/wide_arrow.svg"
            alt="Left arrow"
            class="left-btn__img"
          />
        </div>
        <div class="carousel-nav__right right-btn" @click="nextSlide">
          <img
            src="/images/wide_arrow.svg"
            alt="Right arrow"
            class="right-btn__img"
          />
        </div>
      </nav>

      <h3 class="offer__text">Check out our special offer and discounts</h3>
    </div>

    <div class="offer__carousel carousel">
      <div
        v-for="(offer, index) in visibleOffers"
        :key="index"
        class="carousel-item"
      >
        <img :src="offer.image" alt="" class="carousel-item__img" />
        <h3 class="carousel-item__location">{{ offer.location }}</h3>
        <div class="carousel-item__rating"></div>
        <div class="carousel-item__desc">{{ offer.description }}</div>
        <div class="l-price-wrapper">
          <span class="carousel-item__price">
            <span class="carousel-item__price-from">From</span>
            <span class="carousel-item__price-price">{{ offer.price }}</span>
          </span>
          <button class="carousel-item__btn">Details</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

// 假資料
const offers = ref([
  {
    image: "/images/offer1.jpg",
    location: "Lisbon, Portugal",
    description:
      "5 nights and 4 days in 5 star hotel, breakfast and lunch included.Very popular during the renaissance. Passage and going through the cities of the world literature.",
    price: "€500",
  },
  {
    image: "/images/offer2.jpg",
    location: "Athens, Greece",
    description:
      "5 nights and 4 days in 5 star hotel, breakfast and lunch included.Very popular during the renaissance. Passage and going through the cities of the world literature.",
    price: "€800",
  },
  {
    image: "/images/offer3.jpg",
    location: "Rome, Italy",
    description:
      "5 nights and 4 days in 5 star hotel, breakfast and lunch included.Very popular during the renaissance. Passage and going through the cities of the world literature.",
    price: "€750",
  },
  {
    image: "/images/offer1.jpg",
    location: "Berlin, Germany",
    description: "...",
    price: "€600",
  },
  {
    image: "/images/offer2.jpg",
    location: "Paris, France",
    description: "...",
    price: "€900",
  },
]);

const currentIndex = ref(0);
const itemsPerPage = 3;

// 計算當前顯示的卡片
const visibleOffers = computed(() => {
  return offers.value.slice(
    currentIndex.value,
    currentIndex.value + itemsPerPage
  );
});

// 點擊右箭頭
function nextSlide() {
  if (currentIndex.value < offers.value.length - itemsPerPage) {
    currentIndex.value++;
  }
}

// 點擊左箭頭
function prevSlide() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}
</script>
