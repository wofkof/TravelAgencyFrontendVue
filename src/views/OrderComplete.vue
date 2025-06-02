<template>
  <el-container class="order-complete-container">
    <el-main>
      <el-row justify="center">
        <el-col :xs="24" :sm="20" :md="18" :lg="14" :xl="12">
          <el-card class="result-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>訂單狀態</span>
              </div>
            </template>

            <div v-if="isLoading" class="loading-section">
              </div>

            <div v-else-if="internalPaymentStatus === 'success'">
              <el-result
                icon="success"
                :title="internalRtnMsg || '付款成功！您的訂單已確認'"
                sub-title="感謝您的訂購，我們將盡快為您處理。"
              >
                <template #extra>
                  </template>
              </el-result>

              <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="12">
                  <el-divider content-position="left">訂單明細</el-divider>
                  <el-descriptions 
                    :column="1"
                    border 
                    class="order-details"
                  >
                    <el-descriptions-item label="您的訂單號碼">{{ orderId }}</el-descriptions-item>
                    <el-descriptions-item v-if="internalMerchantTradeNo" label="商店交易號碼">{{ internalMerchantTradeNo }}</el-descriptions-item>
                    <el-descriptions-item v-if="internalTradeNo" label="綠界交易編號">{{ internalTradeNo }}</el-descriptions-item>
                    <el-descriptions-item v-if="internalTradeAmt" label="交易金額">
                      NT$ {{ formatAmount(internalTradeAmt) }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="internalPaymentDate" label="付款時間">{{ formattedPaymentDate }}</el-descriptions-item>
                    <el-descriptions-item v-if="internalPaymentTypeDisplay" label="付款方式">{{ internalPaymentTypeDisplay }}</el-descriptions-item>
                    <el-descriptions-item v-if="internalCustomField2" label="聯絡 Email">{{ internalCustomField2 }}</el-descriptions-item>
                    <el-descriptions-item v-if="internalCustomField3" label="聯絡電話">{{ internalCustomField3 }}</el-descriptions-item>
                  </el-descriptions>
                </el-col>

                <el-col :xs="24" :sm="24" :md="12"> 
                  <el-divider content-position="left">發票資訊</el-divider>
                  <div v-if="isFetchingInvoiceDetails" class="loading-section">
                    <el-skeleton :rows="3" animated />
                    <p style="text-align: center; margin-top: 10px;">正在查詢發票資訊...</p>
                  </div>
                  <div v-else-if="fetchInvoiceError" class="error-section" style="margin-top:15px;">
                    <el-alert :title="fetchInvoiceError" type="error" show-icon :closable="false"></el-alert>
                  </div>
                  <el-descriptions
                    v-else-if="invoiceDetails && invoiceDetails.rtnCode === 1"
                    :column="1"
                    border
                    class="invoice-details"
                    style="margin-top:0px;"
                  >
                    <el-descriptions-item v-if="invoiceDetails.invoiceType" label="發票類型">
                      {{ formatInvoiceType(invoiceDetails.invoiceType) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="發票號碼">{{ invoiceDetails.invoiceNo || 'N/A' }}</el-descriptions-item>
                    <el-descriptions-item label="開立日期">{{ invoiceDetails.invoiceDate || 'N/A' }}</el-descriptions-item>
                    <el-descriptions-item label="隨機碼">{{ invoiceDetails.randomNumber || 'N/A' }}</el-descriptions-item>
                    <el-descriptions-item v-if="invoiceDetails.buyerUniformNumber" label="買方統一編號">
                      {{ invoiceDetails.buyerUniformNumber }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="invoiceDetails.buyerName" label="買受人名稱">
                      {{ invoiceDetails.buyerName }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="invoiceDetails.invoiceItemDesc" label="品名摘要">
                      {{ invoiceDetails.invoiceItemDesc }}
                    </el-descriptions-item>
                    <el-descriptions-item
                      v-if="invoiceDetails.totalAmount !== null && invoiceDetails.totalAmount !== undefined"
                      label="發票金額"
                    >
                      NT$ {{ formatAmount(invoiceDetails.totalAmount) }}
                    </el-descriptions-item>
                    <!-- <el-descriptions-item v-if="invoiceDetails.note" label="備註">
                      {{ invoiceDetails.note }}
                    </el-descriptions-item> -->
                    <el-descriptions-item label="查詢狀態">
                      {{ invoiceDetails.rtnMsg || '發票資訊已載入' }}
                    </el-descriptions-item>
                  </el-descriptions>
                  <div v-else-if="invoiceDetails && invoiceDetails.rtnMsg" style="margin-top: 15px;">
                    <el-alert :title="invoiceDetails.rtnMsg" type="info" show-icon :closable="false"></el-alert>
                  </div>
                  <div v-else style="text-align: center; color: #909399; margin-top: 15px; padding: 10px 0;">
                    未能載入發票資訊。
                  </div>
                </el-col>
              </el-row>

            </div>

            <div v-else>
              </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import api from '@/utils/api'; // 重新引入 api instance
import { useAuthStore } from '@/stores/authStore';
export default {
  name: 'OrderCompletePage',
  props: ['orderId'],
  data() {
    return {
      isLoading: true,
      internalPaymentStatus: null,
      internalRtnCode: null,
      internalRtnMsg: null,
      internalTradeNo: null,
      internalMerchantTradeNo: null,
      internalPaymentDate: null,
      internalTradeAmt: null,
      internalPaymentTypeChargeFee: null,
      internalCustomField2: null,
      internalCustomField3: null,
      rawPaymentType: null,

      // 新增用於發票資訊的 data 屬性
      invoiceDetails: null,
      isFetchingInvoiceDetails: false,
      fetchInvoiceError: null,
    };
  },
  computed: {
    // 【新增】從 Pinia store 獲取 memberId
    memberIdFromAuth() {
      const authStore = useAuthStore(); // 在 computed 內部獲取 store 實例
      return authStore.memberId;
    },
    // 【新增】從 Pinia store 獲取登入狀態
    isUserLoggedIn() {
      const authStore = useAuthStore();
      return authStore.isLoggedIn;
    },
    formattedPaymentDate() {
      if (this.internalPaymentDate && typeof this.internalPaymentDate === 'string') {
        return this.internalPaymentDate.replace('T', ' ');
      }
      return this.internalPaymentDate;
    },
    internalPaymentTypeDisplay() {
      if (this.rawPaymentType) {
        if (this.rawPaymentType.toLowerCase().startsWith('credit')) {
          return '信用卡';
        }
        return this.rawPaymentType.replace(/_/g, ' ');
      }
      return null;
    }
  },
  created() {
    this.processPaymentResultAndCleanUrl();
  },
  methods: {
    async processPaymentResultAndCleanUrl() {
      const queryParams = { ...this.$route.query };
      console.log('Received query params for ECPay:', JSON.parse(JSON.stringify(queryParams)));

      this.internalPaymentStatus = queryParams.status;
      this.internalRtnCode = queryParams.rtnCode;

      const rawRtnMsg = queryParams.rtnMsg; // 獲取原始的 rtnMsg
      if (rawRtnMsg === 'Succeeded') {
        this.internalRtnMsg = '成功!'; // 如果是 "Succeeded"，替換為 "成功!"
      } else {
        this.internalRtnMsg = rawRtnMsg; // 否則，使用原始的訊息
      }

      this.internalTradeNo = queryParams.tradeNo;
      this.internalMerchantTradeNo = queryParams.merchantTradeNo;
      this.internalPaymentDate = queryParams.paymentDate;
      this.internalTradeAmt = queryParams.tradeAmt;
      // this.internalCustomField1 = queryParams.customField1;
      this.internalCustomField2 = queryParams.customField2;
      this.internalCustomField3 = queryParams.customField3?.trim();
      this.rawPaymentType = queryParams.paymentType || null;

      this.isLoading = false; // ECPay 結果處理完畢

      console.log(
        'Value of this.internalCustomField1 (OrderId) before invoice fetch check:',
        this.internalCustomField1,
        typeof this.internalCustomField1
      );

      // 如果付款成功，則查詢發票資訊
      if (this.internalPaymentStatus === 'success' && this.orderId) {
        // 【修改】👇 使用計算屬性 this.memberIdFromAuth
        if (this.isUserLoggedIn && this.memberIdFromAuth) {
          console.log('Using memberId from Pinia store:', this.memberIdFromAuth);
          await this.fetchInvoiceDetails(this.orderId, this.memberIdFromAuth);
        } else {
          console.error('Member ID is missing from Pinia store or user not logged in, cannot fetch invoice details.');
          this.fetchInvoiceError = '無法獲取用戶會員資訊，無法查詢發票。請確認您已登入。';
        }
      }

      // 清理 URL query 參數
      if (Object.keys(queryParams).length > 0) {
        this.$nextTick(() => {
          this.$router.replace({ path: this.$route.path, query: {} }).catch(err => {
            if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
              console.error('Router replace error:', err);
            }
          });
        });
      }
    },
    async fetchInvoiceDetails(orderId, memberIdForApi) {
      if (!orderId) {
        console.error('Order ID is missing for fetchInvoiceDetails.');
        this.fetchInvoiceError = '訂單ID遺失，無法查詢發票。';
        return;
      }
      if (!memberIdForApi) {
        console.error('Member ID for API call is missing for fetchInvoiceDetails.');
        this.fetchInvoiceError = '會員ID遺失，無法查詢發票。';
        return;
      }

      this.isFetchingInvoiceDetails = true;
      this.fetchInvoiceError = null;
      this.invoiceDetails = null; 
      try {
        const response = await api.get(`/Order/${orderId}/invoice`, {
          params: {
            memberId: memberIdForApi
          }        
        });
        console.log('Invoice Details API Response:', response); // 調試用

        if (response.data) {
          this.invoiceDetails = response.data;
          // 根據後端回傳的 rtnCode 判斷是否真的成功獲取到發票資訊
          if (response.data.rtnCode !== 1 && response.data.rtnMsg) { // 假設 rtnCode = 1 代表成功
            // 如果 rtnCode 不是成功碼，但有 rtnMsg，可以將其視為一種提示而非硬錯誤
            console.warn('Invoice query status message:', response.data.rtnMsg);
            // this.fetchInvoiceError = response.data.rtnMsg; // 或者只顯示在 invoiceDetails.rtnMsg 中
          } else if (response.data.rtnCode !== 1) {
            this.fetchInvoiceError = '查詢發票資訊時返回非預期狀態。';
          }
        } else {
          this.fetchInvoiceError = '未能獲取到有效的發票資訊（回應無數據）。';
        }
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        this.orderItems = []; // 雖然這裡是發票，但保持錯誤時清空相關數據的習慣
        if (error.response) {
          console.error('Error response data (invoice):', error.response.data);
          console.error('Error response status (invoice):', error.response.status);
          if (error.response.status === 401) {
            this.fetchInvoiceError = '您的身份驗證已過期或無效，請嘗試重新登入後查詢發票。 (401)';
          } else if (error.response.status === 400) {
            this.fetchInvoiceError = `請求參數錯誤，無法載入訂單發票 (${error.response.data?.message || error.response.data || 'Bad Request'})。 (400)`;
          } else if (error.response.status === 404) {
            this.fetchInvoiceError = '找不到指定的訂單發票資料。 (404)';
          } else {
            this.fetchInvoiceError = typeof error.response.data === 'string'
              ? error.response.data
              : (error.response.data?.message || error.response.data?.title || `載入訂單發票失敗 (${error.response.status})。`);
          }
        } else {
          this.fetchInvoiceError = '查詢發票資訊失敗，請檢查網路連線或聯繫客服。';
        }
      } finally {
        this.isFetchingInvoiceDetails = false;
      }
    },

    formatAmount(amount) {
      if (amount === null || amount === undefined || isNaN(Number(amount))) return '';
      return Number(amount).toLocaleString('zh-TW');
    },

    formatInvoiceType(typeString) {
      if (!typeString) return 'N/A';
      // 假設後端 InvoiceType.ToString() 返回的是 Enum 的成員名稱
      switch (typeString.toLowerCase()) {
        case 'triplet':
          return '三聯式發票';
        case 'electronicinvoice':
          return '電子發票 (個人)';
        // case 'donation':
        //   return '捐贈發票';
        default:
          return typeString; // 如果無法識別，直接顯示原始字串
      }
    },
  },
};
</script>

<style scoped>
/* 您現有的樣式 */
.order-complete-container {
  padding-top: 10px;
  padding-bottom: 30px;
  background-color: #f4f6f8;
  min-height: calc(100vh - 80px);
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
.order-details, .invoice-details { /* 將 invoice-details 加入 */
  margin-top: 25px;
  font-size: 0.95em;
}
.el-descriptions :deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  min-width: 100px;
  text-align: right;
  padding-right: 10px;
}
.el-descriptions :deep(.el-descriptions__content) {
  color: #303133;
}
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
.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 15px;
}

@media (max-width: 768px) {
  .el-main { padding: 20px 15px; }
  .card-header { font-size: 1.4em; }
  .el-descriptions :deep(.el-descriptions__label) { min-width: 90px; }
}
@media (max-width: 576px) {
  .button-group { flex-direction: column; align-items: stretch; }
  .button-group .el-button { width: 100%; margin-left: 0 !important; }
  .order-details, .invoice-details { font-size: 0.9em; }
}
</style>