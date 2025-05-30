import { defineStore } from "pinia";

export const useCallStore = defineStore("call", {
  state: () => ({
    isIncoming: false,
    isCalling: false,
    showPopup: false,
    fromId: null as string | null,
    offer: null as any,
    roomId: null as number | null,
    callType: "audio" as "audio" | "video",
  }),
  actions: {
    receiveCall(
      fromId: string,
      offer: RTCSessionDescriptionInit,
      roomId: number,
      callType: "audio" | "video"
    ) {
      this.isIncoming = true;
      this.fromId = fromId;
      this.offer = offer;
      this.roomId = roomId;
      this.callType = callType;
      this.showPopup = true;
    },
    reset() {
      this.isIncoming = false;
      this.isCalling = false;
      this.showPopup = false;
      this.fromId = null;
      this.offer = null;
      this.roomId = null;
      this.callType = "audio";
    },
  },
});
