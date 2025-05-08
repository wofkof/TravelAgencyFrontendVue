import api from "@/utils/api";

export const getMessages = async (chatRoomId) => {
  const response = await api.get(`/messages/${chatRoomId}`);
  return response.data;
};

export const markAsRead = async (chatRoomId, senderId, senderType) => {
  return await api.post("/messages/mark-as-read", {
    chatRoomId,
    senderId,
    senderType,
  });
};

export async function uploadImageMessage({
  chatRoomId,
  senderId,
  senderType,
  file,
}) {
  const formData = new FormData();
  formData.append("chatRoomId", chatRoomId);
  formData.append("senderId", senderId);
  formData.append("senderType", senderType);
  formData.append("messageType", "image");
  formData.append("file", file);

  return await api.postForm("/messageupload/upload-image", formData);
}

export async function uploadAudioMessage({
  chatRoomId,
  senderId,
  senderType,
  durationInSeconds,
  file,
}) {
  const formData = new FormData();
  formData.append("chatRoomId", chatRoomId);
  formData.append("senderId", senderId);
  formData.append("senderType", senderType);
  formData.append("messageType", "audio");
  formData.append("durationInSeconds", durationInSeconds);
  formData.append("file", file);

  return await api.postForm("/messageupload/upload-audio", formData);
}
