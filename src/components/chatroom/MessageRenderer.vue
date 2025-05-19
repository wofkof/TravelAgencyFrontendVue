<template>
  <div class="message-bubble">
    <!-- 純文字 or emoji -->
    <template v-if="msg.messageType === 'text' || msg.messageType === 'emoji'">
      {{ msg.content }}
    </template>

    <!-- 圖片 -->
    <template v-else-if="msg.messageType === 'image'">
      <img :src="fullImageUrl(msg.content)" alt="圖片訊息" class="chat-image" />
    </template>

    <!-- 語音訊息 -->
    <template v-else-if="msg.messageType === 'audio'">
      <audio
        :src="fullMediaUrl(msg.content)"
        controls
        class="chat-audio"
      ></audio>
    </template>

    <!-- 其他：保底 fallback -->
    <template v-else>
      <em>不支援的訊息類型：{{ msg.messageType }}</em>
    </template>
  </div>
</template>

<script setup>
import { getApiBaseUrl } from "@/utils/getApiBaseUrl";
defineProps({
  msg: {
    type: Object,
    required: true,
  },
});

// 不抓資料庫的localhost
const fullImageUrl = (path) => {
  const base = getApiBaseUrl();
  const uploadIndex = path.indexOf("/Uploads/");
  if (uploadIndex >= 0) {
    return base + path.slice(uploadIndex);
  }
  return path;
};

const fullMediaUrl = (path) => {
  const base = getApiBaseUrl();
  const uploadIndex = path.indexOf("/Uploads/");
  if (uploadIndex >= 0) {
    return base + path.slice(uploadIndex);
  }
  return path;
};
</script>

<style scoped>
.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 14px;
  background-color: #f0f0f0;
  word-break: break-word;
  text-align: left;
  line-height: 1.5;
}
img.chat-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

audio.chat-audio {
  width: 200px;
  height: 32px;
  margin-top: 4px;
}
</style>
