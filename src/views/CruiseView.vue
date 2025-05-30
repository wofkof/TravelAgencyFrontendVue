<template>
  <div style="margin-top: -155px">
    <BigBanner />
    <!-- 熱門行程 -->
    <div class="max-w-7xl mx-auto p-4">
      <PopularTripforC :category="category"/>
    </div>

    <!-- 按郵輪類型排序 -->
    <TripInfos :category="category" :keyword="currentRegion"/>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import BigBanner from "@/components/official/BigBanner.vue";
import PopularTripforC from "@/components/official/PopularTripforC.vue";
import TripInfos from "@/components/official/TripInfos.vue";

const currentRegion = ref("全部"); 

const props = defineProps<{ category: string }>();
</script>

<style>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}
</style>
