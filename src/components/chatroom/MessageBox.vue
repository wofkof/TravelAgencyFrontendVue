<template>
  <div>
    <h2>編號 {{ chatStore.currentChatRoomId }}</h2>
    <div v-for="msg in currentMessages" :key="msg.sentAt">
      [{{ msg.senderType }}]: {{ msg.content }}
    </div>

    <input
      v-model="newMessage"
      placeholder="輸入訊息..."
      @keydown.enter="send"
    />
    <ElButton @click="send">送出</ElButton>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { setupSocket, sendMessage } from "@/utils/socket";
import { getMessages } from "@/apis/messageApi";

const chatStore = useChatStore();
const newMessage = ref("");

const currentMessages = computed(() => {
  const chatRoomId = chatStore.currentChatRoomId;
  return chatStore.chatRooms[chatRoomId] || [];
});

const send = async () => {
  const messageContent = newMessage.value.trim();
  if (!messageContent) return;

  const chatRoomId = chatStore.currentChatRoomId;

  const newMsg = {
    senderType: "Member",
    senderId: 11110,
    messageType: "Text",
    content: messageContent,
    sendAt: new Date().toISOString(),
  };

  chatStore.addMessage(chatRoomId, newMsg);

  try {
    await sendMessage(chatRoomId, "Member", 11110, "Text", messageContent);
  } catch (err) {
    console.error("送出訊息失敗", err);
    alert("發送訊息失敗");
  }

  newMessage.value = "";
};

onMounted(async () => {
  if (!chatStore.currentChatRoomId) {
    chatStore.setCurrentChatRoom(1);
  }
  await setupSocket();

  const messages = await getMessages(chatStore.currentChatRoomId);

  chatStore.setMessages(chatStore.currentChatRoomId, messages);
});
</script>
