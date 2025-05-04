import { useChatStore } from "@/stores/chatStore";
import { UploadImageMessage } from "@/apis/messageApi";
import { getChatRooms } from "@/apis/chatRoomApi";

export async function sendImageMessage(file, senderId, senderType = "Member") {
  const chatStore = useChatStore();
  const response = await UploadImageMessage({
    chatRoomId: chatStore.currentChatRoomId,
    senderId,
    senderType,
    file,
  });

  const message = {
    chatRoomId: chatStore.currentChatRoomId,
    senderId,
    senderType,
    messageType: "image",
    content: response.data.relativePath,
    sentAt: new Date(),
  };

  chatStore.addMessage(chatStore.currentChatRoomId, message);
}

export async function fetchChatRooms(memberId) {
  const chatStore = useChatStore();
  const rooms = await getChatRooms(memberId);
  rooms.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  chatStore.setChatRooms(rooms);
}