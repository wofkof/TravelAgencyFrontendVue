import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useChatStore = defineStore("chat", () => {
  const chatRooms = reactive({});
  const allChatRooms = ref([]);
  const currentChatRoomId = ref(null);

  const unreadCountMap = reactive({});

  const setCurrentChatRoom = (chatRoomId) => {
    currentChatRoomId.value = chatRoomId;
    unreadCountMap[chatRoomId] = 0;
    if (!chatRooms[chatRoomId]) {
      chatRooms[chatRoomId] = [];
    }
  };

  const setChatRooms = (rooms) => {
    allChatRooms.value = rooms;
  };

  const addMessage = (chatRoomId, message) => {
    if (!message.sentAt) {
      message.sentAt = new Date();
    }
    if (!chatRooms[chatRoomId]) {
      chatRooms[chatRoomId] = [];
    }
    chatRooms[chatRoomId].push(message);
  };

  const setMessages = (chatRoomId, messages) => {
    chatRooms[chatRoomId] = messages;
  };

  return {
    chatRooms,
    allChatRooms,
    currentChatRoomId,
    setCurrentChatRoom,
    setChatRooms,
    addMessage,
    setMessages,
    unreadCountMap,
  };
});
