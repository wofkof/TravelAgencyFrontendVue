<template>
  <div class="message-area">
    <el-scrollbar ref="scrollRef" class="message-list">
      <div
        v-for="msg in currentMessages"
        :key="msg.sentAt"
        class="message-line"
        :class="msg.senderType === 'Member' ? 'from-me' : 'from-them'"
      >
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
        placeholder="輸入訊息..."
        @keydown.enter.prevent="send"
        autosize
        class="message-input"
      />

      <div class="button-group">
        <!-- 送出按鈕 -->
        <el-button @click="send" type="primary" size="small" plain circle
          ><el-icon><Promotion /></el-icon
        ></el-button>

        <!-- 表情按鈕 -->
        <el-button
          size="small"
          type="success"
          @click="toggleEmojiPicker"
          plain
          circle
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="currentColor"
            class="bi bi-emoji-laughing-fill"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M7 6.5c0 .501-.164.396-.415.235C6.42 6.629 6.218 6.5 6 6.5s-.42.13-.585.235C5.164 6.896 5 7 5 6.5 5 5.672 5.448 5 6 5s1 .672 1 1.5m5.331 3a1 1 0 0 1 0 1A5 5 0 0 1 8 13a5 5 0 0 1-4.33-2.5A1 1 0 0 1 4.535 9h6.93a1 1 0 0 1 .866.5m-1.746-2.765C10.42 6.629 10.218 6.5 10 6.5s-.42.13-.585.235C9.164 6.896 9 7 9 6.5c0-.828.448-1.5 1-1.5s1 .672 1 1.5c0 .501-.164.396-.415.235"
            /></svg
        ></el-button>

        <!-- 圖片按鈕 -->
        <ImageUploader />
        <!-- 錄音按鈕 -->
        <VoiceUploader />
        <!-- 通話按鈕 -->
        <AudioCall />
      </div>
    </div>

    <!-- 測試用的假訊息 -->
    <div style="display: flex">
      <TestFakeMessage />
    </div>
  </div>

  <div ref="pickerContainer" class="emoji-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from "vue";
import { useChatStore } from "@/stores/chatStore";
import connection, { setupSocket, sendMessage } from "@/utils/socket";
import { formatRelativeTime } from "@/utils/formatDateTime";
import { getMessages, markAsRead } from "@/apis/messageApi";
import ImageUploader from "@/components/chatroom/ImageUploader.vue";
import TestFakeMessage from "@/components/chatroom/TestFakeMessage.vue";
import MessageRenderer from "@/components/chatroom/MessageRenderer.vue";
import VoiceUploader from "@/components/chatroom/VoiceUploader.vue";
import AudioCall from "@/components/chatroom/AudioCall.vue";
import { watch } from "vue";

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
  if (
    pickerContainer.value &&
    !pickerContainer.value.contains(target) &&
    !target.closest(".el-button")
  ) {
    closePicker();
  }
};

// 封裝已讀
const senderType = "Member";
const senderId = 11110;

const updateReadStatus = async (chatRoomId: number) => {
  await markAsRead(chatRoomId, senderId, senderType);
  await connection.invoke("NotifyRead", chatRoomId, senderId, senderType);
};

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  // @ts-ignore
  window.isScrolledToBottom = isScrolledToBottom;

  if (!chatStore.currentChatRoomId) {
    chatStore.setCurrentChatRoom(1); 
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
