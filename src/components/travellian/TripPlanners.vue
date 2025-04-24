<template>
  <section class="planners">
    <div class="planners__sidebar sidebar">
      <div class="sidebar__hdl">Trip Planners</div>
      <div class="sidebar__txt">
        20 years from now you will be more disappointed by the things that you
        didn't do...
      </div>
      <div class="l-btn-wrapper">
        <button class="sidebar__btn">View all trip plans</button>
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
    title: "Guided tour",
    price: "€120/Day",
    location: "Rome City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners2.jpg",
    alt: "Eiffel tower in Autumn",
    title: "Guided tour",
    price: "€99/Day",
    location: "Paris City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners3.jpg",
    alt: "Nightlife in Barcelona",
    title: "Guided tour",
    price: "€89/Day",
    location: "Barcelona City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners4.jpg",
    alt: "Cathedral in Germany",
    title: "Guided tour",
    price: "€79/Day",
    location: "Wittenberg City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners1.jpg",
    alt: "Colosseum in the evening",
    title: "Guided tour",
    price: "€120/Day",
    location: "Rome City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners2.jpg",
    alt: "Eiffel tower in Autumn",
    title: "Guided tour",
    price: "€99/Day",
    location: "Paris City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners3.jpg",
    alt: "Nightlife in Barcelona",
    title: "Guided tour",
    price: "€89/Day",
    location: "Barcelona City Tour",
    details: "7 Days tour",
  },
  {
    image: "/images/planners4.jpg",
    alt: "Cathedral in Germany",
    title: "Guided tour",
    price: "€79/Day",
    location: "Wittenberg City Tour",
    details: "7 Days tour",
  },
]);
</script>
