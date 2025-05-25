import { HubConnectionBuilder } from "@microsoft/signalr";
import { useChatStore } from "@/stores/chatStore";
import { getApiBaseUrl } from "./getApiBaseUrl";

let connection;
let isListening = false;

export const setupSocket = async (chatRoomId) => {
  if (!connection) {
    const chatStore = useChatStore();
    const url =
      getApiBaseUrl() +
      `/chathub?userType=${chatStore.memberType}&userId=${chatStore.memberId}`;

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

    // 顯示紅點提示：聊天室未開啟、不是當前聊天室、沒滾到最底
    if (
      !isSelf &&
      (!chatStore.showChat || !isCurrentRoom || !isScrolledToBottom())
    ) {
      chatStore.unreadCountMap[msg.chatRoomId] =
        (chatStore.unreadCountMap[msg.chatRoomId] || 0) + 1;
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
