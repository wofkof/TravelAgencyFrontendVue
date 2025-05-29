import { HubConnectionBuilder } from "@microsoft/signalr";
import { useChatStore } from "@/stores/chatStore";
import { getApiBaseUrl } from "./getApiBaseUrl";

let connection;
let isListening = false;

export const setupSocket = async (chatRoomId) => {
  const chatStore = useChatStore();
  const url =
    getApiBaseUrl() +
    `/chathub?userType=${chatStore.memberType}&userId=${chatStore.memberId}`;

  const isUserChanged =
    connection && !connection.baseUrl.includes(`userId=${chatStore.memberId}`);

  if (isUserChanged) {
    await connection.stop();
    connection = null;
    isListening = false;
  }

  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();
  }

  if (connection.state === "Disconnected") {
    await connection.start();
  }

  // 每次都加入目標聊天室（支援切換聊天室）
  if (chatRoomId != null) {
    await connection.invoke("JoinGroup", chatRoomId.toString());
  }

  if (isListening) return;

  connection.on("ReceiveMessage", async (msg) => {
    const chatStore = useChatStore();
    const isSelf =
      msg.senderId === chatStore.memberId &&
      msg.senderType === chatStore.memberType;
    const isCurrentRoom = msg.chatRoomId === chatStore.currentChatRoomId;

    chatStore.addMessage(msg.chatRoomId, {
      senderType: msg.senderType,
      senderId: msg.senderId,
      senderName: msg.senderName,
      messageType: msg.messageType,
      content: msg.content,
      sentAt: msg.sentAt,
      isRead: msg.isRead,
    });

    if (!isSelf && isCurrentRoom) {
      // 當前聊天室收到對方訊息：立即標記為已讀 + 通知後端
      await markAsRead(
        msg.chatRoomId,
        chatStore.memberId,
        chatStore.memberType
      );
      await connection.invoke(
        "NotifyRead",
        msg.chatRoomId,
        chatStore.memberId,
        chatStore.memberType
      );
    }
  });

  connection.on("MessageRead", (chatRoomId, readerId, readerType) => {
    const chatStore = useChatStore();
    const messages = chatStore.chatRooms[chatRoomId];
    if (!messages) return;

    messages.forEach((msg) => {
      if (msg.senderType !== readerType || msg.senderId !== readerId) {
        msg.isRead = true;
      }
    });
  });

  isListening = true;
};

export const joinAllChatRooms = async (chatRooms) => {
  if (!connection) return;

  for (const room of chatRooms) {
    try {
      await connection.invoke("JoinGroup", room.chatRoomId.toString());
    } catch (err) {
      console.warn("[socket] 加入聊天室群組失敗", room.chatRoomId, err);
    }
  }

  console.log("[socket] ✅ 已加入所有聊天室群組");
};

export const waitForConnectionReady = async () => {
  while (!connection || connection.state !== "Connected") {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

export const sendMessage = async (
  chatRoomId,
  senderType,
  senderId,
  messageType,
  content
) => {
  await connection.invoke("SendMessage", {
    chatRoomId,
    senderType,
    senderId,
    messageType,
    content,
  });
};

export const getConnection = () => connection;

export default connection;
