<!-- AudioCall.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="call-overlay">
      <div class="call-box">
        <!-- 對方視訊 -->
        <video
          v-if="enableVideo"
          id="remote-video"
          autoplay
          playsinline
          class="remote-video"
        />
        <!-- 我方視訊 -->
        <video
          v-if="enableVideo"
          id="local-video"
          autoplay
          playsinline
          muted
          class="local-video"
        />
        <p class="status-text">{{ callStatus }}</p>
        <p v-if="callDuration" class="call-timer">
          通話時間：{{ callDuration }}
        </p>
        <div class="buttons">
          <el-button type="danger" @click="hangupCall">
            <el-icon><Close /></el-icon> 掛斷
          </el-button>
          <!-- 視訊通話時才顯示控制按鈕 -->
          <el-button v-if="enableVideo" @click="toggleVideoTrack" type="info">
            {{ isVideoEnabled ? "關閉視訊" : "開啟視訊" }}
          </el-button>
          <template v-if="isIncomingCall">
            <el-button type="success" @click="acceptIncomingCall"
              >接聽</el-button
            >
            <el-button type="warning" @click="rejectIncomingCall"
              >拒絕</el-button
            >
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  callUser,
  endCall,
  acceptCall,
  onRemoteAnswer,
  getLocalStream,
} from "@/services/webrtcService";
import { getConnection } from "@/utils/socket";
import { useChatStore } from "@/stores/chatStore";
import { useCallStore } from "@/stores/callStore";

const visible = ref(false);
const callStatus = ref("");
const callStore = useCallStore();
const isIncomingCall = ref(false);
const remoteConnectionId = ref(null);
const incomingFromId = ref(null);
const incomingOffer = ref(null);
const callDuration = ref("");
const enableVideo = ref(false); // 控制是否為視訊通話
const isVideoEnabled = ref(true);
let timer = null;
let callStartTime = null;
let ringtone = new Audio("/public/assets/sounds/incoming.mp3"); //來電音效

const chatStore = useChatStore();

watch(
  () => callStore.showPopup,
  (show) => {
    if (show) {
      incomingFromId.value = callStore.fromId;
      incomingOffer.value = callStore.offer;
      remoteConnectionId.value = callStore.fromId;
      visible.value = true;
      isIncomingCall.value = true;
      callStatus.value = "📞 來電中...";

      ringtone.play().catch((err) => {
        console.warn("[WebRTC] 無法播放來電音效", err);
      });
    } else {
      ringtone.pause();
      ringtone.currentTime = 0;
    }
  }
);

const toggleVideoTrack = () => {
  const stream = getLocalStream();
  if (!stream) return;

  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    isVideoEnabled.value = videoTrack.enabled;
  } else {
    console.warn("[WebRTC] 無法找到 video track");
  }
};

const startCall = async (useVideo = false) => {
  enableVideo.value = useVideo;
  visible.value = true;
  isIncomingCall.value = false;
  callStatus.value = "撥號中...";
  await callUser(chatStore.getTargetUserId, useVideo);
  callStatus.value = "等待對方接聽...";
};

defineExpose({ startCall });

const acceptIncomingCall = async () => {
  callStatus.value = "接通中...";

  if (incomingOffer.value?.sdp?.includes("m=video")) {
    enableVideo.value = true;
  }
  isVideoEnabled.value = enableVideo.value;

  await acceptCall(
    incomingFromId.value,
    incomingOffer.value,
    enableVideo.value
  );

  if (enableVideo.value) {
    const stream = getLocalStream();
    const track = stream?.getVideoTracks()[0];
    if (track) track.enabled = true;
  }

  isIncomingCall.value = false;
  callStatus.value = "通話中...";
  ringtone.pause();
  ringtone.currentTime = 0;
  startTimer();
};

const rejectIncomingCall = async () => {
  const conn = getConnection();
  if (conn?.state === "Connected" && remoteConnectionId.value) {
    await conn.invoke("RejectCall", remoteConnectionId.value);
  }
  endSession();
};

const hangupCall = async () => {
  const conn = getConnection();
  if (conn?.state === "Connected" && remoteConnectionId.value) {
    await conn.invoke("EndCall", remoteConnectionId.value);
  }
  callStatus.value = "📴 通話已結束";
  stopTimer();

  // 等待 3 秒再關閉 UI
  setTimeout(() => {
    endSession();
  }, 3000);
};

const endSession = () => {
  endCall();
  callStore.reset();
  visible.value = false;
  callStatus.value = "";
  isIncomingCall.value = false;
  remoteConnectionId.value = null;
  incomingFromId.value = null;
  incomingOffer.value = null;
  isVideoEnabled.value = true;
  ringtone.pause();
  ringtone.currentTime = 0;
  stopTimer();
};

const startTimer = () => {
  callStartTime = new Date();
  updateTimer();
  timer = setInterval(updateTimer, 1000);
};

const stopTimer = () => {
  clearInterval(timer);
  timer = null;
  callStartTime = null;
  callDuration.value = "";
};

const updateTimer = () => {
  const now = new Date();
  const seconds = Math.floor((now - callStartTime) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  callDuration.value = `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
};

onMounted(() => {
  window.addEventListener(
    "click",
    () => {
      ringtone.load();
      ringtone
        .play()
        .then(() => {
          ringtone.pause();
          ringtone.currentTime = 0;
        })
        .catch(() => {});
    },
    { once: true }
  );

  window.audioCallRef = {
    startCall,
  };

  onRemoteAnswer(() => {
    console.log("[AudioCall] 對方已接聽！");
    callStatus.value = "通話中...";
    startTimer();
  });

  const conn = getConnection();
  conn?.on("ReceiveEndCall", () => {
    callStatus.value = "📴 對方已掛斷";
    stopTimer();
    setTimeout(() => endSession(), 3000);
  });
  conn?.on("CallRejected", () => {
    callStatus.value = "📴 對方已拒接";
    stopTimer();
    setTimeout(() => endSession(), 3000);
  });
});

onUnmounted(() => {
  endSession();
});
</script>

<style scoped>
.call-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  z-index: 9999;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.call-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.status-text {
  font-size: 18px;
  color: #333;
}

.call-timer {
  font-size: 14px;
  color: #888;
}

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

video.remote-video {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  object-fit: cover;
  background-color: black;
}

video.local-video {
  width: 120px;
  height: 90px;
  position: fixed; /* 避免因父層相對定位而跑位 */
  bottom: 20px;
  right: 20px;
  border: 2px solid #fff;
  background-color: black;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* 增加可視性 */
  object-fit: cover;
  z-index: 9999;
}
</style>
