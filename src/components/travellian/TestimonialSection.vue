<template>
  <section class="testimonial">
    <h2 class="testimonial__hdl">Traveler's Experiences</h2>
    <p class="testimonial__subhdl">
      Here some awesome feedback from our travelers
    </p>
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
    text: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born...",
    name: "John Doe",
    title: "Accountant",
  },
  {
    avatar: "/images/testimonial2.png",
    text: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born...",
    name: "John Smith",
    title: "Journalist, HWO News",
  },
  {
    avatar: "/images/testimonial3.png",
    text: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born...",
    name: "Tamara Bellis",
    title: "Managing Director, JTH",
  },
]);
</script>
