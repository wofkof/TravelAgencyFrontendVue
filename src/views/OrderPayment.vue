<template>
  <div class="payment-page container mx-auto p-4">
    <div v-if="isLoading" class="loading-container status-container">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else-if="loadError" class="status-container error-container">
      <el-alert title="載入付款資訊時發生錯誤" :description="loadError" type="error" show-icon :closable="false" center />
      <div class="status-actions mt-4">
        <el-button type="primary" @click="loadInitialData" :icon="RefreshRight">重試</el-button>
        <router-link :to="{ name: 'OrderForm', query: { orderId: orderIdFromRoute } }">
          <el-button :icon="ArrowLeft">返回訂單明細</el-button>
        </router-link>
      </div>
    </div>
    <div v-else-if="!orderIdFromRoute" class="status-container error-container">
        <el-alert title="無效的訂單" description="缺少訂單ID，無法處理付款。" type="error" show-icon :closable="false" center />
         <div class="status-actions mt-4">
            <router-link to="/ShoppingCart">
                <el-button :icon="ShoppingCart">回到購物車</el-button>
            </router-link>
        </div>
    </div>

    <div v-else class="payment-content-wrapper">
      <h1 class="page-main-title text-2xl font-semibold mb-6">訂單付款設定</h1>

      <div class="content-panel">
        <OrderItemsSummary
          v-if="!isLoading && !loadError && orderIdFromRoute"
          :order-number="mtnFromRoute"
          :items="currentOrderItems"
          :participants="orderParticipants"
          :total-amount="orderTotalAmount"
          :payment-deadline="expiresAtFromRoute"
          :order-status="currentOrderStatus"
        />
      </div>

      <form @submit.prevent="handleFinalizePayment" ref="paymentPageFormRef">
        <div class="content-panel">
          <el-collapse v-model="activePaymentCollapseNames" class="order-collapse">
            <AccordionSection
              title="付款方式"
              section-name="payment"
              class="section-card section-payment"
            >
              <PaymentOptions
                v-model="paymentFormData.paymentMethod"
                v-model:creditCardInfo="paymentFormData.creditCardDetails"
                ref="paymentOptionsRef"
              />
            </AccordionSection>

            <AccordionSection
              title="電子發票 / 收據"
              section-name="einvoice"
              :is-disabled="!isPaymentMethodSelectedForEinvoice"
              :tooltip-disabled="isPaymentMethodSelectedForEinvoice ? '' : '請先選擇付款方式'"
              class="section-card section-einvoice"
            >
              <EInvoiceForm v-model="paymentFormData.eInvoiceInfo" ref="einvoiceFormRef" />
            </AccordionSection>
          </el-collapse>
        </div>

        <div class="action-buttons-section">
          <div class="buttons-row">
            <el-button
              size="large"
              class="back-btn"
              @click="goBackToOrderDetails"
              :icon="ArrowLeft"
              :disabled="isSubmitting"
            >
              返回修改訂單明細
            </el-button>
            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="isSubmitting"
              :disabled="isSubmitButtonDisabled || orderExpired"
              @click="handleFinalizePayment"
            >
              確認付款並送出訂單
            </el-button>
          </div>
          <p v-if="orderExpired && !isSubmitting" class="expired-text">
            此訂單已超過付款期限，請返回修改或重新下單。
          </p>
        </div>
      </form>

      <el-alert v-if="submitError" :title="submitErrorTitle" :description="submitErrorMessage" type="error" show-icon class="mt-6 global-alert" @close="clearSubmitError" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { finalizeOrderPayment, getOrderDetails } from '@/utils/orderapi';
import { useCartStore } from '@/stores/ShoppingCart';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'; // 引入 ElLoading
import { ArrowLeft, ShoppingCart, RefreshRight } from '@element-plus/icons-vue';

