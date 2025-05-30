import { useChatStore } from "@/stores/chatStore";
import { uploadImageMessage, uploadAudioMessage } from "@/apis/messageApi";
import { getChatRooms } from "@/apis/chatRoomApi";

export async function sendImageMessage(file, senderId, senderType = "Member") {
  const chatStore = useChatStore();
  await uploadImageMessage({
    chatRoomId: chatStore.currentChatRoomId,
    senderId,
    senderType,
    file,
  });
}

export async function sendAudioMessage(
  file,
  senderId,
  senderType = "Member",
  duration
) {
  const chatStore = useChatStore();
  await uploadAudioMessage({
    chatRoomId: chatStore.currentChatRoomId,
    senderId,
    senderType,
    durationInSeconds: duration,
    file,
  });
}

export async function fetchChatRooms(memberId) {
  const chatStore = useChatStore();
  chatStore.isChatRoomsLoaded = false;
  const rooms = await getChatRooms(memberId);
  rooms.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
  chatStore.setChatRooms(rooms);
  return rooms;
}
