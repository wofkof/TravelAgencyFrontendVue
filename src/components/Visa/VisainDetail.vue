<!-- 訂單明細裡面 -->
<template>
  <el-card class="order-detail-card">
    <h2 class="title">訂單明細</h2>

    <el-descriptions column="1" border>
      <el-descriptions-item label="商品名稱">
        中華民國護照代辦-新辦/更換(14歲以上)-一般件
      </el-descriptions-item>
      <el-descriptions-item label="售價">
        <span class="price">TWD 1,700</span>
      </el-descriptions-item>
      <el-descriptions-item label="辦理天數">
        <span class="highlight">16個工作天</span>（週六、週日及固定假日不算工作天）
      </el-descriptions-item>
      <el-descriptions-item label="證照效期">10年</el-descriptions-item>
      <el-descriptions-item label="所需資料">
        <ol class="info-list">
          <li>身份證正本（1份）</li>
          <li>舊護照（1份）</li>
          <li>六個月內白底彩色照片（1份）</li>
          <li>未滿18歲需附上監護人文件</li>
          <li>委任書（1份）</li>
        </ol>
      </el-descriptions-item>
      <el-descriptions-item label="資料繳交方式">
        以掛號寄送至「104台北市中山區民生東路二段49號2樓」易遊網客服中心收。<br />
        <el-tag type="success">客服人員將於收件後一個工作日內確認</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <h3 class="subtitle">備註</h3>
    <ul class="note-list">
      <li><a href="#">申請人委任格式下載</a></li>
      <li><a href="#">未成年委任格式下載</a></li>
      <li>請務必將照片於申辦前先傳送給客服確認</li>
      <li>受委任人限親屬範圍，同戶籍可免附證明</li>
    </ul>
  </el-card>
</template>

<!-- 套件來源 -->
<script setup>

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

</script>



<style scoped>
.order-detail-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
.subtitle {
  font-size: 18px;
  margin-top: 30px;
}
.price {
  color: orange;
  font-weight: bold;
}
.highlight {
  color: orange;
}
.info-list, .note-list {
  padding-left: 20px;
}
</style>
