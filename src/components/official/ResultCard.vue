<!-- src/components/TripCard.vue -->
<template>
    <div class="trip-card">
      <img :src="coverImage" alt="封面圖片" class="trip-card__image" />
      <div class="trip-card__content">
        <h3 class="trip-card__title">{{ title }}</h3>
        <p class="trip-card__info">價格：${{ price }}</p>
        <p class="trip-card__info">出發日期：{{ date }}</p>
      </div>
    </div>
</template>

<script setup>
  defineProps({
    title: String,
    price: Number,
    date: String,
    coverImage: string // 圖片網址
  })
</script>