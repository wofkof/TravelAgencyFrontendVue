<template>
  <section class="testimonial">
    <h2 class="testimonial__hdl">旅行者的評論</h2>
    <!-- <p class="testimonial__subhdl">
      以下是來自我們旅行者的一些很棒的回饋
    </p> -->
    <div class="testimonial__carousel carousel">
      <div
        v-for="(review, index) in reviews"
        :key="index"
        class="carousel-item"
      >
        <img :src="review.avatar" alt="Avatar" class="carousel-item__avatar" />
        <p class="carousel-item__review">{{ review.text }}</p>
        <div class="carousel-item__rating"></div>
        <div class="carousel-item__name">{{ review.name }}</div>
        <div class="carousel-item__title">{{ review.title }}</div>
      </div>
    </div>
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
  </section>
</template>

<script setup>
import { ref } from "vue";

const reviews = ref([
  {
    avatar: "/images/testimonial1.png",
    text: "這次的環島行程規劃得非常貼心！我特別想去花蓮看太魯閣，但又不想錯過南部的海線，客服人員很細心聽我需求，住宿與交通銜接得很順暢。沿途的在地美食推薦也超讚，讓我體驗了不一樣的台灣。",
    name: "張雅雯",
    title: "台東旅行家",
  },
  {
    avatar: "/images/testimonial2.png",
    text: "行程規劃得很貼心，想去的景點都有排到，整體體驗很順暢，會再回購～",
    name: "林冠廷",
    title: "台北旅行家",
  },
  {
    avatar: "/images/testimonial3.png",
    text: "很喜歡這種依照需求客製的行程，輕鬆又有深度，推薦給朋友了！",
    name: "陳怡君",
    title: "家庭旅遊",
  }
]);
</script>
