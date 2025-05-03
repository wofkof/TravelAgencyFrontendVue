import { defineStore } from "pinia";
import { ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const senderId = ref(11110);
  const senderType = ref("Member");
  const toggleUser = () => {
    if (senderId.value === 11110) {
      senderId.value = 1;
      senderType.value = "Employee";
    } else {
      senderId.value = 11110;
      senderType.value = "Member";
    }
  };

  return { senderId, senderType, toggleUser };
});
