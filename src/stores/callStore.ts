import { defineStore } from "pinia";

export const useCallStore = defineStore("call", {
  state: () => ({
    isIncoming: false,
    isCalling: false,
    showPopup: false,
    fromId: null as string | null,
    offer: null as any,
  }),
  actions: {
    receiveCall(fromId: string, offer: any) {
      this.isIncoming = true;
      this.fromId = fromId;
      this.offer = offer;
      this.showPopup = true;
    },
    reset() {
      this.isIncoming = false;
      this.isCalling = false;
      this.showPopup = false;
      this.fromId = null;
      this.offer = null;
    },
  },
});
