<template>
  <el-scrollbar>
    <el-badge
      v-for="room in chatStore.allChatRooms"
      :key="room.chatRoomId"
      :value="chatStore.unreadCountMap[room.chatRoomId] || 0"
      :hidden="!chatStore.unreadCountMap[room.chatRoomId]"
      class="mb-2 w-full"
    >
      <el-card
        class="cursor-pointer"
        @click="selectChatRoom(room.chatRoomId)"
        shadow="hover"
      >
        <div>聊天室編號：{{ room.chatRoomId }}</div>
        <div>
          建立時間：{{ formatDateTime(room.createdAt, { type: "date" }) }}
        </div>
      </el-card>
    </el-badge>
  </el-scrollbar>
</template>

<script setup>
import { onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { fetchChatRooms } from "@/services/chatService";
import { formatDateTime } from "@/utils/formatDateTime";

const chatStore = useChatStore();

onMounted(() => {
  const memberId = 11110;
  fetchChatRooms(memberId);
});

const selectChatRoom = (chatRoomId) => {
  chatStore.setCurrentChatRoom(chatRoomId);
  chatStore.unreadCountMap[chatRoomId] = 0;
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