// 子元件
import AccordionSection from '@/components/OrderForm/AccordionSection.vue';
import PaymentOptions from '@/components/OrderForm/PaymentOptions.vue';
import EInvoiceForm from '@/components/OrderForm/EInvoiceForm.vue';
// import CostSummary from '@/components/OrderForm/CostSummary.vue'; // 不再使用 CostSummary
import OrderItemsSummary from '@/components/OrderForm/OrderItemsSummary.vue'; // << 新增引入

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const isLoading = ref(true); // 初始設為 true
const loadError = ref(null);
const isSubmitting = ref(false);
const submitErrorTitle = ref('');
const submitErrorMessage = ref('');
const orderExpired = ref(false);
const submitError = ref(false); // 已修正 Vue 警告，確保定義

const paymentPageFormRef = ref(null);
const paymentOptionsRef = ref(null);
const einvoiceFormRef = ref(null);

const activePaymentCollapseNames = ref(['payment', 'einvoice']);

const orderIdFromRoute = computed(() => route.query.orderId ? parseInt(route.query.orderId) : null);
const mtnFromRoute = computed(() => route.query.mtn || null);
const expiresAtFromRoute = computed(() => route.query.exp || null);

// --- 新增用於 OrderItemsSummary 的響應式數據 ---
const orderItemCount = ref(0);
const currentOrderItems = ref([]);
const orderParticipants = ref([]); // << 新增：儲存參與人列表
const currentOrderStatus = ref(''); // << 新增：儲存訂單狀態
const orderTotalAmount = ref(0);
// ---------------------------------------------

const currentParticipantsStatusMessage = ref('旅客資料已確認'); // 這個 prop 原本是給 CostSummary 的，可以考慮是否仍需

const paymentFormData = reactive({
  paymentMethod: null,
  creditCardDetails: { /* ... */ },
  eInvoiceInfo: {
    type: 'personal',
    deliveryEmail: '',
    taxId: '',
    companyTitle: '',
    addBillingAddress: false,
    billingAddress: '',
  },
});

const remainingSeconds = computed(() => {
  if (!expiresAtFromRoute.value || orderExpired.value) {
    return 0;
  }
  const expiryTime = new Date(expiresAtFromRoute.value).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
  if (diff === 0 && !orderExpired.value) {
    nextTick(() => {
        if(!orderExpired.value) {
            handleCountdownFinish();
        }
    });
  }
  return diff;
});

const scrollToPaymentSection = () => {
    const sectionElement = document.querySelector('[data-section-name="payment"]');
    if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!activePaymentCollapseNames.value.includes('payment')) {
            activePaymentCollapseNames.value.push('payment');
        }
    }
};
// const scrollToItemsSectionInPaymentPage = () => { // 這個 prop 原本是給 CostSummary 的，在新佈局下可能不需要
//     ElMessage.info('訂單商品明細已在頁面頂部展示。');
// };

const isPaymentMethodSelectedForEinvoice = computed(() => !!paymentFormData.paymentMethod);

const isSubmitButtonDisabled = computed(() => {
    if (orderExpired.value) return true;
    if (!paymentFormData.paymentMethod) return true;
    return false;
});

const clearSubmitError = () => {
    submitErrorTitle.value = '';
    submitErrorMessage.value = '';
    submitError.value = false;
}

