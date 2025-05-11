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
  <main class="main-content-area" style="margin-top: 155px">
    <router-view />
  </main>

  <!-- ✅ 會員中心測試按鈕 -->
  <div class="fixed bottom-4 right-4 z-50">
    <router-link
      to="/member-center"
      class="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-center"
    >
      測試會員中心
    </router-link>
  </div>

  <FloatingChat />

  <NewsletterSection />
  <FooterSection />
</template>
