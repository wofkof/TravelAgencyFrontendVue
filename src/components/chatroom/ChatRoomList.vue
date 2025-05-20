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
        style="margin: 5px"
      >
        <div style="text-align: center">聊天室({{ room.chatRoomId }})</div>
        <div style="font-size: xx-small; color: gray">
          創建時間 : {{ formatDateTime(room.createdAt, { type: "date" }) }}
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
  if (chatStore.memberId) {
    fetchChatRooms(chatStore.memberId);
  } else {
    ElMessage.error("請先登入，載入聊天室列表");
  }
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
.el-badge {
  position: relative;
  display: block;
}
:deep(.el-badge__content) {
  top: 5px !important;
  right: 20px !important;
}
</style>
