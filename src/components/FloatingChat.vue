<template>
  <div class="chat-float-button" @click="toggleChat">
    <el-icon :size="24">
      <ChatDotRound />
    </el-icon>
  </div>
  <div v-if="showChat" class="chat-popup">
    <div class="chat-popup-header">
      <span>聊天室</span>
      <el-icon class="close-btn" @click="toggleChat">
        <CloseBold />
      </el-icon>
    </div>
    <div class="chat-popup-body">
      <ChatRoomList />
      <MessageBox />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ChatRoomList from "@/components/chatroom/ChatRoomList.vue";
import MessageBox from "@/components/chatroom/MessageBox.vue";

const showChat = ref(false);
function toggleChat() {
  showChat.value = !showChat.value;
}
</script>

<style scoped>
.chat-float-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  background-color: #007bff;
  color: white;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-size: 24px;
  transition: background-color 0.3s;
}
.chat-float-button:hover {
  background-color: #0056b3;
  transform: scale(1.1);
}
.chat-popup {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 320px;
  height: 420px;
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
}
.chat-popup-header {
  background-color: #007bff;
  color: white;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  color: white;
  width: 1em;
  cursor: pointer;
}
.close-btn:hover {
  transform: scale(1.4);
}
.chat-popup-body {
  flex: 1;
  background: #f8f9fa;
  overflow-y: auto;
  padding: 10px;
}
</style>
