<!-- 收據資料 -->
 <template>
  <el-card class="receipt-info">
    <h2 class="title">收據資料</h2>
    <div class="receipt-description">
      本公司依財政部台財稅第 10504544630 號函登錄統一編號「旅行業代收轉付電子收據」，不另開立統一發票，付款後以 e-mail 提供。
      <br>
      如行程取消或更動時，為加速退款作業，同意授權本公司代為處理銷貨退回或折讓證明單。
    </div>
    <el-radio-group v-model="orderFormStore.data.TaxIdOption" @change="handleTaxIdOptionChange">
      <el-radio :label="0">不需要抬頭統編</el-radio>
      <el-radio :label="1">需要抬頭統編</el-radio>
    </el-radio-group>
    <div v-if="orderFormStore.data.TaxIdOption === 1" class="company-info">
      <el-form label-width="80px">
        <el-form-item label="公司抬頭">
          <el-input v-model="orderFormStore.data.CompanyName" placeholder="請輸入公司抬頭"></el-input>
        </el-form-item>
        <el-form-item label="統一編號">
          <el-input v-model="orderFormStore.data.TaxIdNumber" placeholder="請輸入統一編號"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="need-help">
      <el-button type="text" icon="el-icon-plus">需協助事項</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue'; // 引入 onMounted
import { useOrderFormStore } from '@/stores/orderForm';
import useVisaRouter from "@/utils/visaRouterHelp";

const orderFormStore = useOrderFormStore();
// const needReceipt = ref('不需要抬頭統編'); // 預設選擇不需要，已由 store 綁定取代
// const companyTitle = ref('');已由 store 綁定取代
// const companyNumber = ref('');已由 store 綁定取代
const visaRouter = useVisaRouter();

// 監聽是否需要統編的選項變化
const handleTaxIdOptionChange = (newValue) => {
  if (newValue === 0) { // 選擇 "不需要抬頭統編"
    orderFormStore.updateField('CompanyName', null); // 清空公司抬頭
    orderFormStore.updateField('TaxIdNumber', null); // 清空統一編號
  }
  // 如果選擇 "需要抬頭統編" (newValue === 1)，則不需要特別清空，因為用戶會填寫
};

// 在組件掛載時，初始化 Pinia Store 中的 TaxIdOption
onMounted(() => {
  if (orderFormStore.data.TaxIdOption === null || orderFormStore.data.TaxIdOption === undefined) {
    orderFormStore.updateField('TaxIdOption', 0); // 預設為 "不需要抬頭統編"
  }
});
</script>

<style scoped>
.receipt-info {
  max-width: 1400px; /* 區塊的最大寬度 */
  margin: 0 auto; /* 頁面中水平置中 */
  padding: 20px;  /* 這個區塊的內邊距 */
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
}

.receipt-description {
  color: #606266; /* Element Plus 常用字體顏色 */
  font-size: 14px;
  line-height: 1.6; /* 調整行高增加可讀性 */
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fcfcfc; /* 輕微底色增加區分 */
}

.el-radio-group {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex; /* 讓 radio 按鈕排列更靈活 */
  gap: 20px; /* 增加間距 */
}

.company-info {
  padding: 15px 20px;
}

.need-help {
  padding: 15px 20px;
  text-align: left;
}
</style>