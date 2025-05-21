<template>
  <el-button size="small" type="warning" @click="testFakeMessage" plain circle>
    <el-icon><Bell /></el-icon>
  </el-button>
</template>

<script setup>
import { useChatStore } from "@/stores/chatStore";

const chatStore = useChatStore();

const testFakeMessage = () => {
  const chatRoomId = chatStore.currentChatRoomId || 1;

  const newMessage = {
    senderType: "Employee",
    senderId: 1,
    messageType: "text",
    content: "模擬訊息" + new Date().toLocaleTimeString(),
    sentAt: new Date(),
    isRead: false,
  };

  chatStore.addMessage(chatRoomId, newMessage);

  if (
    chatRoomId !== chatStore.currentChatRoomId ||
    // @ts-ignore
    !window.isScrolledToBottom?.()
  ) {
    chatStore.unreadCountMap[chatRoomId] =
      (chatStore.unreadCountMap[chatRoomId] || 0) + 1;
  }
};
</script>
