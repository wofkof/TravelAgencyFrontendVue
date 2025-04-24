<template>
  <section class="gallery">
    <h2 class="gallery__hdl">Destination Gallery</h2>
    <div class="l-subhdl-wrapper">
      <p class="gallery__text">Our photo gallery on trip</p>
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
    </div>

    <div class="gallery__carousel carousel">
      <img
        v-for="(image, index) in visibleImages"
        :key="index"
        :src="image.src"
        :alt="image.alt"
        class="carousel-item"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

const galleryImages = [
  { src: "/images/gallery1.jpg", alt: "A man standing on a staircase" },
  { src: "/images/gallery2.jpg", alt: "Two lovers at a sunset near an ocean" },
  { src: "/images/gallery3.jpg", alt: "A woman touring a narrow street" },
  { src: "/images/gallery4.jpg", alt: "A man on a train-track" },
  { src: "/images/gallery1.jpg", alt: "A man standing on a staircase" },
  { src: "/images/gallery2.jpg", alt: "Two lovers at a sunset near an ocean" },
  { src: "/images/gallery3.jpg", alt: "A woman touring a narrow street" },
  { src: "/images/gallery4.jpg", alt: "A man on a train-track" },
];

const currentIndex = ref(0);
const itemsPerPage = 4; 

const visibleImages = computed(() => {
  return galleryImages.slice(
    currentIndex.value,
    currentIndex.value + itemsPerPage
  );
});

function nextSlide() {
  if (currentIndex.value < galleryImages.length - itemsPerPage) {
    currentIndex.value++;
  }
}

function prevSlide() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
}
</script>
