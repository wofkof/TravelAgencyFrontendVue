<template>
  <el-button type="primary" :loading="isLoading" @click="handleStartChat">
    聯絡客服
  </el-button>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { createChatWithCustomerService } from "@/apis/chatRoomApi";
import { useChatStore } from "@/stores/chatStore";
import { setupSocket } from "@/utils/socket";
import { fetchChatRooms } from "@/services/chatService";

const isLoading = ref(false);
const chatStore = useChatStore();

const handleStartChat = async () => {
  isLoading.value = true;
  try {
    const chatRoomId = await createChatWithCustomerService(chatStore.memberId);
    await setupSocket(chatRoomId);

    await fetchChatRooms(chatStore.memberId);

    const exists = chatStore.allChatRooms.find(
      (r) => r.chatRoomId === chatRoomId
    );

    if (exists) {
      ElMessage.info("已為您連接客服聊天室");
    }

    chatStore.setCurrentChatRoom(chatRoomId);
  } catch (error) {
    ElMessage.error("無法建立客服聊天室");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>
