<!-- 訂單聯絡人 -->
 <template>
  <el-card class="contact-info">
    <template #header>
      <div class="card-header">
        <span>訂單聯絡人</span>
      </div>
    </template>
    <el-form label-width="80px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input placeholder="請輸入" v-model="contactName"></el-input>
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
               v-model="contactEmail"
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
        <el-input placeholder="(例) 0910123456" v-model="contactPhone">
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
import { ref } from 'vue';

const contactName = ref('');
const contactEmail = ref('');
const contactPhone = ref('');
const phonePrefix = ref('+886');

import useVisaRouter from "@/utils/visaRouterHelp";
const visaRouter = useVisaRouter();

const domains = ref(['gmail.com', 'yahoo.com.tw', 'hotmail.com', 'msa.hinet.net', 'icloud.com']);
const suggestions = ref([]);

const querySearch = (queryString, cb) => {
  const results = queryString
    ? domains.value.map(domain => ({ value: `${queryString}${domain}` })).filter(createFilter(queryString))
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

const handleSelect = (item) => {
  contactEmail.value = item.value;
};

</script>

<style scoped>
.contact-info {
  margin: 10px; /* 可以根據你的佈局調整外邊距 */
}

.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.card-header span {
  font-size: 16px;
  font-weight: bold;
}
</style>


