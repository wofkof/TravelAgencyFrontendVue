<template>
  <el-button
    type="warning"
    @mousedown="startRecording"
    @mouseup="stopRecording"
    @mouseleave="cancelIfRecording"
    size="small"
    plain
    circle
  >
    <el-icon><Microphone /></el-icon>
  </el-button>
</template>

<script setup>
import { sendAudioMessage } from "@/services/chatService";
import { ref } from "vue";

const isRecording = ref(false);
let mediaRecorder;
let chunks = [];
let startTime;

const startRecording = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    ElMessage.error("不支援錄音功能");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const durationInSeconds = Math.floor((Date.now() - startTime) / 1000);
      const blob = new Blob(chunks, { type: "audio/webm" });
      const file = new File([blob], `audio_${Date.now()}.webm`, {
        type: "audio/webm",
      });

      try {
        await sendAudioMessage(file, 11110, "Member", durationInSeconds);
        ElMessage.success("錄音已傳送");
      } catch (err) {
        ElMessage.error("錄音失敗（錄音時間請超過一秒）");
        console.log(err);
      }
    };

    mediaRecorder.start();
    startTime = Date.now();
    isRecording.value = true;
  } catch (error) {
    ElMessage.error("錄音失敗");
    console.error(error);
  }
};

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
  }
};

const cancelIfRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
    chunks = [];
  }
};
</script>
