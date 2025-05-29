<!-- AudioCall.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="call-overlay">
      <div class="call-box">
        <div
          v-if="enableVideo"
          ref="remoteDraggable"
          class="draggable-remote"
          @mousedown="startRemoteDrag"
        >
          <!-- 對方視訊 -->
          <video
            v-if="enableVideo"
            id="remote-video"
            autoplay
            playsinline
            class="remote-video"
          />
        </div>
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

<script setup lang="ts">
declare global {
  interface Window {
    audioCallRef?: {
      startCall: (useVideo?: boolean) => void;
    };
  }
}

import { ref, onMounted, onUnmounted, watch, toRaw } from "vue";
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
import { createCallLog } from "@/apis/callLogApi";
import { useAuthStore } from "@/stores/authStore.js";

const authStore = useAuthStore();
const chatStore = useChatStore();
const callerId = chatStore.memberId;
const callerType = chatStore.memberType as "Member" | "Employee";
const receiverType = "Employee";

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
const isCaller = computed(() => !callStore.fromId);

let timer = null;
let callStartTime = null;
let callLogAlreadyRecorded = false;
let signalRBound = false;

let ringtone = new Audio("/assets/sounds/incoming.mp3");

const recordCallLog = async (status: "completed" | "missed" | "rejected") => {
  if (!isCaller.value) {
    console.log("[CallLog] 本機不是發起者，不紀錄 call log");
    return;
  }
  const resolvedReceiverId = chatStore.getTargetUserId();
  console.log(
    "[CallLog] callerId:",
    callerId,
    "receiverId:",
    resolvedReceiverId
  );

  if (
    !resolvedReceiverId ||
    typeof resolvedReceiverId !== "number" ||
    isNaN(resolvedReceiverId)
  ) {
    console.warn("[CallLog] 無效的 receiverId，取消記錄");
    return;
  }
  if (callLogAlreadyRecorded) {
    console.warn(`[CallLog] 已記錄過，略過 ${status}`);
    return;
  }

  const now = new Date();
  const safeStartTime = callStartTime ?? now;
  const duration = Math.floor((now.getTime() - safeStartTime.getTime()) / 1000);

  if (status === "completed" && duration <= 0) {
    console.warn("[CallLog] duration 為 0，改記錄為 missed 通話");
    status = "missed";
  }

  callLogAlreadyRecorded = true;

  try {
    await createCallLog({
      chatRoomId: chatStore.currentChatRoomId,
      callerType,
      callerId,
      receiverType,
      receiverId: resolvedReceiverId,
      callType: enableVideo.value ? "video" : "audio",
      status,
      startTime: safeStartTime.toISOString(),
      endTime: status === "completed" ? now.toISOString() : undefined,
      durationInSeconds: status === "completed" ? duration : undefined,
    });

    console.log(`[CallLog] 已紀錄通話狀態：${status}`);
  } catch (err) {
    console.error("[CallLog] API 呼叫失敗", err);
  }
};

