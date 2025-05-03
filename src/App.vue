<!-- <script setup>
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
  
</template> -->
<script setup>
import { ref } from "vue";
import { RouterView } from "vue-router";
import Navbar from "@/components/travellian/Navbar.vue";
import HeroContent from "@/components/travellian/HeroSection.vue";
import FloatingChat from "@/components/chatroom/FloatingChat.vue";

// ✅ 測試用組件
import ForgetPassword from "@/components/SignUp/ForgetPassword.vue";

const showForget = ref(false);
</script>

<template>
  <section class="hero">
    <Navbar />
    <HeroContent />
  </section>

  <router-view />
  <FloatingChat />

  <!-- ✅ 測試按鈕 -->
  <div class="fixed bottom-4 right-4 z-50">
    <button
      @click="showForget = true"
      class="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
    >
      測試忘記密碼彈窗
    </button>
  </div>

  <!-- ✅ 測試彈窗 -->
  <el-dialog v-model="showForget" width="800px" :close-on-click-modal="false">
    <ForgetPassword @switch-to-login="showForget = false" />
  </el-dialog>
</template>
