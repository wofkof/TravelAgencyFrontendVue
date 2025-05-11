<script setup lang="ts">
import { useCallStore } from "@/stores/callStore";
import { defineEmits } from "vue";

const emits = defineEmits(["accept", "reject"]);
const callStore = useCallStore();
</script>

<template>
  <div class="incoming-call-popup">
    <div class="popup-content">
      <p>
        📞 來自使用者 <strong>{{ callStore.fromId }}</strong> 的來電！
      </p>
      <div class="buttons">
        <el-button type="success" @click="$emit('accept')">接聽</el-button>
        <el-button type="danger" @click="$emit('reject')">拒絕</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.incoming-call-popup {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: white;
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
</style>
