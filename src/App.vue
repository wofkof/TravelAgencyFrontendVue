<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/travellian/Navbar.vue";
import HeroContent from "@/components/travellian/HeroSection.vue";
import FloatingChat from "@/components/chatroom/FloatingChat.vue";

</script>

<template>
  <section class="hero">
    <Navbar />
    <HeroContent />
  </section>

  <router-view />

  <FloatingChat />
</template>
