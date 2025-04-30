import { HubConnectionBuilder } from "@microsoft/signalr";
import { useChatStore } from "@/stores/chatStore";

const connection = new HubConnectionBuilder()
  .withUrl(import.meta.env.VITE_API_URL.replace("/api", "/chathub"))
  .withAutomaticReconnect()
  .build();

export const setupSocket = async () => {
  const chatStore = useChatStore();

  if (connection.state === "Disconnected") {
    await connection.start();
  }

  connection.on(
    "ReceiveMessage",
    (chatRoomId, senderType, senderId, messageType, content, sentAt) => {
      const isSelf = senderId === chatStore.memberId && senderType === "Member";

      if (!isSelf) {
        const newMessage = {
          senderType,
          senderId,
          messageType,
          content,
          sentAt,
        };
        chatStore.addMessage(chatRoomId, newMessage);
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
