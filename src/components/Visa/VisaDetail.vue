<template>
  <div>
    <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
  <el-button type="primary" @click="visaRouter.VisaOrderView">購買</el-button>
</template>

<script setup>
import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>