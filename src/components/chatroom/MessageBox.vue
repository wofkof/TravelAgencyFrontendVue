<!-- MessageBox.vue -->
<template>
  <div class="message-area">
    <el-scrollbar ref="scrollRef" class="message-list" @scroll="handleScroll">
      <div
        v-for="msg in filteredMessages"
        :key="msg.sentAt"
        class="message-line"
        :class="msg.senderType === 'Member' ? 'from-me' : 'from-them'"
      >
        <span style="margin-bottom: 5px">
          <el-tag
            :type="
              msg.senderType === 'Member'
                ? 'warning'
                : msg.senderType === 'Employee'
                ? 'success'
                : 'info'
            "
            size="small"
            style="margin-right: 5px"
          >
            {{ getSenderTypeText(msg.senderType) }}
          </el-tag>
          <el-tag type="primary" size="small">
            {{ msg.senderName }}
          </el-tag>
        </span>
        <MessageRenderer :msg="msg" />
        <div style="display: flex">
          <div class="message-timestamp">
            {{ formatRelativeTime(msg.sentAt) }}
          </div>
          <div class="is-read" v-if="msg.senderType === 'Member'">
            <span v-if="msg.isRead">已讀</span>
            <span v-else>未讀</span>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <div class="message-input-bar">
      <el-input
        v-model="newMessage"
        clearable
        type="textarea"
        :placeholder="isChatRoomClosed ? '聊天室已關閉' : '輸入訊息...'"
        @keydown.enter.prevent="send"
        :disabled="isChatRoomClosed"
        autosize
        class="message-input"
      />
      <!-- 送出按鈕 -->
      <el-button
        @click="send"
        type="primary"
        size="small"
        plain
        circle
        :disabled="isChatRoomClosed"
        ><el-icon><Promotion /></el-icon
      ></el-button>

      <!-- 表情按鈕 -->
      <EmojiButton
        @click="toggleEmojiPicker"
        style="margin-left: 0px"
        :disabled="isChatRoomClosed"
      />
      <!-- 貼圖按鈕 -->
      <el-button
        type="warning"
        @click="showStickerPanel = !showStickerPanel"
        style="margin-left: 0px"
        size="small"
        plain
        circle
        :disabled="isChatRoomClosed"
        ><el-icon><PictureFilled /></el-icon
      ></el-button>

      <StickerPanel
        v-if="showStickerPanel"
        ref="stickerPanelRef"
        @select="sendSticker"
      />
    </div>
    <div class="button-group">
      <!-- 圖片按鈕 -->
      <ImageUploader style="margin-left: 5px" :disabled="isChatRoomClosed" />
      <!-- 錄音按鈕 -->
      <VoiceUploader :disabled="isChatRoomClosed" />
      <!-- 通話按鈕 -->
      <el-button
        type="success"
        @click="startAudioCall()"
        size="small"
        plain
        circle
        style="margin-left: 0px"
        :disabled="isChatRoomClosed"
        ><el-icon><Phone /></el-icon
      ></el-button>
      <!-- 視訊通話按鈕 -->
      <el-button
        type="primary"
        @click="startVideoCall()"
        size="small"
        plain
        circle
        style="margin-left: 0px"
        :disabled="isChatRoomClosed"
        ><el-icon><VideoCamera /></el-icon
      ></el-button>
      <!-- 測試用的假訊息 -->
      <!-- <TestFakeMessage style="margin-left: 0px" /> -->
      <!-- 關閉按鈕 -->
      <el-button
        type="danger"
        size="small"
        circle
        plain
        @click="closeChatRoom"
        v-if="chatRoomStatus === 'Opened'"
      >
        <el-icon><WarnTriangleFilled /></el-icon>
      </el-button>
      <!-- 搜尋訊息 -->
      <ChatSearchBar
        v-model:searchText="searchText"
        v-model:isSearching="isSearching"
      />
    </div>
  </div>

  <div ref="pickerContainer" class="emoji-container"></div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";
