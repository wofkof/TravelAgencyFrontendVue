<template>
  <div>
    <h2>聊天室列表</h2>
    <ul>
      <li
        v-for="room in chatStore.allChatRooms"
        :key="room.chatRoomId"
        @click="selectChatRoom(room.chatRoomId)"
      >
        聊天室編號: {{ room.chatRoomId }} <br />
        建立時間: {{ formatDateTime(room.createdAt, { type: "datetime" }) }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { getChatRooms } from "@/apis/chatRoomApi"
import { formatDateTime } from "@/utils/formatDateTime";

const chatStore = useChatStore();

onMounted(async () => {
  const memberId = 11110;
  const rooms = await getChatRooms(memberId);
  chatStore.setChatRooms(rooms);
});

const selectChatRoom = (chatRoomId) => {
  chatStore.setCurrentChatRoom(chatRoomId);
};
</script>
