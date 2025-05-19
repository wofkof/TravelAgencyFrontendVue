<!-- 我是麵包屑 -->
<template>

  <el-breadcrumb :separator-icon="ArrowRight">

    <el-breadcrumb-item :to="{ path: 'VisaDetailView' }">訂單明細</el-breadcrumb-item>

    <el-breadcrumb-item>填寫訂單</el-breadcrumb-item>

    <el-breadcrumb-item>付款</el-breadcrumb-item>

    <el-breadcrumb-item>完成訂單</el-breadcrumb-item>

  </el-breadcrumb>

</template>


<!-- 套件來源 -->
<script lang="ts" setup>

import { ArrowRight } from '@element-plus/icons-vue'
import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();



// import {VisaDetail} from "@/Visa/VisaDetail.vue";

</script>
