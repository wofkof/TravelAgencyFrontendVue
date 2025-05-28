// webrtcService.js
import { getConnection } from "@/utils/socket";
import api from "@/utils/api";
import { useChatStore } from "@/stores/chatStore";
let peer;
let localStream;
let remoteStream;
let remoteConnectionId = null;
let hasStartedListening = false;
let incomingCallHandler = null;
let onAnswerReceived = null;
export function getLocalStream() {
  return localStream;
}

export function onRemoteAnswer(callback) {
  onAnswerReceived = callback;
}

export async function startLocalStream(useVideo = false) {
  console.log("[WebRTC] 啟用 local stream, video:", useVideo);
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: useVideo,
  });
  return localStream;
}

export async function getConnectionId(userType, userId) {
  try {
    const res = await api.get("/chatrooms/connection-id", {
      params: { userType, userId },
    });
    return res.data;
  } catch (err) {
    console.warn(
      "[WebRTC] 無法取得對方 connectionId",
      err.response?.data || err.message
    );
    return null;
  }
}

export async function callUser(targetUserId, useVideo = false) {
  const chatStore = useChatStore();
  const connectionId = await getConnectionId("Employee", targetUserId);
  if (!connectionId) {
    alert("對方未上線或無法通話");
    return;
  }

  const conn = getConnection();
  if (!conn || conn.state !== "Connected") {
    console.warn("[WebRTC] 無法送出 offer，SignalR 尚未連線");
    return;
  }
  remoteConnectionId = connectionId;
  await createPeerConnection(connectionId, useVideo); // 傳入對方 ID

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  console.log("呼叫時聊天室ID:", chatStore.currentChatRoomId.value);
  console.log("SendCallOffer params:", {
    toConnectionId: connectionId,
    offer,
    roomId: currentChatRoomId,
    callType: useVideo ? "video" : "audio",
  });

  if (!chatStore.currentChatRoomId.value) {
    alert("錯誤：聊天室ID不存在，無法發起通話");
    return;
  }
  console.log("SendCallOffer params:", {
    toConnectionId: connectionId,
    offer,
    roomId: chatStore.currentChatRoomId.value,
    callType: useVideo ? "video" : "audio",
  });
  await conn.invoke(
    "SendCallOffer",
    connectionId,
    offer,
    chatStore.currentChatRoomId.value,
    useVideo ? "video" : "audio"
  );
  console.log("[WebRTC] 已送出 offer 給", connectionId);
}

export function listenForCallEvents(onOffer) {
  if (hasStartedListening) return;
  const conn = getConnection();
  if (!conn) {
    console.warn("[WebRTC] 尚未初始化 SignalR connection");
    return;
  }

  hasStartedListening = true;
  incomingCallHandler = onOffer;

  conn.on("ReceiveCallOffer", ({ fromId, offer, roomId, callType }) => {
    console.log("[WebRTC] 收到 offer，來自", fromId, "roomId:", roomId);
    if (typeof incomingCallHandler === "function") {
      incomingCallHandler({ fromId, offer, roomId, callType });
    }
  });

  conn.on("ReceiveCallAnswer", async (fromId, answer) => {
    console.log("[WebRTC] 收到 answer，來自", fromId);
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
    if (typeof onAnswerReceived === "function") {
      onAnswerReceived();
    }
  });

  conn.on("ReceiveIceCandidate", async (fromId, candidate) => {
    console.log("[WebRTC] 收到 ICE candidate，來自", fromId);
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  });
}

export async function acceptCall(fromId, offer, useVideo = false) {
  if (!offer || !offer.type || !offer.sdp) {
    console.error(
      "[WebRTC] 無效的 offer，無法進行 setRemoteDescription",
      offer
    );
    return;
  }

  remoteConnectionId = fromId;

  try {
    await createPeerConnection(fromId, useVideo);
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    console.log("[WebRTC] 成功設定 remote description");

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    const conn = getConnection();
    if (conn?.state === "Connected") {
      await conn.invoke("SendCallAnswer", fromId, answer);
      console.log("[WebRTC] 已送出 answer 給", fromId);
    } else {
      console.warn("[WebRTC] SignalR 尚未連線，無法送出 answer");
    }
  } catch (err) {
    console.error("[WebRTC] 接聽過程中發生錯誤", err);
  }
}

export async function createPeerConnection(remoteId, useVideo = false) {
  remoteConnectionId = remoteId;

  peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      const conn = getConnection();
      if (conn?.state === "Connected" && remoteConnectionId) {
        conn
          .invoke("SendIceCandidate", remoteConnectionId, event.candidate)
          .then(() => {
            console.log("[WebRTC] 已發送 ICE candidate");
          })
          .catch((err) => {
            console.error("[WebRTC] ICE candidate 發送失敗", err);
          });
      } else {
        console.warn("[WebRTC] 無效連線或無 remoteConnectionId，略過 ICE");
      }
    }
  };

  peer.ontrack = (event) => {
    console.log("[WebRTC] 收到遠端 track", event.streams);
    remoteStream = event.streams[0];
    // 通話邏輯
    setTimeout(() => {
      const remoteAudio = document.getElementById("remote-audio");
      if (remoteAudio) {
        remoteAudio.srcObject = remoteStream;
        console.log("[WebRTC] 設定 remote-audio 成功");
      } else {
        console.warn("[WebRTC] 無法找到 #remote-audio 元素");
      }

      if (remoteStream.getVideoTracks().length > 0) {
        const remoteVideo = document.getElementById("remote-video");
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
          console.log("[WebRTC] 設定 remote-video 成功");
        } else {
          console.warn("[WebRTC] 無法找到 #remote-video 元素");
        }
      }
    }, 500); // 等 0.5 秒
  };

  peer.onconnectionstatechange = () => {
    console.log("[WebRTC] 連線狀態：", peer.connectionState);
    if (
      peer.connectionState === "failed" ||
      peer.connectionState === "disconnected"
    ) {
      endCall();
    }
  };

  if (!localStream) {
    localStream = await startLocalStream(useVideo);
  }

  localStream.getTracks().forEach((track) => {
    peer.addTrack(track, localStream);
  });

  const localVideo = document.getElementById("local-video");
  if (localVideo && localStream) {
    localVideo.srcObject = localStream;
  }
}

export async function endCall({ delayRelease = true } = {}) {
  const connection = getConnection();
  if (connection && remoteConnectionId) {
    await connection.invoke("EndCall", remoteConnectionId);
  }
  if (peer) {
    peer.close();
    peer = null;
  }

  const localVideo = document.getElementById("local-video");
  if (localVideo) localVideo.srcObject = null;

  if (localStream) {
    if (delayRelease) {
      setTimeout(() => {
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
          localStream = null;
          console.log("[WebRTC] 已延遲釋放 localStream");
        }
      }, 3000);
    } else {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
      console.log("[WebRTC] 已立即釋放 localStream");
    }
  }

  remoteStream = null;
  remoteConnectionId = null;

  const remoteAudio = document.getElementById("remote-audio");
  if (remoteAudio) {
    remoteAudio.srcObject = null;
  }

  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject = null;
  }

  console.log("[WebRTC] 通話已結束，所有資源清除");
}

export function getPeer() {
  return peer;
}

export function getRemoteStream() {
  return remoteStream;
}
