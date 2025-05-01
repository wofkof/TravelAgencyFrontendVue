import api from "@/utils/api";

export const getChatRooms = async (memberId) => {
  const response = await api.get(`/chatrooms/${memberId}`);
  return response.data;
};
