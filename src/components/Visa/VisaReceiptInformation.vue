<!-- 收據資料 -->
 <template>
  <el-card class="receipt-info">
    <template #header>
      <div class="card-header">
        <span>收據資料</span>
      </div>
    </template>
    <div class="receipt-description">
      本公司依財政部台財稅第 10504544630 號函登錄統一編號「旅行業代收轉付電子收據」，不另開立統一發票，付款後以 e-mail 提供。
      <br>
      如行程取消或更動時，為加速退款作業，同意授權本公司代為處理銷貨退回或折讓證明單。
    </div>
    <el-radio-group v-model="needReceipt">
      <el-radio label="不需要抬頭統編">不需要抬頭統編</el-radio>
      <el-radio label="需要抬頭統編">需要抬頭統編</el-radio>
    </el-radio-group>
    <div v-if="needReceipt === '需要抬頭統編'" class="company-info">
      <el-form label-width="80px">
        <el-form-item label="公司抬頭">
          <el-input v-model="companyTitle" placeholder="請輸入公司抬頭"></el-input>
        </el-form-item>
        <el-form-item label="統一編號">
          <el-input v-model="companyNumber" placeholder="請輸入統一編號"></el-input>
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

const needReceipt = ref('不需要抬頭統編'); // 預設選擇不需要
const companyTitle = ref('');
const companyNumber = ref('');

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
.receipt-info {
  margin: 10px;
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.card-header span {
  font-size: 16px;
  font-weight: bold;
}

.receipt-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.el-radio-group {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.company-info {
  padding: 15px 20px;
}

.need-help {
  padding: 15px 20px;
  text-align: left;
}
</style>