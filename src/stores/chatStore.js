import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
//舒婷
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";

export const useChatStore = defineStore("chat", () => {
  //舒婷
  const authStore = useAuthStore();
  const { memberId } = storeToRefs(authStore);
  const chatRooms = reactive({});
  const allChatRooms = ref([]);
  const currentChatRoomId = ref(null);
  const unreadCountMap = reactive({});
  const showChat = ref(false);
  const isChatRoomsLoaded = ref(false);

  //舒婷const rawId = localStorage.getItem("memberId");
  //舒婷const memberId = rawId ? Number(rawId) : null;
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
    isChatRoomsLoaded.value = true;
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

  function reset() {
    allChatRooms.value = [];
    currentChatRoomId.value = null;
    Object.keys(chatRooms).forEach((k) => delete chatRooms[k]);
    Object.keys(unreadCountMap).forEach((k) => delete unreadCountMap[k]);
    showChat.value = false;
    isChatRoomsLoaded.value = false;
    this.memberId = null;
  }

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
    isChatRoomsLoaded,
    reset,
  };
});
