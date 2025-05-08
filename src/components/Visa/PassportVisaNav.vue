<template>
    <el-tabs type="card">
      <el-tab-pane label="護照申辦">
        <div>
          <h2>護照申辦</h2>
          <p>這裡可以放置護照申辦的詳細資訊和表單。</p>
        </div>
      </el-tab-pane>
      <el-tab-pane label="各國簽證">
        <div>
          <h2>各國簽證</h2>
          <el-collapse @change="handleCollapseChange">
            <el-collapse-item title="港澳大陸" name="hongkong_macau">
              <template #title>
                <el-icon><location /></el-icon>
                <span>港澳大陸</span>
              </template>
              <div>香港</div>
              <div>澳門</div>
            </el-collapse-item>
            <el-collapse-item title="東南亞" name="southeast_asia">
              <div>泰國</div>
              <div>越南</div>
              <div>馬來西亞</div>
            </el-collapse-item>
            <el-collapse-item title="印度週邊" name="indian_subcontinent">
              <div>印度</div>
              <div>尼泊爾</div>
              <div>孟加拉</div>
            </el-collapse-item>
          </el-collapse>
          <el-button style="margin-top: 15px;">落地簽證國家</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </template>


  
 <script setup>
import { ElTabs, ElTabPane, ElCollapse, ElCollapseItem, ElButton, ElIcon } from 'element-plus';
import { Location } from '@element-plus/icons-vue';

const handleCollapseChange = (activeNames) => {
  console.log('當前展開的面板：', activeNames);
  // 在這裡執行您的邏輯
  if (activeNames.includes('hongkong_macau')) {
    // 當 "港澳大陸" 展開時執行的操作
    console.log('港澳大陸列表已展開');
  } else {
    // 當 "港澳大陸" 收合時執行的操作
    console.log('港澳大陸列表已收合');
  }
};
</script>



  <style scoped>

@media (max-width: 768px) {
  .el-tabs--card > .el-tabs__header {
    /* 將 header 改為垂直排列 */
    display: flex;
    flex-direction: column;
    align-items: stretch; /* 讓每個 item 佔滿寬度 */
    border-right: none; /* 移除右邊框 */
    border-bottom: 1px solid #dcdfe6; /* 添加底邊框分隔 */
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item {
    margin-right: 0; /* 移除右邊距 */
    margin-bottom: 2px; /* 添加下邊距 */
    border-left: none;
    border-right: none;
    border-top: 1px solid #dcdfe6; /* 添加上邊框分隔 */
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
    border-top: none; /* 第一個 item 不要有上邊框 */
  }

  .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    border-left: none;
    border-right: none;
    border-top: 1px solid #dcdfe6;
    border-bottom: 2px solid var(--el-color-primary); /* 使用 Element Plus 的主色強調 */
  }
}


  .el-tabs--card > .el-tabs__header .el-tabs__item {
    border: none;
    background-color: #f0f2f5; /* 淺灰色背景 */
    margin-right: 2px;
  }
  
  .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    background-color: #fff;
    border-left: 1px solid #dcdfe6;
    border-right: 1px solid #dcdfe6;
    border-top: 1px solid #dcdfe6;
  }
  
  .el-tabs--card > .el-tabs__header {
    border-bottom: none;
  }

  /* 調整 el-collapse-item 的標題樣式 */
.el-collapse-item__header {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 如果您想添加圖示 */
.el-collapse-item__header::before {
   /* 現在使用 template #title 的方式添加 icon，所以這裡可以移除 */
  /* content: '📍'; */
  margin-right: 8px;
}

.el-collapse-item__content {
  padding: 10px 15px;
  padding-left: 30px; /* 內縮子項目 */
}


  </style>