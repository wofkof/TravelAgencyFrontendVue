<template>
  <div class="chat-float-wrapper" @click="toggleChat">
    <div class="chat-float-button">
      <el-badge :value="totalUnreadCount" :max="99" :show-zero="false">
        <el-icon :size="30">
          <ChatDotRound />
        </el-icon>
      </el-badge>
    </div>
  </div>

  <div v-if="showChat" class="chat-popup">
    <div class="chat-popup-header">
      <span>聊天室</span>
      <el-icon class="close-btn" @click="toggleChat">
        <CloseBold />
      </el-icon>
    </div>
    <div class="chat-popup-body">
      <div class="chat-room-list">
        <ChatRoomList />
      </div>
      <div class="chat-message-box">
        <MessageBox />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import ChatRoomList from "@/components/chatroom/ChatRoomList.vue";
import MessageBox from "@/components/chatroom/MessageBox.vue";
import { useChatStore } from "@/stores/chatStore";

const showChat = ref(false);
const chatStore = useChatStore();

const totalUnreadCount = computed(() => {
  return Object.values(chatStore.unreadCountMap).reduce((sum, c) => sum + c, 0);
});

function toggleChat() {
  showChat.value = !showChat.value;

  if (showChat.value) {
    Object.keys(chatStore.unreadCountMap).forEach((key) => {
      chatStore.unreadCountMap[key] = 0;
    });
  }
}
</script>

<style scoped>
.chat-float-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-float-button {
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

  position: relative;
}

.chat-float-button:hover {
  background-color: #0056b3;
  transform: scale(1.1);
}
.chat-popup {
  position: fixed;
  bottom: 90px;
  right: 24px;
  width: 480px;
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
  overflow: hidden;
  padding: 0;
  display: flex; /* ✅ 改為左右排列 */
  flex-direction: row;
}

/* 左側聊天室清單 */
.chat-room-list {
  width: 120px;
  border-right: 1px solid #ddd;
  padding: 8px;
  overflow-y: auto;
  background: #fff;
}

/* 右側訊息區 */
.chat-message-box {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
}
</style>
