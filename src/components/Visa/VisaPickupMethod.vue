<!-- 取件方式 -->
 <template>
  <el-card class="pickup-method">
     <h2 class="title">取件方式</h2>
    <el-radio-group v-model="orderFormStore.data.PickupMethodOption" @change="handlePickupMethodChange">
      <el-radio :label="0">郵寄</el-radio>
      <div v-if="orderFormStore.data.PickupMethodOption === 0" class="shipping-address">
        <el-form label-width="80px">
          <el-row :gutter="10">
            <el-col :span="17">
              <el-form-item label="縣市">
                <el-select v-model="orderFormStore.data.MailingCity" placeholder="縣市">
                  <el-option
                    v-for="item in cities"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="17">
              <el-form-item label="鄉鎮市區">
                <el-select v-model="selectedDistrict" 
                placeholder="鄉鎮市區" :disabled="!orderFormStore.data.MailingCity">
                  <el-option
                    v-for="item in districts[orderFormStore.data.MailingCity] || []"
                    :key="item"
                    :label="item"
                    :value="item"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="郵遞區號">
            <el-input v-model="postalCode" placeholder="郵遞區號" :disabled="!selectedDistrict"></el-input>
          </el-form-item>
          <el-form-item label="詳細地址">
            <el-input v-model="orderFormStore.data.MailingDetailAddress" placeholder="請填寫詳細地址">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <el-radio :label="1">門市取件</el-radio>
      <div v-if="orderFormStore.data.PickupMethodOption === 1" class="store-address">
        <el-form label-width="80px">
          <el-form-item label="門市地址">
            <el-input v-model="orderFormStore.data.StoreDetailAddress" placeholder="請填寫門市詳細地址"></el-input>
          </el-form-item>
          </el-form>
      </div>
    </el-radio-group>
  </el-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { useOrderFormStore } from '@/stores/orderForm';
import useVisaRouter from "@/utils/visaRouterHelp";



// 鄉鎮市區和郵遞區號的本地狀態
const selectedDistrict = ref(''); // 用於綁定鄉鎮市區選單
const postalCode = ref(''); // 用於綁定郵遞區號輸入框

const orderFormStore = useOrderFormStore();
const pickupType = ref('郵寄'); // 預設選擇郵寄
const shippingCity = ref('');
const shippingDistrict = ref('');
const addressDetail = ref('');
const visaRouter = useVisaRouter();

// 模擬縣市和鄉鎮市區資料
const cities = ref(['高雄市', '台北市', '台中市']);
const districts = reactive({
  '高雄市': ['鳳山區', '苓雅區', '三民區'],
  '台北市': ['中正區', '大安區', '信義區'],
  '台中市': ['西屯區', '北屯區', '南屯區'],
});

// 初始化組件時，根據 Pinia Store 的值設置 UI 狀態
onMounted(() => {
  // 設置 PickupMethodOption 的預設值，例如 '郵寄' 對應 0
  if (orderFormStore.data.PickupMethodOption === null) {
    orderFormStore.updateField('PickupMethodOption', 0); // 預設為郵寄
  }

  // 初始化鄉鎮市區和郵遞區號
  // 如果 store.MailingCity 已經有值，則初始化 selectedDistrict 和 postalCode
  if (orderFormStore.data.MailingCity && orderFormStore.data.MailingDetailAddress) {
      // 假設 MailingDetailAddress 中包含鄉鎮市區和郵遞區號，需要解析
      // 這裡需要根據你的地址格式來解析
      // 簡化處理：假設你的 MailingDetailAddress 存的是 "郵遞區號 縣市鄉鎮市區 詳細地址"
      const fullAddress = orderFormStore.data.MailingDetailAddress;
      // 這裡僅為範例，實際情況可能需要更複雜的解析邏輯
      if (fullAddress.length > 0) {
        // 簡單地假設，如果 MailAddressDetail 已經有值，且是郵寄方式，
        // 則嘗試從該地址中解析出郵遞區號和鄉鎮市區
        // 實際應用中，你可能需要一個更強健的地址解析或儲存機制
        if (orderFormStore.data.MailingCity === '高雄市' && fullAddress.includes('鳳山區')) {
            selectedDistrict.value = '鳳山區';
            postalCode.value = '830';
        }
        // ... 其他邏輯
      }
  }
});

// 監聽取件方式的變化，清空不相關的地址資訊
const handlePickupMethodChange = (newValue) => {
  if (newValue === 0) { // 選擇郵寄
    orderFormStore.updateField('StoreDetailAddress', null); // 清空門市地址
  } else if (newValue === 1) { // 選擇門市取件
    orderFormStore.updateField('MailingCity', null);
    orderFormStore.updateField('MailingDetailAddress', null);
    selectedDistrict.value = '';
    postalCode.value = '';
  }
};

// 監聽縣市變化時，清空鄉鎮市區和郵遞區號
watch(() => orderFormStore.data.MailingCity, (newCity, oldCity) => {
  if (newCity !== oldCity) {
    selectedDistrict.value = ''; // 清空鄉鎮市區
    postalCode.value = ''; // 清空郵遞區號
    // 這裡可以選擇是否清空 MailingDetailAddress
    // orderFormStore.updateField('MailingDetailAddress', null);
  }
});

// 監聽鄉鎮市區的變化，並更新郵遞區號
watch(selectedDistrict, (newDistrict) => {
  // 這裡可以根據選擇的縣市和鄉鎮市區發送 API 請求獲取郵遞區號，或從本地資料中查找
  // 目前是模擬數據
  const currentCity = orderFormStore.data.MailingCity;
  if (currentCity === '高雄市' && newDistrict === '鳳山區') {
    postalCode.value = '830';
  } else if (currentCity === '台北市' && newDistrict === '中正區') {
    postalCode.value = '100';
  } else if (currentCity === '台中市' && newDistrict === '西屯區') {
    postalCode.value = '407';
  } else {
    postalCode.value = '';
  }
});

watch([
  () => orderFormStore.data.MailingCity,
  selectedDistrict,
  postalCode,
  () => orderFormStore.data.MailingDetailAddress // 這裡監聽的是 El-input 的 v-model
], ([newCity, newDistrict, newPostalCode, newDetailAddress]) => {
    if (orderFormStore.data.PickupMethodOption === 0) { // 僅在郵寄時組合
        const fullAddress = `<span class="math-inline">\{newPostalCode \|\| ''\}</span>{newCity || ''}<span class="math-inline">\{newDistrict \|\| ''\}</span>{newDetailAddress || ''}`;
        // 這裡需要決定如何將這些部分組合到 MailingDetailAddress 中
        // 由於 MailingDetailAddress 已經綁定到 El-input，可能不需要再組合
        // 如果你的 El-input 只是輸入地址的「後半段」，則需要這樣做
        // 例如：orderFormStore.data.MailingDetailAddress = `${newPostalCode} <span class="math-inline">\{newCity\}</span>{newDistrict} ${newDetailAddress}`;
        // 但如果你的 El-input 的 v-model 已經是 MailingDetailAddress 了，
        // 則你不需要這個 watch 來組合，而是確保用戶直接輸入的內容正確。
    }
}, { immediate: true, deep: true });

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