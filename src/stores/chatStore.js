import { defineStore } from "pinia";
import { reactive, ref, computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { storeToRefs } from "pinia";
import { getChatRooms } from "@/apis//chatRoomApi";

export const useChatStore = defineStore("chat", () => {
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
  const memberType = ref("Member");

  const setCurrentChatRoom = (chatRoomId) => {
    currentChatRoomId.value = chatRoomId;
    console.log("[setCurrentChatRoom] 切換至聊天室：", chatRoomId);

    const room = allChatRooms.value.find((r) => r.chatRoomId === chatRoomId);
    if (room) {
      const targetId =
        memberType.value === "Member" ? room.employeeId : room.memberId;
      console.log("[setCurrentChatRoom] 對方 ID =", targetId);
    }

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

    const isCurrent = chatRoomId === currentChatRoomId.value;
    const isAtBottom = window.isScrolledToBottom?.() ?? false;

    if (
      message.senderId !== memberId.value ||
      !showChat.value ||
      !isCurrent ||
      !isAtBottom
    ) {
      unreadCountMap[chatRoomId] = (unreadCountMap[chatRoomId] || 0) + 1;
    }
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

  function getTargetUserId() {
    console.log(
      "[getTargetUserId] currentChatRoomId:",
      currentChatRoomId.value
    );
    console.log("[getTargetUserId] allChatRooms:", allChatRooms.value);
    const room = allChatRooms.value.find(
      (r) => r.chatRoomId === currentChatRoomId.value
    );
    if (!room) {
      console.warn("[chatStore] 找不到 chatRoomId 對應的 room", {
        currentChatRoomId: currentChatRoomId.value,
        allChatRoomIds: allChatRooms.value.map((r) => r.chatRoomId),
      });
      return null;
    }
    return memberType.value === "Member" ? room.employeeId : room.memberId;
  }

  const setCurrentChatRoomId = (chatRoomId) => {
    currentChatRoomId.value = chatRoomId;
  };

  const initChatRooms = async () => {
    try {
      if (!memberId.value) return; // 安全檢查

      const rooms = await getChatRooms(memberId.value);
      allChatRooms.value = rooms;

      rooms.forEach((room) => {
        unreadCountMap[room.chatRoomId] = 0;
      });

      isChatRoomsLoaded.value = true;
      console.log("[chatStore] 初始化聊天室完成", rooms);
    } catch (err) {
      console.error("[chatStore] 無法載入聊天室清單", err);
    }
  };

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
    setCurrentChatRoomId,
    initChatRooms,
    reset,
  };
});
