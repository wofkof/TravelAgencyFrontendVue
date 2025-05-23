<template>
  <div class="order-payment-result">
    <h1>訂單支付結果</h1>
    <div v-if="isLoading">
      <p>正在查詢訂單狀態，請稍候...</p>
    </div>
    <div v-else-if="internalPaymentStatus === 'success'">
      <h2>付款成功！</h2>
      <p>您的訂單編號：{{ orderId }}</p>
      <p>交易編號：{{ internalTradeNo }}</p>
      </div>
    <div v-else>
      <p>無法識別的訂單狀態或處理中。</p>
      <p>訂單編號：{{ orderId }}</p>
    </div>
    <router-link to="/">返回首頁</router-link>
  </div>
</template>

<script>
export default {
  name: 'OrderPaymentResultPage',
  props: ['orderId'],
  data() {
    return {
      isLoading: true,
      internalPaymentStatus: null,
      internalTradeNo: null,
      internalPaymentType: null,
      internalRtnCode: null,
      internalRtnMsg: null,
    };
  },
  created() {
    this.processPaymentResultAndCleanUrl();
  },
  methods: {
    processPaymentResultAndCleanUrl() {
      const queryParams = { ...this.$route.query }; // 複製一份查詢參數

      this.internalPaymentStatus = queryParams.status;
      this.internalTradeNo = queryParams.tradeNo;
      this.internalPaymentType = queryParams.paymentType;
      this.internalRtnCode = queryParams.rtnCode;
      this.internalRtnMsg = queryParams.rtnMsg;

      this.isLoading = false;

      // 清理 URL 中的查詢參數
      // 使用 $router.replace 使其不產生瀏覽歷史記錄
      if (Object.keys(queryParams).length > 0) {
        console.log('Attempting to replace URL. Current path:', this.$route.path, 'Current query:', this.$route.query);
        this.$nextTick(() => {
          this.$router.replace({ path: this.$route.path, query: {} }).catch(err => {
            if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
              console.error('Router replace error:', err);
            }
          });
        });
      }
    }
  },
};
</script>