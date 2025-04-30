import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useChatStore = defineStore("chat", () => {
  const chatRooms = reactive({});
  const allChatRooms = ref([]);
  const currentChatRoomId = ref(null);

  const setCurrentChatRoom = (chatRoomId) => {
    currentChatRoomId.value = chatRoomId;
    if (!chatRooms[chatRoomId]) {
      chatRooms[chatRoomId] = [];
    }
  };

  const setChatRooms = (rooms) => {
    allChatRooms.value = rooms;
  };

  const addMessage = (chatRoomId, message) => {
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
  };
});
