<template>
  <Teleport to="body">
    <div v-if="visible" class="call-overlay">
      <div class="call-box">
        <p class="status-text">{{ callStatus }}</p>
        <p v-if="callDuration" class="call-timer">
          通話時間：{{ callDuration }}
        </p>
        <div class="buttons">
          <el-button type="danger" @click="hangupCall">
            <el-icon><Close /></el-icon> 掛斷
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
import { ref, onMounted, onUnmounted } from "vue";
import {
  callUser,
  endCall,
  listenForCallEvents,
  acceptCall,
} from "@/services/webrtcService";
import { getConnection } from "@/utils/socket";
import { useChatStore } from "@/stores/chatStore";

const visible = ref(false);
const callStatus = ref("");
const isIncomingCall = ref(false);
const remoteConnectionId = ref(null);
const incomingFromId = ref(null);
const incomingOffer = ref(null);
const callDuration = ref("");
let timer = null;
let callStartTime = null;

const chatStore = useChatStore();

const startCall = async () => {
  visible.value = true;
  isIncomingCall.value = false;
  callStatus.value = "撥號中...";
  await callUser(chatStore.getTargetUserId);
  callStatus.value = "等待對方接聽...";
};

defineExpose({ startCall });

const acceptIncomingCall = async () => {
  callStatus.value = "接通中...";
  await acceptCall(incomingFromId.value, incomingOffer.value);
  isIncomingCall.value = false;
  callStatus.value = "通話中...";
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
  visible.value = false;
  callStatus.value = "";
  isIncomingCall.value = false;
  remoteConnectionId.value = null;
  incomingFromId.value = null;
  incomingOffer.value = null;
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
  window.audioCallRef = {
    startCall,
  };
  listenForCallEvents((fromId, offer) => {
    incomingFromId.value = fromId;
    incomingOffer.value = offer;
    remoteConnectionId.value = fromId;
    visible.value = true;
    isIncomingCall.value = true;
    callStatus.value = "📞 來電中...";
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
</style>
