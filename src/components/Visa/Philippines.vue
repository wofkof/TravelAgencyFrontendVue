<template>
  <div class="visa-info-container">
    <h3><el-icon><Avatar /></el-icon>菲律賓簽證｜申辦項目</h3>
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">單次觀光</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：10個工作天</el-col>
              <el-col :span="12">效期：3個月</el-col>
              <el-col :span="12">停留時間 59天</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,750</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">急件：8個工作天</el-col>
              <el-col :span="12">效期：3個月</el-col>
              <el-col :span="12">停留時間 59天</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,400</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
    <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">電子旅遊許可簽證</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：6個工作天</el-col>
              <el-col :span="12">效期：1個月</el-col>
              <el-col :span="12">停留時間 30天</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,000</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
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
  padding: 30px; /* 讓內容不要太貼邊 */
  background-color: #f9f9f9; /* 幫 Footer 加個淺灰色背景 */
}
.visa-info-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);/* 可以調整卡片的樣式，例如陰影 */
}
.item-title {
  font-weight: bold; /* 讓標題粗體一點 */
}
.item-info-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);/* 可以調整卡片的樣式，例如陰影 */
  width:450px;
}
</style>

