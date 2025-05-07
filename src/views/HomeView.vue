<template>
  <section class="hero">
    <HeroSection />
  </section>
  <div class="l-grid">
    <div class="l-grid__item">
      <PopularDestinations />
    </div>
    <div class="l-grid__item">
      <SpecialOffer />
    </div>
    <div class="l-grid__item">
      <BlogSection />
    </div>
    <div class="l-grid__item">
      <TripPlanners />
    </div>
    <div class="l-grid__item">
      <GallerySection />
    </div>
    <div class="l-grid__item">
      <TestimonialSection />
    </div>
  </div>
</template>

<script setup>
import PopularDestinations from "@/components/travellian/PopularDestinations.vue";
import SpecialOffer from "@/components/travellian/SpecialOffer.vue";
import BlogSection from "@/components/travellian/BlogSection.vue";
import TripPlanners from "@/components/travellian/TripPlanners.vue";
import GallerySection from "@/components/travellian/GallerySection.vue";
import TestimonialSection from "@/components/travellian/TestimonialSection.vue";
import HeroSection from "@/components/travellian/HeroSection.vue";
</script>
