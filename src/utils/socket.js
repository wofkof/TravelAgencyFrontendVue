import { HubConnectionBuilder } from "@microsoft/signalr";
import { useChatStore } from "@/stores/chatStore";

const connection = new HubConnectionBuilder()
  .withUrl(import.meta.env.VITE_API_URL.replace("/api", "/chathub"))
  .withAutomaticReconnect()
  .build();

let isListening = false;

export const setupSocket = async (chatRoomId) => {
  if (connection.state === "Disconnected") {
    await connection.start();
  }

  // 每次都加入目標聊天室（支援切換聊天室）
  await connection.invoke("JoinGroup", chatRoomId.toString());

  if (isListening) return;

  connection.on("ReceiveMessage", async (msg) => {
    const chatStore = useChatStore();
    const isSelf = msg.senderId === 11110 && msg.senderType === "Member";
    const isCurrentRoom = msg.chatRoomId === chatStore.currentChatRoomId;

    chatStore.addMessage(msg.chatRoomId, {
      senderType: msg.senderType,
      senderId: msg.senderId,
      messageType: msg.messageType,
      content: msg.content,
      sentAt: msg.sentAt,
      isRead: msg.isRead,
    });

    if (!isSelf && isCurrentRoom) {
      // 當前聊天室收到對方訊息：立即標記為已讀 + 通知後端
      await markAsRead(msg.chatRoomId, 11110, "Member");
      await connection.invoke("NotifyRead", msg.chatRoomId, 11110, "Member");
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

export default connection;
