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
        <el-col :span="12">
          <el-form-item label="e-mail">
            <el-input placeholder="請輸入" v-model="contactEmail"></el-input>
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


