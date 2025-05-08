<template>
  <el-button
    size="small"
    type="danger"
    plain
    circle
    @click="startCall(targetId)"
    ><el-icon><Phone /></el-icon
  ></el-button>
</template>

<script setup>
import { callUser, listenForCallEvents } from "@/services/webrtcService";

const targetId = 12345;
listenForCallEvents();

const startCall = async (id) => {
  await callUser(id);
};
</script>
