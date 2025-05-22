<!-- 訂購須知 -->
<template>
  <div class="purchase-notice-wrapper">
    <el-card shadow="hover">
      <!-- 標題 -->
      <h2 class="title">訂購須知</h2>

      <!-- 注意事項 -->
      <div class="section">
        <h3 class="section-title">注意事項</h3>
        <ul class="custom-list">
          <li>
            為完成您訂購之商品，易遊網須將必要之旅客個人資料交付予配合之服務提供業者（例如簽證中心）代為向外交部或各國駐臺辦事處進行作業，並依規約辦理。
          </li>
          <li>
            凡消費滿200元（機票、機加酒、高鐵訂票、票券等類商品需滿400元）以上即可累積 eMoney，詳情請參閱
            <a href="#" target="_blank">eMoney活動辦法說明</a>。
          </li>
        </ul>
      </div>

      <!-- Divider -->
      <el-divider></el-divider>

      <!-- 旅行業代收轉付收據 -->
      <div class="section">
        <h3 class="section-title">旅行業代收轉付收據</h3>
        <ul class="custom-list">
          <li>
            本公司依財政部台財稅第 10504544630 號函統一開立「旅行業代收轉付電子收據」，付款後以 Email 方式寄發收據。
          </li>
          <li>
            如未收到電子收據通知信，請至訂單查詢中下載列印。
          </li>
          <li>
            如欲更改或重開收據，請聯繫客服。
          </li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.purchase-notice-wrapper {
  max-width: 900px;
  margin: 20px auto;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #2a7f2a; /* 綠色標題 */
  margin-bottom: 10px;
}

.custom-list {
  list-style-type: disc;
  padding-left: 20px;
}

.custom-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>

<!-- 套件來源 -->
<script setup>

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

</script>