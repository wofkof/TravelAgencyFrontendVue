<template>
    <h1>自訂行程（狀態）</h1>
    <div class="custom-list-container">
      <div
        v-for="(item, index) in travelList"
        :key="index"
        class="travel-card"
      >
        <div class="travel-info">
          <div class="row">
            <el-input v-model="item.title" placeholder="Title" disabled />
            <el-input v-model="item.people" placeholder="People" disabled style="width: 100px" />
            <span>人</span>
          </div>
          <div class="row">
            <el-date-picker v-model="item.start" type="date" disabled placeholder="Starts" />
            <span>-</span>
            <el-date-picker v-model="item.end" type="date" disabled placeholder="End" />
            <el-input v-model="item.days" placeholder="Days" disabled style="width: 100px" />
            <span>天</span>
          </div>
        </div>
        <div class="status-section">
          <div class="status-bar" :class="statusClass(item.status)">
            <span class="status-text">{{ item.statusText }}</span>
          </div>
            <div class="actions">
            <el-icon><View /></el-icon>
            <el-icon v-if="item.status === '完成'"><ShoppingCart /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { View, ShoppingCart } from '@element-plus/icons-vue'
  
  // 模擬資料
  const travelList = ref([
    { title: 'Title', people: 2, start: '', end: '', days: 3, status: '待審核', statusText: '待審核' },
    { title: 'Title', people: 4, start: '', end: '', days: 5, status: '審核中', statusText: '審核中' },
    { title: 'Title', people: 1, start: '', end: '', days: 2, status: '完成', statusText: '審核完成' },
    { title: 'Title', people: 3, start: '', end: '', days: 4, status: '取消', statusText: '已取消' },
  ])
  
  const statusClass = (status) => {
    switch (status) {
      case '待審核': return 'status-pending'
      case '審核中': return 'status-review'
      case '完成': return 'status-success'
      case '取消': return 'status-cancel'
      default: return ''
    }
  }
  </script>
  
  <style scoped>
  .custom-list-container {
    background-color: #71b2d879;
    padding: 30px;
    border-radius: 25px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  h1 {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .travel-card {
    display: flex;
    align-items: stretch;
    background-color: #f0f8dc;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 2px 2px 8px #ccc;
    overflow: hidden;
  }
  
  .travel-info {
    flex: 1;
      padding: 15px;
      background-color: #f1f8e9;
  }
  
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .status-section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100px;
    border-left: 1px solid #ccc;
    border-radius: 0 10px 10px 0;
    overflow: hidden;
  }
  
  .status-bar {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    writing-mode: vertical-rl;
    font-weight: bold;
    color: #000;
  }
  
  .status-text {
    writing-mode: vertical-rl;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10px;
  }
  
  .actions { 
    flex: 1;
    background-color: #e3effd;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  .status-pending {
    background-color: #f7b267;
  }
  .status-review {
    background-color: #f7d674;
  }
  .status-success {
    background-color: #f4e04d;
  }
  .status-cancel {
    background-color: #f26c63;
  }
  </style>
  