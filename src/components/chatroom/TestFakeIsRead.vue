<template>
  <el-button @click="userStore.toggleUser">
    切換為：{{ userStore.senderType }}（ID: {{ userStore.senderId }}）
  </el-button>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
</script>