const loadInitialData = async () => {
    if (!orderIdFromRoute.value) {
        loadError.value = "無效的訂單資訊。";
        ElMessage.error("無效的訂單 ID。");
        isLoading.value = false; // 確保在出錯時也停止 loading
        return;
    }
    isLoading.value = true;
    loadError.value = null;
    let loadingInstance = ElLoading.service({ text: '正在載入訂單資訊...', background: 'rgba(255,255,255,0.7)' });

    try {
        const memberId = localStorage.getItem('memberId');
        if (!memberId) {
            throw new Error("無法獲取會員資訊，請重新登入。");
        }

        const response = await getOrderDetails(orderIdFromRoute.value, parseInt(memberId));
        if (response && response.data) {
            orderTotalAmount.value = response.data.totalAmount;
            const emailFromApi = response.data.ordererEmail; // 注意：後端 GetOrderById 回傳的 OrderDto 中的訂購人Email欄位名稱可能是 ordererEmail
            const emailFromRouteQuery = route.query.ordererEmail;

            if (paymentFormData.eInvoiceInfo) {
              if (emailFromApi) {
                  paymentFormData.eInvoiceInfo.deliveryEmail = emailFromApi;
              } else if (emailFromRouteQuery && !paymentFormData.eInvoiceInfo.deliveryEmail) {
                  paymentFormData.eInvoiceInfo.deliveryEmail = emailFromRouteQuery;
              }
            } else {
                // ... (原有錯誤處理) ...
            }

            currentOrderItems.value = response.data.orderDetails || [];
            orderItemCount.value = currentOrderItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
            orderParticipants.value = response.data.participants || []; // << 賦值參與人列表
            currentOrderStatus.value = response.data.orderStatus; // << 賦值訂單狀態

            if (response.data.orderStatus !== 'Awaiting') {
                orderExpired.value = true;
                ElMessage.warning(`訂單 (狀態: ${response.data.orderStatus}) 已處理或已過期，無法繼續付款。`);
            } else if (expiresAtFromRoute.value && new Date(expiresAtFromRoute.value) < new Date()) {
                if (!orderExpired.value) {
                    handleCountdownFinish();
                }
            }
        } else {
            throw new Error("無法獲取訂單詳細資訊。");
        }
    } catch (err) {
        console.error("載入付款頁面初始資料失敗:", err);
        loadError.value = err.message || "載入訂單資料時發生錯誤。";
        ElMessage.error(loadError.value);
    } finally {
        isLoading.value = false;
        if (loadingInstance) loadingInstance.close();
    }
};

onMounted(() => {
  const ordererEmailFromRouteQuery = route.query.ordererEmail;
  if (ordererEmailFromRouteQuery && paymentFormData.eInvoiceInfo && !paymentFormData.eInvoiceInfo.deliveryEmail) {
      paymentFormData.eInvoiceInfo.deliveryEmail = ordererEmailFromRouteQuery;
  }
  loadInitialData();
  const initialRemaining = remainingSeconds.value;
  // console.log("Initial remaining seconds (for background expiry check):", initialRemaining);
});

const handleCountdownFinish = () => {
  if (!orderExpired.value) {
    orderExpired.value = true;
    ElMessageBox.alert('此訂單的付款時間已過期，請返回訂單明細頁面確認或重新下單。', '訂單已過期', {
      confirmButtonText: '我知道了',
      type: 'warning',
    });
  }
};

const goBackToOrderDetails = () => {
  if (orderIdFromRoute.value) {
    router.push({ name: 'OrderForm', query: { orderId: orderIdFromRoute.value } });
  } else {
    router.push({ name: 'ShoppingCart' });
  }
};

