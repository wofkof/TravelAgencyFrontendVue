<template>
  <div class="visa-info-container">
    <h3><el-icon><Avatar /></el-icon>越南簽證｜申辦項目</h3>
    <el-card class="visa-info-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <div class="item-title">新辦/更換(14歲以上)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-col :span="8">一般件：16個工作天</el-col>
            <el-col :span="6">效期：10年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 1,700</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
          <el-row style="margin-top: 10px;">
            <el-col :span="8">超速件：7個工作天</el-col>
            <el-col :span="6">效期：10年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 2,850</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="visa-info-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <div class="item-title">新辦/更換(14歲以下)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-col :span="8">一般件：16個工作天</el-col>
            <el-col :span="6">效期：5年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 1,400</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
          <el-row style="margin-top: 10px;">
            <el-col :span="8">超速件：7個工作天</el-col>
            <el-col :span="6">效期：5年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 2,400</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="visa-info-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <div class="item-title">國外遺失(14歲以上)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-col :span="8">一般件：17個工作天</el-col>
            <el-col :span="6">效期：5年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 2,000</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="visa-info-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <div class="item-title">國外遺失(14歲以下)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-col :span="8">一般件：17個工作天</el-col>
            <el-col :span="6">效期：3年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 1,600</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="visa-info-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <div class="item-title">國內遺失(14歲以上)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-col :span="8">一般件：17個工作天</el-col>
            <el-col :span="6">效期：5年</el-col>
            <el-col :span="6" style="text-align: right;">TWD 2,000</el-col>
            <el-col :span="2" style="text-align: right;"><el-icon><ArrowRight /></el-icon></el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue';
</script>

<style scoped>
.visa-info-container {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 讓每個卡片之間有點間距 */
  padding: 20px; /* 讓內容不要太貼邊 */
  background-color: #f9f9f9; /* 幫 Footer 加個淺灰色背景 */
}

.visa-info-card {
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-title {
  font-weight: bold; /* 讓標題粗體一點 */
}
</style>