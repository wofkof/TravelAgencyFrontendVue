import axios from "axios";

export const getChatRooms = async (memberId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/chatrooms/${memberId}`
  );
  return response.data;
};
