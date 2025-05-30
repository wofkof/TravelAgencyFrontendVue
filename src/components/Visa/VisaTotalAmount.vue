<!-- 應付總額-->
 <template>
  <el-card class="order-summary">
    <!-- <template #header>
      <div class="card-header">
        <span>中華民國護照代辦-新辦/更換(14歲以上)</span>
        <el-tag size="small">商品明細</el-tag>
      </div>
    </template> -->
    <div class="item">
      中華民國護照代辦-新辦/更換(14歲以上) x 1
      <span class="price">TWD 1,700</span>
    </div>
    <div class="total">
      應付總額
      <span class="total-price">TWD 1,700</span>
    </div>

    <el-button type="primary" 

    @click="visaRouter.PaymentView"

    size="large" style="width: 100%;font-size: 25px">送出訂單資料</el-button>
    
  </el-card>
</template>

<style scoped>
.order-summary {
  /* 區塊的最大寬度 */
  max-width: 1400px;
  /* 頁面中水平置中 */
  margin: 0 auto;
  /* 這個區塊的內邊距 */
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-summary .item {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.order-summary .price {
  font-weight: bold;
}

.order-summary .total {
  /* display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #eee; */
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.order-summary .total-price {
  font-size: 1.5em;
  color: #f56c6c;
  font-weight: bold;
}
</style>

<!-- 套件來源 -->
<script setup>

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

</script>