const handleFinalizePayment = async () => {
  // ... (您現有的 handleFinalizePayment 邏輯，包含 isSubmitting, isFormValid, finalPayload 構建和 API 呼叫)
  // 確保 finalPayload.memberId 的獲取和驗證正確
  if (orderExpired.value) {
      ElMessage.error("訂單已過期，無法提交。");
      return;
  }
  if (isSubmitButtonDisabled.value || isSubmitting.value) return;

  isSubmitting.value = true;
  clearSubmitError();
  let isFormValid = true;

  if (!paymentFormData.paymentMethod) {
    ElMessage.error("請選擇付款方式。");
    isFormValid = false;
  }
  // ... (其他表單驗證) ...
  if (einvoiceFormRef.value && einvoiceFormRef.value.validate) {
    const einvoiceValid = await einvoiceFormRef.value.validate();
    if (!einvoiceValid) {
      isFormValid = false;
    }
  } else if (!einvoiceFormRef.value && activePaymentCollapseNames.value.includes('einvoice')) {
      console.warn("EInvoiceForm 引用不存在，但區塊已展開，可能未驗證。");
  }


  if (!isFormValid) {
    isSubmitting.value = false;
    return;
  }

  const memberIdString = localStorage.getItem('memberId');
  if (!memberIdString) {
      ElMessage.error("無法從 localStorage 獲取會員ID。");
      isSubmitting.value = false;
      return;
  }
  const memberId = parseInt(memberIdString, 10);
  if (isNaN(memberId) || memberId <= 0) {
      ElMessage.error("localStorage 中的會員ID無效。");
      isSubmitting.value = false;
      return;
  }

  let backendPaymentMethodValue;
  switch (paymentFormData.paymentMethod) {
    case 'ECPay_CreditCard': backendPaymentMethodValue = 0; break;
    case 'LINEPay': backendPaymentMethodValue = 1; break;
    default:
      ElMessage.error(`未知的付款方式: ${paymentFormData.paymentMethod}`);
      isSubmitting.value = false;
      return;
  }

  const finalPayload = {
    memberId: memberId,
    selectedPaymentMethod: backendPaymentMethodValue,
    invoiceRequestInfo: {
      InvoiceOption: paymentFormData.eInvoiceInfo.type === 'company' ? 1 : 0,
      InvoiceDeliveryEmail: paymentFormData.eInvoiceInfo.deliveryEmail,
      InvoiceUniformNumber: paymentFormData.eInvoiceInfo.type === 'company' ? paymentFormData.eInvoiceInfo.taxId : null,
      InvoiceTitle: paymentFormData.eInvoiceInfo.type === 'company' ? paymentFormData.eInvoiceInfo.companyTitle : null,
      InvoiceAddBillingAddr: paymentFormData.eInvoiceInfo.addBillingAddress || false,
      InvoiceBillingAddress: paymentFormData.eInvoiceInfo.addBillingAddress ? paymentFormData.eInvoiceInfo.billingAddress : null,
    },
  };

  console.log("最終付款 Payload:", JSON.stringify(finalPayload, null, 2));
  let loadingInstance = ElLoading.service({ text: '正在提交付款資訊...', background: 'rgba(255,255,255,0.7)' });

  try {
    const response = await finalizeOrderPayment(orderIdFromRoute.value, finalPayload);
    console.log("Finalize payment API 成功，回應:", response);
    if (response && response.data && response.data.ecPayAioCheckOutUrl && response.data.parameters) {
        // ... (ECPay 導向邏輯)
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.data.ecPayAioCheckOutUrl;
        for (const key in response.data.parameters) {
            if (response.data.parameters.hasOwnProperty(key)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = response.data.parameters[key];
                form.appendChild(input);
            }
        }
        document.body.appendChild(form);
        form.submit();
        successRedirect = true; // 標記成功跳轉
        // 頁面即將跳轉，不需要手動關閉 loadingInstance
        return; // 避免執行 finally 中的 isSubmitting = false
    } else {
        // ... (處理錯誤的邏輯) ...
        console.error('最終付款 API 回應格式不正確，或缺少必要的ECPay參數 (ecPayAioCheckOutUrl, parameters)。實際回應的data:', response ? response.data : 'response is undefined');
        submitErrorTitle.value = '付款處理失敗';
        let errorMessage = '無法獲取有效的付款參數，請稍後再試。';
        if (response && response.data) {
            if (!response.data.ecPayAioCheckOutUrl) {
                errorMessage = '後端回應中缺少 ECPay 轉向網址 (expected ecPayAioCheckOutUrl)。';
            } else if (!response.data.parameters) {
                errorMessage = '後端回應中缺少 ECPay 付款參數 (expected parameters)。';
            }
        }
        submitErrorMessage.value = response?.data?.message || response?.message || errorMessage;
        ElMessage.error(submitErrorMessage.value);
        submitError.value = true;
    }
  } catch (err) {
    // ... (處理錯誤的邏輯) ...
    console.error("最終付款過程中發生錯誤:", err);
    submitErrorTitle.value = '提交付款失敗';
    if (err.response) {
        const errorData = err.response.data;
        if (errorData && errorData.errors) {
            let messages = [];
            for (const key in errorData.errors) {
               messages = messages.concat(errorData.errors[key]);
            }
            submitErrorMessage.value = messages.join('; ') || '伺服器返回驗證錯誤。';
        } else {
            submitErrorMessage.value = errorData?.message || errorData?.title || '伺服器返回錯誤。';
        }
    } else if (err.request) {
        submitErrorMessage.value = '無法連接到伺服器，請檢查網路。';
    } else {
        submitErrorMessage.value = err.message || '發生未知錯誤。';
    }
    ElMessage.error(`${submitErrorTitle.value}: ${submitErrorMessage.value}`);
    submitError.value = true;
  } finally {
    if (loadingInstance && !successRedirect) loadingInstance.close(); // 只有在沒有成功跳轉時才關閉
    if (!successRedirect) isSubmitting.value = false; // 只有在沒有成功跳轉時才重置
  }
};


