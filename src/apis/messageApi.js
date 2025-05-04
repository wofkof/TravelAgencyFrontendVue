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

export async function UploadImageMessage({
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

  return await api.post("/messageupload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
