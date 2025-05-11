<script setup lang="ts">
import { ref, onMounted } from "vue";
import IncomingCallPopup from "@/components/chatroom/IncomingCallPopup.vue";
import {
  listenForCallEvents,
  getPeer,
  startLocalStream,
} from "@/services/webrtcService";
import { setupSocket, getConnection } from "@/utils/socket";

const showPopup = ref(false);
const incomingFromId = ref<string | null>(null);
const incomingOffer = ref<any>(null);

// 初始化呼叫事件（Answer、ICE）
onMounted(async () => {
  await setupSocket(); // 🔧 初始化 SignalR 連線

  const conn = getConnection();
  if (!conn) {
    console.warn("[WebRTC] SignalR 初始化失敗");
    return;
  }

  conn.on("ReceiveCallOffer", handleIncomingOffer);
  listenForCallEvents(); // 處理 ICE / Answer
});

function handleIncomingOffer(fromId: string, offer: any) {
  console.log("[WebRTC] 收到來電 Offer，來自", fromId);
  incomingFromId.value = fromId;
  incomingOffer.value = offer;
  showPopup.value = true;
}

const acceptCall = async () => {
  showPopup.value = false;

  const peer = await createPeerConnection(); // 動態建立連線
  await peer.setRemoteDescription(
    new RTCSessionDescription(incomingOffer.value)
  );
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  const conn = getConnection();
  if (conn?.state === "Connected") {
    await conn.invoke("SendCallAnswer", incomingFromId.value, answer);
    console.log("[WebRTC] 已送出 answer 給", incomingFromId.value);
  }

  incomingFromId.value = null;
  incomingOffer.value = null;
};

const rejectCall = () => {
  showPopup.value = false;

  // 關閉 peer 連線
  const peer = getPeer();
  if (peer) {
    peer.close();
    console.log("[WebRTC] 已關閉 peer 連線");
  }

  // 清除遠端 audio 音訊
  const remoteAudio = document.getElementById(
    "remote-audio"
  ) as HTMLAudioElement;
  if (remoteAudio) {
    remoteAudio.srcObject = null;
  }

  // 通知對方被拒絕
  const conn = getConnection();
  if (conn?.state === "Connected" && incomingFromId.value) {
    conn.invoke("RejectCall", incomingFromId.value);
  }

  incomingFromId.value = null;
  incomingOffer.value = null;
};

// 將 peer 連線建立邏輯拉出來共用
async function createPeerConnection(): Promise<RTCPeerConnection> {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      const conn = getConnection();
      if (conn?.state === "Connected") {
        conn.invoke("SendIceCandidate", incomingFromId.value, event.candidate);
        console.log("[WebRTC] 已發送 ICE candidate");
      }
    }
  };

  peer.ontrack = (event) => {
    console.log("[WebRTC] 收到遠端 track", event.streams);
    const remoteStream = event.streams[0];
    const remoteAudio = document.getElementById(
      "remote-audio"
    ) as HTMLAudioElement;
    if (remoteAudio) {
      remoteAudio.srcObject = remoteStream;
      console.log("[WebRTC] remote-audio 已設為遠端串流");
    } else {
      console.warn("[WebRTC] 找不到 #remote-audio");
    }
  };

  const stream = await startLocalStream();
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));

  return peer;
}
</script>

<template>
  <IncomingCallPopup
    v-if="showPopup"
    @accept="acceptCall"
    @reject="rejectCall"
  />
</template>
