<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/travellian/Navbar.vue";
import HeroContent from "@/components/travellian/HeroSection.vue";
</script>

<template>
  <section class="hero">
    <Navbar />
    <HeroContent />
  </section>
  <router-view />
</template>
