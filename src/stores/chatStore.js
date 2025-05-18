import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";

export const useChatStore = defineStore("chat", () => {
  const chatRooms = reactive({});
  const allChatRooms = ref([]);
  const currentChatRoomId = ref(null);
  const unreadCountMap = reactive({});
  const showChat = ref(false);

  const rawId = localStorage.getItem("memberId");
  const memberId = rawId ? Number(rawId) : null;
  const memberType = "Member";

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

  const totalUnreadCount = computed(() =>
    Object.values(unreadCountMap).reduce((sum, count) => sum + count, 0)
  );

  function toggleChatPopup() {
    showChat.value = !showChat.value;
    if (showChat.value) {
      Object.keys(unreadCountMap).forEach((key) => {
        unreadCountMap[key] = 0;
      });
    }
  }

  const getTargetUserId = computed(() => {
    const room = allChatRooms.value.find(
      (r) => r.chatRoomId === currentChatRoomId.value
    );
    return memberType === "Member" ? room?.employeeId : room?.memberId;
  });

  return {
    chatRooms,
    allChatRooms,
    currentChatRoomId,
    setCurrentChatRoom,
    setChatRooms,
    addMessage,
    setMessages,
    unreadCountMap,
    totalUnreadCount,
    toggleChatPopup,
    showChat,
    memberId,
    memberType,
    getTargetUserId,
  };
});
