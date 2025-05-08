<template>
  <el-upload
    :auto-upload="false"
    :show-file-list="false"
    accept="image/*"
    :on-change="handleImageSelect"
  >
    <el-button size="small" type="info" plain circle
      ><el-icon><PictureFilled /></el-icon
    ></el-button>
  </el-upload>
</template>

<script setup>
import { sendImageMessage } from "@/services/chatService";

const handleImageSelect = async (uploadFile) => {
  try {
    const file = uploadFile.raw;
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      ElMessage.error("請選擇圖片檔案（jpg, png, gif）");
      return;
    }

    await sendImageMessage(file, 11110);
    ElMessage.success("圖片已傳送");
  } catch (err) {
    ElMessage.error("圖片上傳失敗");
    console.error(err);
  }
};
</script>
