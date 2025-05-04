import { HubConnectionBuilder } from "@microsoft/signalr";
import { useChatStore } from "@/stores/chatStore";

const connection = new HubConnectionBuilder()
  .withUrl(import.meta.env.VITE_API_URL.replace("/api", "/chathub"))
  .withAutomaticReconnect()
  .build();

let currentJoinedRoomId = null;
let isListening = false;

export const setupSocket = async (chatRoomId) => {
  if (connection.state === "Disconnected") {
    await connection.start();
    await connection.invoke("JoinGroup", chatRoomId.toString());

    if (currentJoinedRoomId && currentJoinedRoomId !== chatRoomId) {
      await connection.invoke("LeaveGroup", currentJoinedRoomId.toString());
    }
  }

  if (!isListening) {
    connection.on("ReceiveMessage", (msg) => {
      const chatStore = useChatStore();
      const isSelf = msg.senderId === 11110 && msg.senderType === "Member";
      if (isSelf) return;
      const isCurrentRoom = msg.chatRoomId === chatStore.currentChatRoomId;

      const newMessage = {
        senderType: msg.senderType,
        senderId: msg.senderId,
        messageType: msg.messageType,
        content: msg.content,
        sentAt: msg.sentAt,
        isRead: isCurrentRoom,
      };

      chatStore.addMessage(msg.chatRoomId, newMessage);

      if (!isSelf && (!isCurrentRoom || !isScrolledToBottom())) {
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

export default connection;
