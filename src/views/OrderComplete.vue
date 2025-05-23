<template>
  <el-container class="order-complete-container"> <el-main>
      <el-row justify="center">
        <el-col :xs="24" :sm="20" :md="18" :lg="14" :xl="12">
          <el-card class="result-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>訂單完成狀態</span> </div>
            </template>

            <div v-if="isLoading" class="loading-section">
              <el-skeleton :rows="6" animated />
              <p style="text-align: center; margin-top: 20px;">正在取得訂單結果，請稍候...</p>
            </div>

            <div v-else-if="internalPaymentStatus === 'success'">
              <el-result
                icon="success"
                :title="internalRtnMsg || '付款成功！您的訂單已確認'" sub-title="感謝您的訂購，我們將盡快為您處理。"
              >
                <template #extra>
                  <div class="button-group"> 
                    <el-button type="primary" @click="$router.push('/')" icon="HomeFilled">返回首頁</el-button>
                    <el-button type="info" @click="$router.push('/member/orders')" icon="List">查看我的所有訂單</el-button> 
                  </div>
                </template>
              </el-result>

              <el-divider content-position="left">訂單摘要</el-divider>
              <el-descriptions :column="{ xs: 1, sm: 1, md: 2 }" border class="order-details">
                <el-descriptions-item label="您的訂單號碼">{{ orderId }}</el-descriptions-item>
                <el-descriptions-item v-if="internalMerchantTradeNo" label="商店交易號碼">{{ internalMerchantTradeNo }}</el-descriptions-item>
                <el-descriptions-item label="綠界交易編號">{{ internalTradeNo }}</el-descriptions-item>
                <el-descriptions-item v-if="internalTradeAmt" label="交易金額">
                  NT$ {{ formatAmount(internalTradeAmt) }}
                </el-descriptions-item>
                <!-- <el-descriptions-item v-if="internalPaymentTypeChargeFee" label="交易手續費">
                  NT$ {{ formatAmount(internalPaymentTypeChargeFee) }}
                </el-descriptions-item> -->
                <el-descriptions-item v-if="internalPaymentDate" label="付款時間">{{ internalPaymentDate }}</el-descriptions-item>
                <el-descriptions-item v-if="internalPaymentTypeDisplay" label="付款方式">{{ internalPaymentTypeDisplay }}</el-descriptions-item>
                <el-descriptions-item v-if="internalCustomField2" label="聯絡 Email">{{ internalCustomField2 }}</el-descriptions-item>
                <el-descriptions-item v-if="internalCustomField3" label="聯絡電話">{{ internalCustomField3 }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <div v-else>
              <el-result
                icon="error"
                title="訂單處理失敗或付款異常" :sub-title="internalRtnMsg || '無法完成訂單處理，請確認訂單狀態或聯繫客服。'"
              >
                <template #extra>
                  <p v-if="orderId">您的訂單號碼：{{ orderId }}</p>
                  <el-button type="primary" @click="$router.push('/')" icon="HomeFilled">返回首頁</el-button>
                </template>
              </el-result>
               <el-descriptions v-if="orderId || internalMerchantTradeNo || internalTradeNo" :column="1" border class="order-details" style="margin-top: 20px;">
                <el-descriptions-item v-if="orderId" label="您的訂單號碼">{{ orderId }}</el-descriptions-item>
                <el-descriptions-item v-if="internalMerchantTradeNo" label="商店交易號碼">{{ internalMerchantTradeNo }}</el-descriptions-item>
                <el-descriptions-item v-if="internalTradeNo" label="綠界交易編號">{{ internalTradeNo }}</el-descriptions-item>
                <!-- <el-descriptions-item v-if="internalRtnCode" label="結果代碼">{{ internalRtnCode }}</el-descriptions-item> -->
              </el-descriptions>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'OrderCompletePage', // <--- 修改組件名稱
  props: ['orderId'], // 接收來自路由的 orderId
  data() {
    return {
      isLoading: true,
      internalPaymentStatus: null,
      internalRtnCode: null,
      internalRtnMsg: null,
      internalTradeNo: null,
      internalMerchantTradeNo: null,
      internalPaymentDate: null,
      internalPaymentTypeDisplay: null,
      internalTradeAmt: null,
      internalPaymentTypeChargeFee: null,
      internalCustomField2: null,
      internalCustomField3: null,
    };
  },
  created() {
    this.processPaymentResultAndCleanUrl();
  },
  methods: {
    processPaymentResultAndCleanUrl() {
      const queryParams = { ...this.$route.query };

      this.internalPaymentStatus = queryParams.status;
      this.internalRtnCode = queryParams.RtnCode;
      this.internalRtnMsg = queryParams.RtnMsg;
      this.internalTradeNo = queryParams.TradeNo;
      this.internalMerchantTradeNo = queryParams.MerchantTradeNo;
      this.internalPaymentDate = queryParams.PaymentDate;
      this.internalTradeAmt = queryParams.TradeAmt;
      this.internalPaymentTypeChargeFee = queryParams.PaymentTypeChargeFee;
      this.internalCustomField2 = queryParams.CustomField2;
      this.internalCustomField3 = queryParams.CustomField3?.trim();

      if (queryParams.PaymentType) {
        // 判斷 PaymentType 是否為信用卡相關類型
        if (queryParams.PaymentType.toLowerCase().startsWith('credit')) {
          this.internalPaymentTypeDisplay = '信用卡';
        } else {
          // 如果是其他付款方式，您可以保留原本的邏輯，或為其他方式做特定處理
          this.internalPaymentTypeDisplay = queryParams.PaymentType.replace(/_/g, ' ');
        }
      }

      this.isLoading = false;

      if (Object.keys(queryParams).length > 0) {
        this.$nextTick(() => {
          // 使用 this.$route.path 來確保是當前匹配到的路徑
          this.$router.replace({ path: this.$route.path, query: {} }).catch(err => {
            if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
              console.error('Router replace error:', err);
            }
          });
        });
      }
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined || isNaN(Number(amount))) return '';
      return Number(amount).toLocaleString('zh-TW');
    },
  },
};
</script>

