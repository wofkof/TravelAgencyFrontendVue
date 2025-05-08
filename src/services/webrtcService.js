import connection from "@/utils/socket";

let peer;
let localStream;
let remoteStream;
let remoteConnectionId = null;

export async function startLocalStream() {
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  return localStream;
}

export async function callUser(targetId) {
  remoteConnectionId = targetId;
  await createPeerConnection();

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  await connection.invoke("SendCallOffer", targetId, offer);
}

export function listenForCallEvents() {
  if (!connection) return;

  connection.on("ReceiveCallOffer", async (fromId, offer) => {
    remoteConnectionId = fromId;
    await createPeerConnection();
    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    await connection.invoke("SendCallAnswer", fromId, answer);
  });

  connection.on("ReceiveCallAnswer", async (fromId, answer) => {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  });

  connection.on("ReceiveIceCandidate", async (fromId, candidate) => {
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  });
}

async function createPeerConnection() {
  peer = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peer.onicecandidate = (event) => {
    if (event.candidate) {
      connection.invoke(
        "SendIceCandidate",
        remoteConnectionId,
        event.candidate
      );
    }
  };

  peer.ontrack = (event) => {
    remoteStream = event.streams[0];
    const remoteAudio = document.getElementById("remote-audio");
    if (remoteAudio) remoteAudio.srcObject = remoteStream;
  };

  if (!localStream) {
    localStream = await startLocalStream();
  }

  localStream.getTracks().forEach((track) => {
    peer.addTrack(track, localStream);
  });
}
