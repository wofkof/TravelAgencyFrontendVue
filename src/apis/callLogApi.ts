import api from "@/utils/api";
export interface CallLogDto {
  chatRoomId: number;
  callerType: "Employee" | "Member";
  callerId: number;
  receiverType: "Employee" | "Member";
  receiverId: number;
  callType: "audio" | "video";
  status: "completed" | "missed" | "rejected";
  startTime: string;
  endTime?: string;
  durationInSeconds?: number;
}

export const createCallLog = async (log: CallLogDto) => {
  return await api.post("/CallLogs", log);
};

export async function getCallLogsByChatRoom(chatRoomId) {
  const response = await api.get(`/calllogs/ByChatRoom/${chatRoomId}`);
  return response.data;
}
