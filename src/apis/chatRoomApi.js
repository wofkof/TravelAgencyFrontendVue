import api from "@/utils/api";

export const getChatRooms = async (memberId) => {
  const response = await api.get(`/chatrooms/${memberId}`);
  return response.data;
};

export const createChatWithCustomerService = async (memberId) => {
  const response = await api.post("/chatrooms/start-with-default-cs", {
    memberId,
  });
  return response.data.chatRoomId;
};

export const closeChatRoom = async (chatRoomId) => {
  return await api.put(`/chatrooms/${chatRoomId}/close`);
};
