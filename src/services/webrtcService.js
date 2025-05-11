import { getConnection } from "@/utils/socket";
import api from "@/utils/api";

let peer;
let localStream;
let remoteStream;
let remoteConnectionId = null;
let hasStartedListening = false;
let incomingCallHandler = null;

export async function startLocalStream() {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
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

export async function callUser(targetUserId) {
  const connectionId = await getConnectionId("Employee", targetUserId);
  if (!connectionId) {
    alert("對方未上線或無法通話");
    return;
  }

  remoteConnectionId = connectionId;
  await createPeerConnection(connectionId); // 💡 傳入對方 ID

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  const conn = getConnection();
  if (conn?.state === "Connected") {
    await conn.invoke("SendCallOffer", connectionId, offer);
    console.log("[WebRTC] 已送出 offer 給", connectionId);
  } else {
    console.warn("[WebRTC] 無法送出 offer，SignalR 尚未連線");
  }
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

  conn.on("ReceiveCallOffer", (fromId, offer) => {
    console.log("[WebRTC] 收到 offer，來自", fromId);
    if (typeof incomingCallHandler === "function") {
      incomingCallHandler(fromId, offer);
    }
  });

  conn.on("ReceiveCallAnswer", async (fromId, answer) => {
    console.log("[WebRTC] 收到 answer，來自", fromId);
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  });

  conn.on("ReceiveIceCandidate", async (fromId, candidate) => {
    console.log("[WebRTC] 收到 ICE candidate，來自", fromId);
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  });
}

export async function acceptCall(fromId, offer) {
  remoteConnectionId = fromId;
  await createPeerConnection(fromId);
  await peer.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  const conn = getConnection();
  if (conn?.state === "Connected") {
    await conn.invoke("SendCallAnswer", fromId, answer);
    console.log("[WebRTC] 已送出 answer 給", fromId);
  }
}

export async function createPeerConnection(remoteId) {
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
    const remoteAudio = document.getElementById("remote-audio");
    if (remoteAudio) {
      remoteAudio.srcObject = remoteStream;
      console.log("[WebRTC] 設定 remote-audio 成功");
    } else {
      console.warn("[WebRTC] 無法找到 #remote-audio 元素");
    }
  };

  if (!localStream) {
    localStream = await startLocalStream();
  }

  localStream.getTracks().forEach((track) => {
    peer.addTrack(track, localStream);
  });
}

export function getPeer() {
  return peer;
}

export function getRemoteStream() {
  return remoteStream;
}
