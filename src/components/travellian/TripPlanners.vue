<template>
  <section class="planners">
    <div class="planners__sidebar sidebar">
      <div class="sidebar__hdl">旅行計劃</div>
      <div class="sidebar__txt">20年後，你會對現在的事情更加失望 沒有做...</div>
      <div class="l-btn-wrapper">
        <button class="sidebar__btn">查看所有旅行計劃</button>
      </div>
    </div>

    <div class="planners__carousel carousel">
      <div v-for="(plan, index) in planners" :key="index" class="carousel-item">
        <img :src="plan.image" :alt="plan.alt" class="carousel-item__img" />
        <div class="l-active-item">
          <div class="l-active-item-header">
            <span class="carousel-item__hdl">{{ plan.title }}</span>
            <span class="carousel-item__price">{{ plan.price }}</span>
          </div>
          <div class="carousel-item__location">{{ plan.location }}</div>
          <div class="l-active-item-footer">
            <span class="carousel-item__rating"></span>
            <span class="carousel-item__details">{{ plan.details }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const planners = ref([
  {
    image: "/images/planners1.jpg",
    alt: "Colosseum in the evening",
    title: "導覽",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners2.jpg",
    alt: "Eiffel tower in Autumn",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners3.jpg",
    alt: "Nightlife in Barcelona",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners4.jpg",
    alt: "Cathedral in Germany",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners1.jpg",
    alt: "Colosseum in the evening",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners2.jpg",
    alt: "Eiffel tower in Autumn",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners3.jpg",
    alt: "Nightlife in Barcelona",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
  {
    image: "/images/planners4.jpg",
    alt: "Cathedral in Germany",
    title: "Guided tour",
    price: "NT$120/天",
    location: "羅馬城市之旅",
    details: "七日遊",
  },
]);
</script>
