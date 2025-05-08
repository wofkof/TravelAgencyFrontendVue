<!-- <template>
  <h1>自由行</h1>
</template> -->

<!-- 測試用 -->
<template>
  <div style="margin-top: -155px">
    <BigBanner class="mb-6 bg-slate-600"/>
  </div>
  <div style="margin-top: 155px">
    <el-button @click="show('tab1')">Create</el-button>
    <el-button @click="show('tab2')">List</el-button>
    <el-button @click="show('tab3')">Content</el-button>
    <el-button @click="show('tab4')">StatusList</el-button>
    <el-button @click="show('tab5')">StatusContent</el-button>

    <keep-alive>
      <Create v-if="tab === 'tab1'" />
    </keep-alive>
    <keep-alive>
      <List v-if="tab === 'tab2'" />
    </keep-alive>
    <keep-alive>
      <Content v-if="tab === 'tab3'" />
    </keep-alive>
    <keep-alive>
      <StatusList v-if="tab === 'tab4'" />
    </keep-alive>
    <keep-alive>
      <StatusContent v-if="tab === 'tab5'" />
    </keep-alive>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Create from "@/components/customtravel/Create.vue";
import List from "@/components/customtravel/List.vue";
import Content from "@/components/customtravel/Content.vue";
import StatusList from "@/components/customtravel/StatusList.vue";
import StatusContent from "@/components/customtravel/StatusContent.vue";

const tab = ref("tab1");

function show(index) {
  tab.value = index;
}
</script>
