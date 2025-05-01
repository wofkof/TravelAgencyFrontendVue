import api from "@/utils/api";

export const getMessages = async (chatRoomId) => {
  const response = await api.get(`/messages/${chatRoomId}`);
  return response.data;
};

export const markAsRead = async (chatRoomId) => {
  return await api.post(`/messages/mark-as-read/${chatRoomId}`);
};