import { useChatStore } from "@/stores/chatStore";
import { setupSocket, sendMessage, getConnection } from "@/utils/socket";
import { formatRelativeTime } from "@/utils/formatDateTime";
import { getMessages, markAsRead } from "@/apis/messageApi";
import { getSenderTypeText } from "@/utils/enumHelper";
import ImageUploader from "@/components/chatroom/ImageUploader.vue";
import EmojiButton from "@/components/chatroom/EmojiButton.vue";
import TestFakeMessage from "@/components/chatroom/TestFakeMessage.vue";
import MessageRenderer from "@/components/chatroom/MessageRenderer.vue";
import VoiceUploader from "@/components/chatroom/VoiceUploader.vue";
import ChatSearchBar from "@/components/chatroom/ChatSearchBar.vue";
import StickerPanel from "@/components/chatroom/StickerPanel.vue";
import { closeChatRoom as closeChatRoomApi } from "@/apis/chatRoomApi";

declare global {
  interface Window {
    EmojiMart: any;
  }
}

const chatStore = useChatStore();
const newMessage = ref("");
const pickerVisible = ref(false);
const pickerContainer = ref<HTMLElement | null>(null);
const pickerInstance = ref<any>(null);
const scrollRef = ref();
const searchText = ref("");
const isSearching = ref(false);
const showStickerPanel = ref(false);
const stickerPanelRef = ref(null);

const currentChatRoom = computed(() => {
  const room = chatStore.allChatRooms.find(
    (r) => r.chatRoomId === chatStore.currentChatRoomId
  );
  console.log("[currentChatRoom] 目前聊天室資訊:", room);
  return room;
});

const chatRoomStatus = computed(
  () => currentChatRoom.value?.status ?? "Opened"
);
const isChatRoomClosed = computed(() => chatRoomStatus.value === "Closed");

