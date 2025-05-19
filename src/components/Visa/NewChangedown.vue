<template>
  <div class="visa-info-container">
    <h3><el-icon><Avatar /></el-icon>中華民國護照｜申辦項目|新辦/更換(14歲以下)</h3>

    <div class="VisaOrderdetails">
     <el-card class="visa-info-card">
      <el-row :gutter="2" align="middle">
        <el-col :span="5">
          <div class="item-title">新辦/更換(14歲以下)</div>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">一般件：16個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 1,400</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>

          <el-row>
            <el-card class="item-info-card">
              <el-col :span="16">超特急件：7個工作天</el-col>
              <el-col :span="12">效期：5年</el-col>
              <el-col :span="30" style="text-align: right;" styl="text-align: left;">
                <el-col :span="24" style="text-align: right;">TWD 2,400</el-col>
                <el-button type="primary" size="large" @click="selectGeneral">選擇</el-button>
              </el-col>
            </el-card>
          </el-row>
        </el-col>
      </el-row>
    </el-card>
   </div>
  </div>
</template>

<script setup>
import { ArrowRight } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

  const router = useRouter();
  const goToVisaOrderInformation = () => {
    router.push({ name: 'VisaOrderInformation' });
};
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
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-title {
  font-weight: bold; /* 讓標題粗體一點 */
}

.item-info-card {
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width:450px;
}
</style>

