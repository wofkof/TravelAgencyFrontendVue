<script setup lang="ts">
import { onMounted } from "vue";
import { listenForCallEvents } from "@/services/webrtcService";
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
  listenForCallEvents(handleIncomingOffer);
});

function handleIncomingOffer({
  fromId,
  offer,
  roomId,
  callType,
}: {
  fromId: string;
  offer: any;
  roomId: number;
  callType: "audio" | "video";
}) {
  console.log("[WebRTC] 收到來電 Offer：", {
    fromId,
    offer,
    roomId,
    callType,
  });

  callStore.receiveCall(fromId, offer, roomId, callType);

  callStore.showPopup = true;
}
</script>

<template></template>
