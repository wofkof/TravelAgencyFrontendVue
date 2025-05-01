<template>
  <div class="message-area">
    <el-scrollbar ref="scrollRef" height="200px" class="message-list">
      <div
        v-for="msg in currentMessages"
        :key="msg.sentAt"
        class="message-line"
        :class="msg.senderType === 'Member' ? 'from-me' : 'from-them'"
      >
        <div class="message-bubble">
          {{ msg.content }}
        </div>

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

    <el-input
      v-model="newMessage"
      clearable
      type="textarea"
      placeholder="輸入訊息..."
      @keydown.enter.prevent="send"
      autosize
    />
    <div style="display: flex">
      <div class="text-right mt-2">
        <el-button type="primary" size="small" @click="send">送出</el-button>
      </div>
      <el-button size="small" @click="toggleEmojiPicker">😀</el-button>
    </div>
  </div>

  <div ref="pickerContainer" class="emoji-container"></div>
  <el-button size="small" type="warning" @click="testFakeMessage">
    測試紅點
  </el-button>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useChatStore } from "../../stores/chatStore";
import { setupSocket, sendMessage } from "@/utils/socket";
import { getMessages, markAsRead } from "@/apis/messageApi";
import { formatRelativeTime } from "@/utils/formatDateTime";
import { nextTick } from "vue";

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

  pickerInstance.value = new window.EmojiMart.Picker({
    emojiSize: 20,
    perLine: 6,
    previewPosition: "none",
    searchPosition: "none",
    onEmojiSelect: (emoji: any) => {
      newMessage.value += emoji.native;
    },
  });

  pickerInstance.value.style.width = "260px";
  pickerInstance.value.style.maxHeight = "300px";

  pickerContainer.value.appendChild(pickerInstance.value);
};

const closePicker = () => {
  if (pickerContainer.value) {
    pickerContainer.value.innerHTML = "";
  }
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

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  // @ts-ignore
  window.isScrolledToBottom = isScrolledToBottom;

  if (!chatStore.currentChatRoomId) {
    chatStore.setCurrentChatRoom(1);
  }

  setupSocket().then(async () => {
    const chatRoomId = chatStore.currentChatRoomId;
    const messages = await getMessages(chatRoomId);
    chatStore.setMessages(chatRoomId, messages);
    await markAsRead(chatRoomId);
    messages.forEach((msg) => (msg.isRead = true));
    scrollToBottom();
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleClickOutside);
});

const currentMessages = computed(() => {
  const chatRoomId = chatStore.currentChatRoomId;
  return chatStore.chatRooms[chatRoomId] || [];
});

const send = async () => {
  const messageContent = newMessage.value.trim();
  if (!messageContent) return;

  const chatRoomId = chatStore.currentChatRoomId;

  const newMsg = {
    senderType: "Member",
    senderId: 11110,
    messageType: "Text",
    content: messageContent,
    sendAt: new Date(),
    isRead: true,
  };

  chatStore.addMessage(chatRoomId, newMsg);
  scrollToBottom();

  try {
    await sendMessage(chatRoomId, "Member", 11110, "Text", messageContent);
  } catch (err) {
    console.error("送出訊息失敗", err);
    alert("發送訊息失敗");
  }

  newMessage.value = "";
  closePicker();
};

const testFakeMessage = () => {
  const chatRoomId = chatStore.currentChatRoomId || 1;

  const newMessage = {
    senderType: "Employee",
    senderId: 1,
    messageType: "Text",
    content: "模擬訊息" + new Date().toLocaleTimeString(),
    sentAt: new Date(),
    isRead: false,
  };

  chatStore.addMessage(chatRoomId, newMessage);

  if (
    chatRoomId !== chatStore.currentChatRoomId ||
    // @ts-ignore
    !window.isScrolledToBottom?.()
  ) {
    chatStore.unreadCountMap[chatRoomId] =
      (chatStore.unreadCountMap[chatRoomId] || 0) + 1;
  }
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
.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 14px;
  background-color: #f0f0f0;
  word-break: break-word;
  text-align: left;
  line-height: 1.5;
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
.emoji-container {
  position: absolute;
  left: 0;
  z-index: 10;
}
</style>
