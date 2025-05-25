<!-- 選擇付款商品 -->
<template>
  <el-table :data="orderItems" style="width: 100%">
    <el-table-column type="selection" width="55"></el-table-column>
    <el-table-column prop="name" label="姓名" width="150"></el-table-column>
    <el-table-column prop="productName" label="商品名稱"></el-table-column>
    <el-table-column prop="price" label="商品金額" width="120"></el-table-column>
    <el-table-column prop="paidAmount" label="已付金額" width="120"></el-table-column>
    <el-table-column prop="unpaidAmount" label="未付金額" width="120"></el-table-column>
    <el-table-column prop="paymentDeadline" label="付款期限" width="180"></el-table-column>
  </el-table>
</template>

<script setup>
import { ref } from 'vue';

const orderItems = ref([
  {
    name: 'WU FUCHENG, MR.',
    productName: '中華民國護照代辦-新辦/換發(14歲以上)-一般件',
    price: 1700,
    paidAmount: 0,
    unpaidAmount: 1700,
    paymentDeadline: '2025/05/20 15:57'
  }
]);

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>