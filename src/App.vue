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

  <!-- ✅ 會員中心測試按鈕 -->
  <div class="fixed bottom-4 right-4 z-50">
    <router-link
      to="/member-center"
      class="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-center"
    >
      測試會員中心
    </router-link>
  </div>

</template>
