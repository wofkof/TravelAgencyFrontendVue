<script setup>
import { ref, onMounted } from "vue";
import IncomingCallPopup from "@/components/chatroom/IncomingCallPopup.vue";
import { listenForCallEvents, getPeer } from "@/services/webrtcService";
import { getConnection, setupSocket } from "@/utils/socket"; // 確保有 export 這些方法

const showPopup = ref(false);
const incomingFromId = ref(null);
const incomingOffer = ref(null);

onMounted(async () => {
  await setupSocket(null); 
  const connection = getConnection();
  if (connection.state === "Disconnected") {
    await connection.start();
  }

  bindOfferHandler(connection);
  listenForCallEvents();
});

function bindOfferHandler(connection) {
  connection.on("ReceiveCallOffer", async (fromId, offer) => {
    incomingFromId.value = fromId;
    incomingOffer.value = offer;
    showPopup.value = true;
  });
}

const acceptCall = async () => {
  showPopup.value = false;

  const peer = getPeer();
  if (!peer) {
    console.warn("尚未初始化 peer");
    return;
  }

  await peer.setRemoteDescription(
    new RTCSessionDescription(incomingOffer.value)
  );
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  const connection = getConnection();
  await connection?.invoke("SendCallAnswer", incomingFromId.value, answer);
};

const rejectCall = () => {
  showPopup.value = false;
  incomingFromId.value = null;
  incomingOffer.value = null;
};
</script>

<template>
  <IncomingCallPopup
    v-if="showPopup"
    @accept="acceptCall"
    @reject="rejectCall"
  />
</template>
