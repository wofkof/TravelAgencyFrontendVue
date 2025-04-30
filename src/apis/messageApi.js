import axios from "axios"

export const getMessages = async (chatRoomId) => { 
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${chatRoomId}`);
    return response.data;
}