watch(() => route.query.orderId, (newOrderId, oldOrderId) => {
    if (newOrderId && newOrderId !== oldOrderId) {
        orderExpired.value = false;
        loadInitialData();
    }
});

</script>

<style scoped>
.payment-page {
  padding-bottom: 150px; /* 增加底部 padding，確保按鈕區塊滾動到底部時不會被遮擋 (如果按鈕區不是sticky) */
}
.page-main-title {
    text-align: center;
    margin-bottom: 2rem; /* 使用 rem 或 em 做間距 */
    color: var(--el-text-color-primary);
}

/* 通用內容面板樣式，用於訂購明細、付款方式+發票 */
.content-panel {
  max-width: 768px; /* 設定一個合適的最大寬度，例如 md 斷點的寬度 */
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 25px; /* 與下一個面板的間距 */
}
/* 如果 OrderItemsSummary 本身不是卡片樣式，可以在這裡加 */
.content-panel > .order-items-summary-card { /* 假設 OrderItemsSummary 根元素有這個 class */
    margin-bottom: 0; /* 如果 OrderItemsSummary 本身就有 margin-bottom，這裡可以覆蓋或移除 */
}


.status-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 30px;
    background-color: var(--el-fill-color-blank);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-light);
    text-align: center;
}
.status-actions {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.section-card { /* 付款方式和發票卡片的樣式 */
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: var(--el-border-radius-base);
    box-shadow: var(--el-box-shadow-lighter); /* 使用更輕的陰影 */
    overflow: hidden;
    margin-bottom: 20px;
}
.section-card:last-child {
    margin-bottom: 0; /* 如果是 content-panel 裡的最後一個，不需要下間距 */
}

.order-collapse :deep(.el-collapse-item__header) {
   font-weight: 600; /* 標題加粗 */
   padding: 18px 22px;
   font-size: 17px; /* 標題字型 */
   border-bottom: 1px solid var(--el-border-color-extra-light); /* Header 底部加分隔線 */
}
.order-collapse :deep(.el-collapse-item.is-active .el-collapse-item__header) {
    border-bottom-color: transparent; /* 展開時移除 header 底部線 */
}
.order-collapse :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}
.order-collapse :deep(.el-collapse-item__content) {
   padding: 15px 22px 22px 22px;
}

/* 底部按鈕區塊 */
.action-buttons-section {
  max-width: 768px; /* 與上方內容面板同寬 */
  margin: 30px auto 0 auto; /* 與上方間距，左右自動使其居中 */
  padding: 25px 0;
  border-top: 1px solid var(--el-border-color-light); /* 與上方內容的分隔線 */
  text-align: center; /* 讓內部元素（如過期提示）也居中 */
}

.buttons-row {
  display: flex;
  flex-direction: row; /* 水平排列 */
  justify-content: flex-end; /* 按鈕靠右，常見做法 */
  /* justify-content: center; */ /* 或者居中 */
  gap: 15px; /* 按鈕之間的間距 */
  width: 100%; /* 佔滿父容器寬度以便 justify-content 生效 */
}

.action-buttons-section .back-btn,
.action-buttons-section .submit-btn {
  min-width: 160px; /* 給按鈕一個最小寬度，使其不會太窄 */
  /* width: auto; */ /* 讓按鈕根據內容自適應寬度，上面 min-width 會先生效 */
}

.expired-text {
  margin-top: 15px; /* 與按鈕行的間距 */
  color: var(--el-color-danger);
  font-size: 14px;
  text-align: center; /* 確保在 .action-buttons-section 居中 */
}

.global-alert { /* 全局提示，放在頁面底部 */
    max-width: 768px;
    margin: 20px auto 0 auto;
}
</style>