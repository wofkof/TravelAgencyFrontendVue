<script setup>
import { ref, onMounted } from "vue";
import IncomingCallPopup from "@/components/chatroom/IncomingCallPopup.vue";
import {
  listenForCallEvents,
  getPeer,
  startLocalStream,
} from "@/services/webrtcService";
import connection from "@/utils/socket";

const showPopup = ref(false);
const incomingFromId = ref(null);
const incomingOffer = ref(null);

onMounted(() => {
  if (connection.state === "Connected") {
    bindOfferHandler();
  } else {
    connection.start().then(bindOfferHandler);
  }

  listenForCallEvents(); // 其他事件仍集中處理（Answer, ICE）
});

function bindOfferHandler() {
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
  await connection.invoke("SendCallAnswer", incomingFromId.value, answer);
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
