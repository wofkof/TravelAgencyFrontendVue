import { HubConnectionBuilder } from "@microsoft/signalr";
import { useChatStore } from "@/stores/chatStore";

const connection = new HubConnectionBuilder()
  .withUrl(import.meta.env.VITE_API_URL.replace("/api", "/chathub"))
  .withAutomaticReconnect()
  .build();

export const setupSocket = async () => {
  if (connection.state === "Disconnected") {
    await connection.start();
  }

  connection.on(
    "ReceiveMessage",
    (chatRoomId, senderType, senderId, messageType, content, sentAt) => {
      const chatStore = useChatStore();

      const isSelf = senderId === chatStore.memberId && senderType === "Member";
      const isCurrentRoom = chatRoomId === chatStore.currentChatRoomId;

      const newMessage = {
        senderType,
        senderId,
        messageType,
        content,
        sentAt,
        isRead: isCurrentRoom,
      };

      chatStore.addMessage(chatRoomId, newMessage);

      if (!isSelf && (!isCurrentRoom || !isScrolledToBottom())) {
        chatStore.unreadCountMap[chatRoomId] =
          (chatStore.unreadCountMap[chatRoomId] || 0) + 1;
      }
    }
  );
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
