<template>
  <div class="audio-call-wrapper">
    <el-button
      size="small"
      type="danger"
      plain
      circle
      @click="startCall(targetId)"
    >
      <el-icon><Phone /></el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { callUser, listenForCallEvents } from "@/services/webrtcService";
import { onMounted, computed } from "vue";
import { Phone } from "@element-plus/icons-vue";
import { useChatStore } from "@/stores/chatStore";

const chatStore = useChatStore();
const targetId = computed(() => chatStore.getTargetUserId);

onMounted(() => {
  listenForCallEvents(); // ✅ 保證事件只綁一次
});

const startCall = async (id) => {
  await callUser(id); // ✅ 呼叫 WebRTC 封裝的流程
};
</script>

<style scoped>
.audio-call-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
