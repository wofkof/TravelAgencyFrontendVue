<template>
  <el-scrollbar v-if="chatStore.isChatRoomsLoaded">
    <el-badge
      v-for="room in chatStore.allChatRooms"
      :key="room.chatRoomId"
      :value="chatStore.unreadCountMap[room.chatRoomId] || 0"
      :hidden="!chatStore.unreadCountMap[room.chatRoomId]"
      class="mb-2 w-full"
    >
      <el-card
        class="cursor-pointer"
        :class="{ selected: room.chatRoomId === chatStore.currentChatRoomId }"
        @click="selectChatRoom(room.chatRoomId)"
        shadow="hover"
        style="margin: 5px"
      >
        <div class="d-flex justify-between align-center">
          <div style="font-weight: bold">
            <template v-if="room.employeeName">
              {{ room.employeeName }}
            </template>
            <template v-else>
              <el-skeleton :rows="1" animated style="width: 60px" />
            </template>
          </div>
          <el-button
            circle
            plain
            size="small"
            @click.stop="showCallLogs(room.chatRoomId)"
          >
            <el-icon><View /></el-icon>
          </el-button>
        </div>
        <div class="chatroom-meta">
          <div>
            最後訊息：
            {{
              room.lastMessageAt
                ? formatRelativeTime(room.lastMessageAt)
                : "尚無訊息"
            }}
          </div>
          <div>
            建立於：
            {{ formatDateTime(room.createdAt, { type: "date" }) }}
          </div>
        </div>
      </el-card>
    </el-badge>
  </el-scrollbar>
  <CallLogDialog
    v-if="selectedChatRoomId"
    :visible="callLogVisible"
    :chatRoomId="selectedChatRoomId"
    @update:visible="callLogVisible = $event"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { fetchChatRooms } from "@/services/chatService";
import { formatDateTime, formatRelativeTime } from "@/utils/formatDateTime";
import CallLogDialog from "@/components/chatroom/CallLogDialog.vue";

const chatStore = useChatStore();
const callLogVisible = ref(false);
const selectedChatRoomId = ref(null);

onMounted(async () => {
  if (chatStore.memberId) {
    await fetchChatRooms(chatStore.memberId);
  } else {
    ElMessage.error("請先登入，載入聊天室列表");
  }
});

const selectChatRoom = (chatRoomId) => {
  chatStore.setCurrentChatRoom(chatRoomId);
  chatStore.unreadCountMap[chatRoomId] = 0;
};

const showCallLogs = (chatRoomId) => {
  selectedChatRoomId.value = chatRoomId;
  callLogVisible.value = true;
};
</script>

<style scoped>
.d-flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
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
.chatroom-meta {
  font-size: 11px;
  color: gray;
  line-height: 1.4;
}
.selected {
  border: 2px solid #409eff;
  background-color: #f0f9ff;
}
</style>
