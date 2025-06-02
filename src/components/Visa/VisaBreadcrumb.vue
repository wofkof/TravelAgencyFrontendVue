<!-- 麵包屑 -->
<template>

  <!-- <el-card class="order-detail-card"> -->

  <el-breadcrumb :separator-icon="ArrowRight">

    <el-breadcrumb-item :to="{ path: 'DocumentMenuView' }">
      證件選單
    </el-breadcrumb-item>

    <el-breadcrumb-item  :to="{ path: 'OrderFormView' }">
      填寫訂單
    </el-breadcrumb-item>

    <el-breadcrumb-item  :to="{ path: 'PaymentView' }">
      付款
    </el-breadcrumb-item>

    <el-breadcrumb-item  :to="{ path: 'CompletedOrderDetailView' }">
      完成訂單明細
    </el-breadcrumb-item>

  </el-breadcrumb>

  <!-- </el-card> -->

</template> 



<!-- 套件來源 -->
<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue'
import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>
