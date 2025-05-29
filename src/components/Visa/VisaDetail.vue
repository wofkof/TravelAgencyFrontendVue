<!-- 填寫訂單 -->
<template>

  <div>

    <!-- <el-container>
      <el-header>Header</el-header>
      <el-main>Main</el-main>
      <el-footer>Footer</el-footer>
    </el-container> -->
1111
  </div>

  <el-button type="primary" @click="visaRouter.PaymentView">購買</el-button>

</template>


<!-- 套件來源 -->
<script setup>

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

</script>