const closeChatRoom = async () => {
  const chatRoomId = chatStore.currentChatRoomId;
  if (!chatRoomId) return;

  try {
    await ElMessageBox.confirm(
      "關閉後將無法再傳送訊息，是否確定關閉聊天室？",
      "確認關閉",
      {
        confirmButtonText: "確定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    await closeChatRoomApi(chatRoomId);
    const room = chatStore.allChatRooms.find(
      (r) => r.chatRoomId === chatRoomId
    );

    if (room) room.status = "Closed";
    ElMessage.success("聊天室已關閉");
  } catch (err) {
    if (err !== "cancel") {
      console.error("關閉聊天室失敗", err);
      ElMessage.error("關閉聊天室失敗");
    }
  }
};

const sendSticker = async (url: string) => {
  if (isChatRoomClosed.value) {
    console.warn("[sendSticker] 此聊天室已關閉，禁止發送貼圖");
    return;
  }

  const chatRoomId = chatStore.currentChatRoomId;
  if (!chatRoomId) return;

  try {
    await sendMessage(chatRoomId, senderType, senderId, "sticker", url);
    scrollToBottom();
  } catch (err) {
    console.error("貼圖訊息發送失敗", err);
    alert("貼圖發送失敗");
  }

  showStickerPanel.value = false;
};

function handleScroll() {
  const wrap = scrollRef.value?.wrapRef;
  if (!wrap) return;

  const isAtBottom =
    wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 10;

  const chatRoomId = chatStore.currentChatRoomId;
  if (isAtBottom && chatRoomId != null) {
    chatStore.unreadCountMap[chatRoomId] = 0;
  }
}

// 搜尋訊息
const filteredMessages = computed(() => {
  if (!isSearching.value || !searchText.value.trim()) {
    return currentMessages.value;
  }
  return currentMessages.value.filter(
    (msg) =>
      msg.messageType === "text" &&
      msg.content?.toLowerCase().includes(searchText.value.trim().toLowerCase())
  );
});

async function waitForChatRoomIdReady() {
  return new Promise<void>((resolve) => {
    const check = () => {
      const ready =
        chatStore.currentChatRoomId &&
        window.audioCallRef &&
        typeof window.audioCallRef.startCall === "function";

      if (ready) {
        resolve();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

const startAudioCall = async () => {
  const currentRoomId = chatStore.currentChatRoomId;
  if (!currentRoomId) {
    console.warn("[startAudioCall] 沒有聊天室可以撥打");
    return;
  }

  await waitForChatRoomIdReady();

  window.audioCallRef?.startCall(false);
};

const startVideoCall = async () => {
  const currentRoomId = chatStore.currentChatRoomId;
  if (!currentRoomId) {
    console.warn("[startAudioCall] 沒有聊天室可以撥打");
    return;
  }

  await waitForChatRoomIdReady();

  window.audioCallRef?.startCall(true);
};

function isScrolledToBottom() {
  const wrap = scrollRef.value?.wrapRef;
  if (!wrap) return false;
  const threshold = 50;
  return wrap.scrollHeight - wrap.scrollTop - wrap.clientHeight < threshold;
}

const scrollToBottom = () => {
  nextTick(() => {
    const wrap = scrollRef.value?.wrapRef;
    if (wrap) {
      wrap.scrollTop = wrap.scrollHeight;
    }
  });
};

const toggleEmojiPicker = () => {
  pickerVisible.value = !pickerVisible.value;
  if (pickerVisible.value) {
    openPicker();
  } else {
    closePicker();
  }
};

const openPicker = () => {
  if (!window.EmojiMart || !pickerContainer.value) return;

  if (pickerInstance.value) return;

  pickerInstance.value = new window.EmojiMart.Picker({
    emojiSize: 20,
    perLine: 6,

    previewPosition: "none",
    searchPosition: "none",
    onEmojiSelect: (emoji: any) => {
      newMessage.value += emoji.native;
    },
  });

  pickerInstance.value.style.width = "200px";
  pickerInstance.value.style.maxHeight = "100px";

  pickerContainer.value.appendChild(pickerInstance.value);
};

const closePicker = () => {
  if (pickerContainer.value) {
    pickerContainer.value.innerHTML = "";
  }
  pickerInstance.value = null;
  pickerVisible.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  // 處理 emoji picker 關閉
  if (
    pickerContainer.value &&
    !pickerContainer.value.contains(target) &&
    !target.closest(".el-button")
  ) {
    closePicker();
  }

  // 處理貼圖面板關閉
  const panel = stickerPanelRef.value?.$el;
  if (panel && !panel.contains(target) && !target.closest(".el-button")) {
    showStickerPanel.value = false;
  }
};

// 封裝已讀
const senderType = "Member";
const senderId = chatStore.memberId;

const updateReadStatus = async (chatRoomId: number) => {
  const conn = getConnection();
  await markAsRead(chatRoomId, senderId, senderType);
  await conn.invoke("NotifyRead", chatRoomId, senderId, senderType);
};

onMounted(async () => {
  window.addEventListener("click", handleClickOutside);
  // @ts-ignore
  window.isScrolledToBottom = isScrolledToBottom;
  if (chatStore.allChatRooms.length > 0) {
    chatStore.setCurrentChatRoom(chatStore.allChatRooms[0].chatRoomId);
  }
});

watch(
  () => chatStore.currentChatRoomId,
  async (chatRoomId) => {
    if (!chatRoomId) return;

    await setupSocket(chatRoomId);
    const messages = await getMessages(chatRoomId);
    chatStore.setMessages(chatRoomId, messages);
    await updateReadStatus(chatRoomId);
    scrollToBottom();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  window.removeEventListener("click", handleClickOutside);
});

const currentMessages = computed(() => {
  const chatRoomId = chatStore.currentChatRoomId;
  return chatStore.chatRooms[chatRoomId] || [];
});

function isPureEmoji(str: string) {
  const emojiRegex =
    // @ts-ignore
    /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji})+$/u;
  return emojiRegex.test(str.trim());
}

const send = async () => {
  if (isChatRoomClosed.value) {
    console.warn("[send] 此聊天室已關閉，禁止發送訊息");
    return;
  }

  const messageContent = newMessage.value.trim();
  if (!messageContent) return;

  const chatRoomId = chatStore.currentChatRoomId;
  const type = isPureEmoji(messageContent) ? "emoji" : "text";

  try {
    await sendMessage(chatRoomId, senderType, senderId, type, messageContent);
    scrollToBottom();
  } catch (err) {
    console.error("送出訊息失敗", err);
    alert("發送訊息失敗");
  }

  newMessage.value = "";
  closePicker();
};
</script>

<style scoped>
.message-area {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.message-list {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.message-line {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.from-me {
  align-items: flex-end;
}
.from-them {
  align-items: flex-start;
}
.from-me .message-bubble {
  background-color: #cce5ff;
  color: #000;
}
.message-timestamp {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  padding: 0 4px;
}
.is-read {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
  padding: 0 4px;
}
.message-input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 6px;
  border-top: 1px solid #ddd;
}
.button-group {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
.emoji-container {
  position: absolute;
  bottom: 60px;
  left: 26px;
  top: 165px;
  z-index: 10;
}
</style>
