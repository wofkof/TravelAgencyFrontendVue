<!-- 取件方式 -->
 <template>
  <el-card class="pickup-method">
     <h2 class="title">取件方式</h2>
    <el-radio-group v-model="pickupType">
      <el-radio label="郵寄">郵寄</el-radio>
      <div v-if="pickupType === '郵寄'" class="shipping-address">
        <el-form label-width="80px">
          <el-row :gutter="10">
            <el-col :span="10">
              <el-form-item label="縣市">
                <el-select v-model="shippingCity" placeholder="縣市">
                  <el-option
                    v-for="item in cities"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="鄉鎮市區">
                <el-select v-model="shippingDistrict" placeholder="鄉鎮市區" :disabled="!shippingCity">
                  <el-option
                    v-for="item in districts[shippingCity] || []"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="郵遞區號">
            <el-input v-model="postalCode" placeholder="郵遞區號" :disabled="!shippingDistrict"></el-input>
          </el-form-item>
          <el-form-item label="請填寫">
            <el-input v-model="addressDetail" placeholder="請填寫詳細地址"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <el-radio label="門市取件">門市取件</el-radio>
      </el-radio-group>
  </el-card>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';

const pickupType = ref('郵寄'); // 預設選擇郵寄
const shippingCity = ref('');
const shippingDistrict = ref('');
const postalCode = ref('');
const addressDetail = ref('');

// 模擬縣市和鄉鎮市區資料
const cities = ref(['高雄市', '台北市', '台中市']);
const districts = reactive({
  '高雄市': ['鳳山區', '苓雅區', '三民區'],
  '台北市': ['中正區', '大安區', '信義區'],
  '台中市': ['西屯區', '北屯區', '南屯區'],
});

// 監聽鄉鎮市區的變化，可以根據選擇自動填充郵遞區號 (需要後端資料支援)
watch(shippingDistrict, (newDistrict) => {
  // 這裡可以根據選擇的縣市和鄉鎮市區發送 API 請求獲取郵遞區號
  // 這裡僅為範例，實際應用需要替換為你的邏輯
  if (shippingCity.value === '高雄市' && newDistrict === '鳳山區') {
    postalCode.value = '830';
  } else if (shippingCity.value === '台北市' && newDistrict === '中正區') {
    postalCode.value = '100';
  } else {
    postalCode.value = '';
  }
});

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();
</script>

<style scoped>
.pickup-method {
   /* 區塊的最大寬度 */
  max-width: 1400px;
  /* 頁面中水平置中 */
  margin: 0 auto;
  /* 這個區塊的內邊距 */
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.shipping-address {
  margin-top: 15px;
  padding-left: 20px;
  border-left: 1px solid #eee;
}
</style>