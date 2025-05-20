<!-- Backtop 回到頂部 -->
<template>

  Scroll down to see the bottom-right button.
  <el-backtop :bottom="100">

    <div
      style="
        height: 100%;
        width: 100%;
        background-color: var(--el-bg-color-overlay);
        box-shadow: var(--el-box-shadow-lighter);
        text-align: center;
        line-height: 40px;
        color: #1989fa;
      "
    >
      UP
    </div>

  </el-backtop>

</template>


<!-- 套件來源 -->
<script setup>

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

</script>