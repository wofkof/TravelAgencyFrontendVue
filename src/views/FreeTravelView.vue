<!-- 測試用 -->
<template>
  <div style="margin-top: -155px">
    <BigBanner class="mb-6 bg-slate-600"/>
  </div>
  <div style="margin-top: 155px">
    <el-button @click="show('tab1')">Create</el-button>
    <el-button @click="show('tab2')">List</el-button>
    <el-button @click="show('tab3')">StatusList</el-button>

    <keep-alive>
      <Create v-if="tab === 'tab1'" />
    </keep-alive>
    <keep-alive>
      <List v-if="tab === 'tab2'" />
    </keep-alive>
    <keep-alive>
      <StatusList v-if="tab === 'tab3'" />
    </keep-alive>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Create from "@/components/customtravel/Create.vue";
import List from "@/components/customtravel/List.vue";
import StatusList from "@/components/customtravel/StatusList.vue";

const tab = ref("tab1");

function show(index) {
  tab.value = index;
}
</script>
