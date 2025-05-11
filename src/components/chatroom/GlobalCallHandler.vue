<script setup lang="ts">
import { onMounted } from "vue";
import IncomingCallPopup from "@/components/chatroom/IncomingCallPopup.vue";
import {
  listenForCallEvents,
  getPeer,
  startLocalStream,
} from "@/services/webrtcService";
import { setupSocket, getConnection } from "@/utils/socket";
import { useCallStore } from "../../stores/callStore";

const callStore = useCallStore();

// 初始化呼叫事件（Answer、ICE）
onMounted(async () => {
  await setupSocket();
  const conn = getConnection();
  if (!conn) {
    console.warn("[WebRTC] SignalR 初始化失敗");
    return;
  }
  conn.on("ReceiveCallOffer", handleIncomingOffer);
  listenForCallEvents();
});

function handleIncomingOffer(fromId: string, offer: any) {
  console.log("[WebRTC] 收到來電 Offer，來自", fromId);
  // @ts-ignore
  callStore.setIncomingCall({ fromId, offer });
}

const acceptCall = async () => {
  // @ts-ignore
  const { incomingFromId, incomingOffer } = callStore;
  // @ts-ignore
  callStore.clearCall();
  const peer = await createPeerConnection();
  await peer.setRemoteDescription(new RTCSessionDescription(incomingOffer));
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  const conn = getConnection();
  if (conn?.state === "Connected") {
    await conn.invoke("SendCallAnswer", incomingFromId, answer);
    console.log("[WebRTC] 已送出 answer 給", incomingFromId);
  }
};

const rejectCall = () => {
  // @ts-ignore
  const { incomingFromId } = callStore;
  // @ts-ignore
  callStore.clearCall();
  const peer = getPeer();
  if (peer) {
    peer.close();
    console.log("[WebRTC] 已關閉 peer 連線");
  }
  const remoteAudio = document.getElementById(
    "remote-audio"
  ) as HTMLAudioElement;
  if (remoteAudio) {
    remoteAudio.srcObject = null;
  }
  const conn = getConnection();
  if (conn?.state === "Connected" && incomingFromId) {
    conn.invoke("RejectCall", incomingFromId);
  }
};

async function createPeerConnection(): Promise<RTCPeerConnection> {
  const peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  // @ts-ignore
  const { incomingFromId } = callStore;
  peer.onicecandidate = (event) => {
    if (event.candidate) {
      const conn = getConnection();
      if (conn?.state === "Connected") {
        conn.invoke("SendIceCandidate", incomingFromId, event.candidate);
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
    v-if="callStore.isIncoming"
    @accept="acceptCall"
    @reject="rejectCall"
  />
</template>