watch(
  () => callStore.showPopup,
  (show) => {
    if (show) {
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
  const callerId = authStore.memberId;
  const receiverId = chatStore.getTargetUserId();
  const currentChatRoomId = chatStore.currentChatRoomId;
  console.log("[startCall 檢查]", {
    callerId,
    receiverId,
    currentChatRoomId,
  });
  if (!callerId || !receiverId || !currentChatRoomId) {
    console.error("[startCall] 缺少參數，無法撥打", {
      callerId,
      receiverId,
      currentChatRoomId,
    });
    return;
  }
  enableVideo.value = useVideo;
  visible.value = true;
  isIncomingCall.value = false;
  callStatus.value = "撥號中...";
  await callUser(receiverId, currentChatRoomId, useVideo);
  callStatus.value = "等待對方接聽...";
};

defineExpose({ startCall });

const acceptIncomingCall = async () => {
  const fromId = callStore.fromId;
  const offer = toRaw(callStore.offer);

  if (!fromId || !offer) {
    console.error("[WebRTC] 接聽失敗，缺少 fromId 或 offer", { fromId, offer });
    return;
  }

  callStatus.value = "接通中...";

  if (offer?.sdp?.includes("m=video")) {
    enableVideo.value = true;
  }
  isVideoEnabled.value = enableVideo.value;

  try {
    await acceptCall(fromId, offer, enableVideo.value);
  } catch (err) {
    console.error("[WebRTC] 接聽過程中錯誤", err);
    callStatus.value = "接聽失敗";
    return;
  }

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

  await recordCallLog("rejected");

  endSession();
};

const hangupCall = async () => {
  const conn = getConnection();

  if (conn?.state === "Connected" && chatStore.currentChatRoomId) {
    try {
      await conn.invoke("EndCallByGroup", chatStore.currentChatRoomId);
      console.log("[WebRTC] 已通知聊天室所有人掛斷");
    } catch (err) {
      console.error("[WebRTC] invoke EndCallByGroup 失敗", err);
    }
  } else {
    console.warn("[WebRTC] 未連線或無 chatRoomId，略過 EndCall");
  }

  callStatus.value = "📴 通話已結束";
  // 記錄通話
  await recordCallLog("completed");
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
  enableVideo.value = false;
  isVideoEnabled.value = false;
  ringtone.pause();
  ringtone.currentTime = 0;
  stopTimer();
  callLogAlreadyRecorded = false;
};

const startTimer = () => {
  callStartTime = new Date();
  console.log("[Timer] callStartTime 設定為", callStartTime);
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
  const seconds = Math.floor((now.getTime() - callStartTime) / 1000);
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

  if (!signalRBound) {
    const conn = getConnection();

    conn?.on("ReceiveEndCall", async () => {
      callStatus.value = "📴 對方已掛斷";
      await recordCallLog("completed");
      stopTimer();
      setTimeout(() => endSession(), 3000);
    });

    conn?.on("CallRejected", async () => {
      callStatus.value = "📴 對方已拒接";
      await recordCallLog("rejected");
      stopTimer();
      setTimeout(() => endSession(), 3000);
    });

    signalRBound = true;
  }
});

onUnmounted(() => {
  endSession();
});

const remoteDraggable = ref(null);
let isRemoteDragging = false;
let remoteOffset = { x: 0, y: 0 };

const startRemoteDrag = (e) => {
  const target = e.target;
  // 避免拖拉 resize 的右下角時觸發拖曳
  if (
    target === remoteDraggable.value &&
    e.offsetX < remoteDraggable.value.clientWidth - 20 &&
    e.offsetY < remoteDraggable.value.clientHeight - 20
  ) {
    isRemoteDragging = true;
    const el = remoteDraggable.value;
    remoteOffset = {
      x: e.clientX - el.getBoundingClientRect().left,
      y: e.clientY - el.getBoundingClientRect().top,
    };
    document.addEventListener("mousemove", onRemoteDrag);
    document.addEventListener("mouseup", stopRemoteDrag);
  }
};

const onRemoteDrag = (e) => {
  if (!isRemoteDragging) return;
  const el = remoteDraggable.value;
  el.style.left = `${e.clientX - remoteOffset.x}px`;
  el.style.top = `${e.clientY - remoteOffset.y}px`;
  el.style.right = "auto";
  el.style.bottom = "auto";
};

const stopRemoteDrag = () => {
  isRemoteDragging = false;
  document.removeEventListener("mousemove", onRemoteDrag);
  document.removeEventListener("mouseup", stopRemoteDrag);
};

onUnmounted(() => {
  stopRemoteDrag();
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

.draggable-remote {
  position: fixed;
  top: 80px;
  left: 80px;
  width: 400px;
  height: 300px;
  background-color: black;
  border: 2px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  resize: both;
  z-index: 9999;
  cursor: move;
}

video.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
