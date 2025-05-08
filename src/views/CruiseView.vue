<template>
 
  <!-- 熱門行程 -->
  <div class="max-w-7xl mx-auto p-4">
    
    <h1 class="mb-2">精選遊輪假期</h1>
    <div class="my-3">
        <table class="table-fixed w-full">
          <tbody>
            <tr class="border-b-2">
              <td>1</td>
              <td class="bg-blue-200">2</td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>

  <!-- 按郵輪類型排序 -->
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="mb-2">xx郵輪號</h1>
    
    
    <el-tabs
    v-model="activeName"
    type="card"
    class="demo-tabs"
    @tab-click="handleClick"
    >
    <el-tab-pane label="User" name="first">
      <div class="grid grid-cols-3 gap-6">
      <div class="">
        <div class="border rounded-lg bg-blue-300 w-full h-80">
          <!-- 放置圖片 -->
        </div>
      </div>
      <div class="col-span-2">
        <table class="table-fixed w-full">
            <tbody>
              <tr class="border-b-2">
                <td>..........放置行程1</td>
              </tr>
            </tbody>
        </table>
      </div>
      </div>
    </el-tab-pane>
    
  </el-tabs>
  </div>
  <!-- button測試 -->
  <div class="max-w-7xl mx-auto p-4">
    <div class="flex justify-center">
      <el-radio-group v-model="tabPosition" style="margin-bottom: 30px">
        <el-radio-button value="top">top</el-radio-button>
        <el-radio-button value="right">right</el-radio-button>
        <el-radio-button value="bottom">bottom</el-radio-button>
        <el-radio-button value="left">left</el-radio-button>
      </el-radio-group>
    </div>
    

  <el-tabs :tab-position="tabPosition" style="height: 200px" class="demo-tabs">
    <el-tab-pane label="User">User</el-tab-pane>
    <el-tab-pane label="Config">Config</el-tab-pane>
    <el-tab-pane label="Role">Role</el-tab-pane>
    <el-tab-pane label="Task">Task</el-tab-pane>
  </el-tabs>

  </div>
  
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { TabsPaneContext } from 'element-plus';
import type { TabsInstance } from 'element-plus';
const tabPosition = ref<TabsInstance['tabPosition']>('left');
const activeName = ref('first');

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
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