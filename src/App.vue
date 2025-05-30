<script setup>
import { RouterView } from "vue-router";
import Navbar from "@/components/travellian/Navbar.vue";
import HeroContent from "@/components/travellian/HeroSection.vue";
import FooterSection from "@/components/travellian/FooterSection.vue";
import NewsletterSection from "@/components/travellian/NewsletterSection.vue";
import FloatingChat from "@/components/chatroom/FloatingChat.vue";
import GlobalCallHandler from "@/components/chatroom/GlobalCallHandler.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import CheckoutSteps from "@/components/tools/CheckoutSteps.vue";
import AudioCall from "./components/chatroom/AudioCall.vue";
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import AuthModal from "@/components/SignUp/AuthModal.vue";
import { useChatStore } from "@/stores/chatStore.js";
import { joinAllChatRooms, setupSocket, waitForConnectionReady } from "@/utils/socket";

const authStore = useAuthStore();
const chatStore = useChatStore();

onMounted(async () => {
  authStore.loadFromStorage();

  if (authStore.memberId) {
    await chatStore.initChatRooms();
    await setupSocket(null);
    await waitForConnectionReady();
    await joinAllChatRooms(chatStore.allChatRooms);
  }
});

// 取得目前的路由物件
const route = useRoute(); // <-- 取得 route

// 建立一個計算屬性，如果目前路徑是 '/'，則回傳 true
const isHomePage = computed(() => route.path === "/"); // <-- 檢查路徑

// 計算屬性，判斷當前路由是否需要顯示步驟導覽列
const showCheckoutSteps = computed(() => {
  const currentPath = route.path;

  return (
    currentPath === "/ShoppingCart" ||
    currentPath === "/order-form" ||
    currentPath.startsWith("/order-complete")
  );
});
function handleLoginSuccess() {
  authStore.loadFromStorage();
  authStore.closeLoginModal();
}
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
  <AuthModal
    v-model="authStore.showLoginModal"
    @login-success="handleLoginSuccess"
  />
</template>
