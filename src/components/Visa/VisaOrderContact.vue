<!-- 訂單聯絡人 -->
 <template>
  <el-card class="contact-info">
    <h2 class="title">訂單聯絡人</h2>
    <el-form label-width="80px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input placeholder="請輸入"
             v-model="orderFormStore.data.ContactPersonName">
            </el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="e-mail">
            <el-input placeholder="請輸入" v-model="contactEmail"></el-input>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="e-mail">
            <el-autocomplete
               v-model="orderFormStore.data.ContactPersonEmail"
               :fetch-suggestions="querySearch"
               placeholder="請輸入 e-mail"
               @select="handleSelect">
               <template #suffix>
               <span>@</span>
               </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="手機">
        <el-input placeholder="(例) 0910123456" v-model="orderFormStore.data.ContactPersonPhoneNumber">

          <template #prepend>
            <el-select v-model="phonePrefix" placeholder="+886" style="width: 120px">
              <el-option label="+886" value="+886"></el-option>
              </el-select>
          </template>
        </el-input>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'; // 引入 watch 和 onMounted
import { useOrderFormStore } from '@/stores/orderForm';
import useVisaRouter from "@/utils/visaRouterHelp";

const orderFormStore = useOrderFormStore();
// const contactName = ref('');這些不再需要，直接綁定到 store
// const contactEmail = ref('');這些不再需要，直接綁定到 store
// const contactPhone = ref('');這些不再需要，直接綁定到 store
const phonePrefix = ref('+886');// 手機前綴，這個可以維持本地 ref
const visaRouter = useVisaRouter();

// Email autocomplete 邏輯
const domains = ref(['gmail.com', 'yahoo.com.tw', 'hotmail.com', 'msa.hinet.net', 'icloud.com']);
const suggestions = ref([]); // 此變數似乎未直接使用，可以移除或用於內部除錯

const querySearch = (queryString, cb) => {
  const results = queryString
    ? domains.value
        .filter(domain => domain.toLowerCase().includes(queryString.toLowerCase())) // 過濾出匹配的網域
        .map(domain => ({ value: `${queryString}@${domain}` })) // 組合為建議值
    : [];
  cb(results);
};

const createFilter = (queryString) => {
  return (suggestion) => {
    const parts = contactEmail.value.split('@');
    if (parts.length > 1) {
      return suggestion.value.toLowerCase().includes(parts[0].toLowerCase() + '@' + queryString.toLowerCase());
    } else {
      return suggestion.value.toLowerCase().includes(queryString.toLowerCase());
    }
  };
};

// 由於 El-autocomplete 直接綁定到 store.data.ContactPersonEmail
// handleSelect 會直接更新 store 的值，不需要額外處理
const handleSelect = (item) => {
  // item.value 已經是完整的 email，直接賦值給 store 的屬性
  orderFormStore.data.ContactPersonEmail = item.value;
};

</script>

<style scoped>
.contact-info {
  max-width: 1400px;/* 區塊的最大寬度 */
  margin: 0 auto;  /* 頁面中水平置中 */
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

.el-form-item {
  margin-bottom: 22px;
}

/* 針對 el-autocomplete 的 suffix 樣式調整 */
.el-autocomplete :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
    padding-right: 10px; /* 調整 suffix 內邊距 */
    color: #909399; /* 顏色 */
}
</style>


