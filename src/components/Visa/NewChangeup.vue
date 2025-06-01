<!-- 證件選單 -->
<template>
  <div class="visa-info-container">
    <h3>
      <el-icon><Avatar /></el-icon>
      <!-- 中華民國護照｜申辦項目|新辦/更換(14歲以上) -->
      {{
        selectedDocumentMenuItem
          ? selectedDocumentMenuItem.rocPassportOption
          : "中華民國護照"
      }}｜{{
        selectedDocumentMenuItem
          ? selectedDocumentMenuItem.applicationType
          : "申辦項目"
      }}
      |
      {{
        selectedDocumentMenuItem
          ? selectedDocumentMenuItem.processingItem
          : "新辦/更換(14歲以上)"
      }}
    </h3>

    <div class="VisaOrderdetails">
      <el-card class="visa-info-card" v-if="loading">
        <p>載入中...</p>
      </el-card>
      <el-card class="visa-info-card" v-else-if="error">
        <p class="error-message">{{ error }}</p>
      </el-card>
      <el-card class="visa-info-card" v-else>
        <el-row
          :gutter="2"
          align="middle"
          v-for="item in allDocumentMenus"
          :key="item.menuId"
        >
          <el-col :span="5">
            <div class="item-title">
              <!-- 新辦/更換(14歲以上) -->
              {{ item.processingItem }}
            </div>
          </el-col>
          <el-col :span="18">
            <el-row>
              <el-card class="item-info-card">
                <el-col :span="16">
                  <!-- 一般件：16個工作天 -->
                  {{ item.caseType === "general" ? "一般件" : "" }}：{{
                    item.processingDays
                  }}
                </el-col>
                <el-col :span="12">
                  <!-- 效期：10年 -->
                  效期：{{ item.documentValidityPeriod }}
                </el-col>
                <el-col
                  :span="30"
                  style="text-align: right"
                  styl="text-align: left;"
                >
                  <el-col :span="24" style="text-align: right">
                    <!-- TWD 1,700 -->
                    {{ item.fee }}
                  </el-col>
                  <el-button
                    type="primary"
                    size="large"
                    @click="handleSelect(item)"
                    >選擇1</el-button
                  >
                </el-col>
              </el-card>
            </el-row>

            <el-row>
              <el-card class="item-info-card">
                <el-col :span="16">超特急件：7個工作天</el-col>
                <el-col :span="12">效期：10年</el-col>
                <el-col
                  :span="30"
                  style="text-align: right"
                  styl="text-align: left;"
                >
                  <el-col :span="24" style="text-align: right"
                    >TWD 2,850</el-col
                  >
                  <el-button type="primary" size="large">選擇2</el-button>
                </el-col>
              </el-card>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { Avatar } from "@element-plus/icons-vue";
import { onMounted } from "vue"; // 確保 onMounted 被導入
import { useDocumentMenuStore } from "@/stores/documentMenuStore"; // 引入 Store
import { storeToRefs } from "pinia"; // 用於解構響應式屬性
import { useRouter } from "vue-router"; // 如果你正在導航到詳細資訊頁面

const documentMenuStore = useDocumentMenuStore();
const router = useRouter();
const documentMenuData = ref({});
const isLoading = ref(true);
const { selectedDocumentMenuItem } = storeToRefs(documentMenuStore); // 確保這裡正確地解構了

// 從 Store 中解構響應式狀態
const { allDocumentMenus, loading, error } = storeToRefs(documentMenuStore);

onMounted(() => {
  // NewChangeup 也可能會觸發抓取，如果資料尚未被 VisaView 載入
  documentMenuStore.fetchAllDocumentMenus();
});

const handleSelect = (item) => {
  documentMenuStore.setSelectedDocumentMenuItem(item); // 在 Store 中設定選定的項目
  // 導航到詳細資訊頁面 (例如 VisainDetail)
  // 如果詳細資訊頁面可以直接存取，你可能希望透過路由參數傳遞 ID。
  router.push({ name: "OrderFormView", params: { id: item.menuId } });
};
</script>

<style scoped>
.visa-info-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  /* 讓每個卡片之間有點間距 */
  padding: 30px;
  /* 讓內容不要太貼邊 */
  background-color: #f9f9f9;
  /* 幫 Footer 加個淺灰色背景 */
}

.visa-info-card {
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-title {
  font-weight: bold;
  /* 讓標題粗體一點 */
}

.item-info-card {
  /* 可以調整卡片的樣式，例如陰影 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 450px;
  margin-bottom: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-info-card .el-col:nth-child(1) {
  width: 40%;
}
.item-info-card .el-col:nth-child(2) {
  width: 30%;
}
.item-info-card .el-col:nth-child(3) {
  width: 30%;
  text-align: right;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