<style scoped>

.order-complete-container {
  padding-top: 10px;
  padding-bottom: 30px;
  background-color: #f4f6f8;
  min-height: calc(100vh - 80px); /* 假設 Navbar 高度為 80px */
  box-sizing: border-box;
  margin-top: -130px;
}

.result-card {
  width: 100%;
  border-radius: 8px;
}

.card-header {
  text-align: center;
  font-size: 1.6em;
  font-weight: 600;
  color: #303133;
}

.loading-section {
  padding: 30px 20px;
  text-align: center;
}

.order-details {
  margin-top: 25px;
  font-size: 0.95em;
}

/* 訂單摘要項目樣式 */
.el-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  min-width: 100px; /* 調整標籤最小寬度 */
  text-align: right;
  padding-right: 10px;
}
.el-descriptions :deep(.el-descriptions__content) {
  color: #303133;
}
.el-descriptions :deep(.el-descriptions-item__container) {
  align-items: center; /* 內容垂直居中 (可選) */
}

/* el-result 樣式微調 */
.el-result {
  padding-top: 20px;
  padding-bottom: 10px;
}

.el-result :deep(.el-result__title p) {
  font-size: 1.8em;
  font-weight: 600;
}
.el-result :deep(.el-result__subtitle p) {
  font-size: 1em;
  color: #909399;
}

/* 按鈕組樣式 */
.button-group {
  display: flex;
  flex-wrap: wrap; /* 允許按鈕換行 */
  justify-content: center; /* 水平居中 */
  gap: 10px; /* 按鈕之間的間距 */
  margin-top: 15px; /* 與上方 el-result sub-title 的間距 */
  margin-bottom: 15px; /* 與下方 el-divider 的間距 */
}

/* 響應式調整 */
@media (max-width: 768px) { /* md 及以下斷點 */
  .el-main {
    padding: 20px 15px;
  }
  .card-header {
    font-size: 1.4em;
  }
  .el-descriptions :deep(.el-descriptions__label) {
    min-width: 90px; /* 在小螢幕上稍微減小標籤寬度 */
  }
}

@media (max-width: 576px) { /* sm 及以下斷點 (手機) */
  .button-group {
    flex-direction: column; /* 按鈕垂直堆疊 */
    align-items: stretch; /* 按鈕寬度撐滿 (可選) */
  }
  .button-group .el-button {
    width: 100%; /* 按鈕寬度100% (如果 align-items: stretch) */
    margin-left: 0 !important; /* 移除 Element Plus 可能的預設 margin */
  }
  .order-details {
    font-size: 0.9em; /* 在手機上稍微縮小字體 */
  }
}
</style>