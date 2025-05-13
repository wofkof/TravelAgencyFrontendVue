<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/travellian/Navbar.vue";
import HeroContent from "@/components/travellian/HeroSection.vue";
import FooterSection from "@/components/travellian/FooterSection.vue";
import NewsletterSection from "@/components/travellian/NewsletterSection.vue";
import FloatingChat from "@/components/chatroom/FloatingChat.vue";
import GlobalCallHandler from "@/components/chatroom/GlobalCallHandler.vue";
import { computed } from "vue"; // <-- 匯入 computed
import { useRoute } from "vue-router"; // <--  僅保留 useRoute 的引入
import CheckoutSteps from "@/components/tools/CheckoutSteps.vue"; // --- 匯入新的步驟條元件 ---
import AudioCall from "./components/chatroom/AudioCall.vue";

// 取得目前的路由物件
const route = useRoute(); // <-- 取得 route

// 建立一個計算屬性，如果目前路徑是 '/'，則回傳 true
const isHomePage = computed(() => route.path === "/"); // <-- 檢查路徑

// 計算屬性，判斷當前路由是否需要顯示步驟導覽列
const showCheckoutSteps = computed(() => {
  const checkoutPaths = ["/cart", "/order-form", "/order-complete"];
  return checkoutPaths.includes(route.path);
});
</script>

<template>
  <Navbar />
  <CheckoutSteps style="margin-top: 155px" v-if="showCheckoutSteps" />

  <GlobalCallHandler />
  <audio id="remote-audio" autoplay playsinline style="display: none"></audio>
  <main class="main-content-area" style="margin-top: 155px">
    <router-view />
  </main>

  <FloatingChat />
  <AudioCall ref="audioCallRef" />

  <NewsletterSection />
  <FooterSection />
</template>
