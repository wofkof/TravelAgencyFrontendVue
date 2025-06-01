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
      <h1 class="page-main-title text-2xl font-semibold mb-6">訂單付款</h1>

      <div class="content-panel">
        <OrderItemsSummary
          v-if="!isLoading && !loadError && orderIdFromRoute"
          :order-number="mtnFromRoute"
          :items="currentOrderItems"
          :participants="orderParticipants"
          :total-amount="orderTotalAmount"
          :payment-deadline="expiresAtForCountdown"
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
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';

import { finalizeOrderPayment, getOrderDetails, activateOrderShortExpiration } from '@/utils/orderapi';
import { useCartStore } from '@/stores/ShoppingCart';
import { useHesitationStore } from '@/stores/hesitationStore';
import { ArrowLeft, ShoppingCart, RefreshRight } from '@element-plus/icons-vue';

// 子元件
import AccordionSection from '@/components/OrderForm/AccordionSection.vue';
import PaymentOptions from '@/components/OrderForm/PaymentOptions.vue';
import EInvoiceForm from '@/components/OrderForm/EInvoiceForm.vue';
import OrderItemsSummary from '@/components/OrderForm/OrderItemsSummary.vue';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const hesitationStore = useHesitationStore();

const isLoading = ref(true);
const loadError = ref(null);
const isSubmitting = ref(false);
const submitErrorTitle = ref('');
const submitErrorMessage = ref('');
const orderExpired = ref(false);
const submitError = ref(false);

const paymentPageFormRef = ref(null);
const paymentOptionsRef = ref(null);
const einvoiceFormRef = ref(null);

const activePaymentCollapseNames = ref(['payment', 'einvoice']);

const orderIdFromRoute = computed(() => route.query.orderId ? parseInt(route.query.orderId) : null);
const mtnFromRoute = computed(() => route.query.mtn || null);
// const expiresAtFromRoute = computed(() => route.query.exp || null); // 這個是從 OrderForm 頁面傳來的，可能是初始的10分鐘期限
const activePaymentDeadline = ref(null);
const expiresAtForCountdown = ref(route.query.exp || null);
// --- 響應式數據 ---
const currentOrderItems = ref([]);
const orderParticipants = ref([]);
const currentOrderStatus = ref(''); // << 新增：儲存從後端 API (getOrderDetails) 獲取的訂單狀態 >>
const orderTotalAmount = ref(0);
const orderItemCount = ref(0);

// << 新增：用於猶豫期判斷 >>
const memberId = ref(null); // 將從 localStorage 讀取
let isNavigatingToPaymentGateway = false; // 標記是否正跳轉至 ECPay，避免誤觸發猶豫期
let successRedirect = false; // << 新增：用於 handleFinalizePayment 中標記是否成功準備跳轉到金流 >>


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

// 新增：輔助函數來更新瀏覽器 URL
const updateBrowserUrl = (orderId) => {
  // 檢查 orderId 是否存在，以及瀏覽器是否支援 History API
  if (!orderId || !window.history || !window.history.replaceState) {
    return;
  }

  // 目標 URL 路徑和查詢字符串，只包含 orderId
  const targetPathQuery = `${window.location.pathname}?orderId=${orderId}`;
  // 解析當前 URL 的查詢參數
  const currentQuery = new URLSearchParams(window.location.search);
  
  let shouldUpdate = false; // 標記是否需要更新 URL

  // 檢查當前 URL 中的 orderId 是否與目標 orderId 不同 (通常情況下應該相同)
  if (currentQuery.get('orderId') !== String(orderId)) {
      shouldUpdate = true; 
  } else {
      // 如果 orderId 相同，則檢查是否存在其他您想要從 URL 中移除的參數
      if (currentQuery.has('mtn') || currentQuery.has('exp') || currentQuery.has('ordererEmail')) {
          shouldUpdate = true;
      }
  }

  // 如果根據上述條件判斷需要更新 URL
  if (shouldUpdate) {
    try {
      // 使用 history.replaceState 更新瀏覽器地址欄的 URL，不會導致頁面刷新
      window.history.replaceState(null, '', targetPathQuery);
      // console.log(`Address bar URL updated to: ${window.location.origin}${targetPathQuery}`); // 可選：用於調試
    } catch (e) {
      console.error("Error updating URL with history.replaceState:", e);
    }
  }
};

// remainingSeconds 計算的是 payment-deadline (activePaymentDeadline) 的剩餘時間
// 這個倒數主要是給用戶看的付款總時限
const remainingSeconds = computed(() => {
  if (!expiresAtForCountdown.value || orderExpired.value) {
    return 0;
  }
  const expiryTime = new Date(expiresAtForCountdown.value).getTime();
  const now = Date.now();
  const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
  if (diff === 0 && !orderExpired.value) {
    nextTick(() => {
        if(!orderExpired.value) { // 再次檢查，避免重複觸發
            handleCountdownFinish(); // 這個是處理總付款時間過期的邏輯
        }
    });
  }
  return diff;
});

const isPaymentMethodSelectedForEinvoice = computed(() => !!paymentFormData.paymentMethod);

const isSubmitButtonDisabled = computed(() => {
  if (orderExpired.value) return true;
  if (!paymentFormData.paymentMethod) return true;
  // 可以在此加入更多表單驗證的判斷
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
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  loadError.value = null;
  let loadingInstance = ElLoading.service({ text: '正在載入訂單資訊...', background: 'rgba(255,255,255,0.7)' });

  // 預設使用從路由傳來的到期時間
  activePaymentDeadline.value = route.query.exp || null;

  try {
    // << 修改：memberId 的獲取應在此處，而不是在全域 >>
    const storedMemberId = localStorage.getItem('memberId');
    if (!storedMemberId) {
      // _logger is not defined here, use console.error or ElMessage
      console.error("OrderPayment.vue - loadInitialData: 未找到 memberId");
      ElMessage.error("無法獲取會員資訊，請重新登入。");
      // throw new Error("無法獲取會員資訊，請重新登入。"); // 可以選擇拋出錯誤或直接 return
      loadError.value = "無法獲取會員資訊，請重新登入。";
      isLoading.value = false;
      if (loadingInstance) loadingInstance.close();
      return; // 終止執行
    }
    memberId.value = parseInt(storedMemberId, 10); // << 賦值給 ref >>

    // << 修改：getOrderDetails 第二個參數應為 memberId.value >>
    const response = await getOrderDetails(orderIdFromRoute.value, memberId.value);
    if (response && response.data) {
      orderTotalAmount.value = response.data.totalAmount;
      currentOrderStatus.value = response.data.orderStatus || response.data.status; // << 修改/確認：確保獲取正確的訂單狀態字串 >>

      // 關鍵修改：使用從 getOrderDetails API 返回的 expiresAt 更新倒數計時的截止時間
      if (response.data.expiresAt) {
        expiresAtForCountdown.value = response.data.expiresAt; // <--- 更新為 API 返回的最新到期時間
        console.log("付款倒數計時將基於 API 返回的到期時間:", activePaymentDeadline.value);
      } else {
        expiresAtForCountdown.value = route.query.exp || null;
        console.warn("API getOrderDetails 未返回 expiresAt，將使用路由傳入的到期時間。");
      }

      const emailFromApi = response.data.ordererEmail;
      const emailFromRouteQuery = route.query.ordererEmail;
      if (paymentFormData.eInvoiceInfo) {
        if (emailFromApi) {
          paymentFormData.eInvoiceInfo.deliveryEmail = emailFromApi;
        } else if (emailFromRouteQuery && !paymentFormData.eInvoiceInfo.deliveryEmail) {
          paymentFormData.eInvoiceInfo.deliveryEmail = emailFromRouteQuery;
        }
      }

      currentOrderItems.value = response.data.orderDetails || [];
      orderItemCount.value = currentOrderItems.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
      orderParticipants.value = response.data.participants || [];

      // 在所有數據成功加載和處理後，調用 updateBrowserUrl 函數來清理 URL
      // 確保 orderIdFromRoute.value 是有效的
      if (orderIdFromRoute.value) {
        updateBrowserUrl(orderIdFromRoute.value);
      }

      // << 修改：判斷訂單是否已過期或不適合付款的邏輯 >>
      // << currentOrderStatus.value 應該是後端 OrderStatus enum 的 ToString() 結果，例如 "Awaiting" >>
      if (currentOrderStatus.value !== 'Awaiting') { // << 確認 'Awaiting' 是否為正確的待付款狀態字串 >>
        orderExpired.value = true; // 標記為過期，禁用付款按鈕
        ElMessage.warning(`訂單 (狀態: ${currentOrderStatus.value}) 已處理或已失效，無法繼續付款。`);
      } else if (activePaymentDeadline.value && new Date(activePaymentDeadline.value) < new Date()) { // << 使用從API獲取的最新expiresAt判斷 >>
        if (!orderExpired.value) {
            handleCountdownFinish(); // 觸發總付款時間過期處理
        }
      } else {
      orderExpired.value = false;
      }
    } else {
    throw new Error("無法獲取訂單詳細資訊。");
    }
  } catch (err) {
    console.error("載入付款頁面初始資料失敗:", err);
    loadError.value = err.response?.data?.message || err.message || "載入訂單資料時發生錯誤。";
    ElMessage.error(loadError.value);
    if (!activePaymentDeadline.value) activePaymentDeadline.value = route.query.exp || null;
  } finally {
    isLoading.value = false;
    if (loadingInstance) loadingInstance.close();
  }
};

// << 新增：用於處理頁面離開前觸發猶豫期 >>
const triggerHesitationIfNeeded = async () => {
  // 條件判斷：
  // 1. orderIdFromRoute 和 memberId.value 存在
  // 2. currentOrderStatus.value 是 'Awaiting' (或其他代表「剛提交訂單資料，尚未選擇付款方式」的狀態)
  // 3. isSubmitting.value 為 false (表示不是因為點擊「確認付款並送出訂單」按鈕觸發的)
  // 4. isNavigatingToPaymentGateway 為 false (表示目的地不是金流頁面)
  const canActivate = orderIdFromRoute.value &&
                      memberId.value &&
                      currentOrderStatus.value === 'Awaiting' &&
                      !isSubmitting.value &&
                      !isNavigatingToPaymentGateway;

  if (canActivate) {
    try {
      console.log(`使用者準備離開 OrderPayment 頁面 (訂單ID: ${orderIdFromRoute.value})，嘗試啟動猶豫期。`);
      // << 修改：調用 activateOrderShortExpiration >>
      const response = await activateOrderShortExpiration(orderIdFromRoute.value, memberId.value);
      console.log('訂單猶豫期啟動成功:', response.data);
      // 後端會將 ExpiresAt 更新為30秒後，OrderExpirationService 會處理實際的過期
    } catch (error) {
      console.error("啟動訂單猶豫期失敗:", error.response?.data?.message || error.message);
      // 即使啟動失敗，通常也允許使用者離開
    }
  }
};

// << 新增：處理瀏覽器關閉/刷新事件 (盡力而為) >>
const handleBeforeUnload = (event) => {
  const canActivateOnUnload = orderIdFromRoute.value &&
                              memberId.value &&
                              currentOrderStatus.value === 'Awaiting' &&
                              !isSubmitting.value &&
                              !isNavigatingToPaymentGateway;
  if (canActivateOnUnload) {
    // 在 beforeunload 中直接呼叫異步 API 可能不會成功完成
    // navigator.sendBeacon 是一個選項，但後端 API 需要支援這種格式
    // 這裡主要依賴 onBeforeRouteLeave
    console.warn("瀏覽器即將卸載，應已在 onBeforeRouteLeave 嘗試啟動猶豫期。Order ID:", orderIdFromRoute.value);
    // 可以考慮同步發送一個請求，但現代瀏覽器對此限制較多
    // activateOrderShortExpiration(orderIdFromRoute.value, memberId.value); // 可能不會執行完畢
  }
};


onMounted(async () => { // << 修改：將 onMounted 內容移至此處，並設為 async >>
  const ordererEmailFromRouteQuery = route.query.ordererEmail;
  if (ordererEmailFromRouteQuery && paymentFormData.eInvoiceInfo && !paymentFormData.eInvoiceInfo.deliveryEmail) {
    paymentFormData.eInvoiceInfo.deliveryEmail = ordererEmailFromRouteQuery;
  }
  // << 修改：在 loadInitialData 前獲取 memberId (雖然 loadInitialData 內部也會獲取一次，但這裡先獲取有利於後續邏輯) >>
  const storedMemberId = localStorage.getItem('memberId');
  if (storedMemberId) {
    memberId.value = parseInt(storedMemberId, 10);
  } else {
    console.error("OrderPayment.vue - onMounted: 未找到 memberId，某些功能可能受影響。");
    // 可以在此提示用戶或採取其他措施
  }

  await loadInitialData(); // 確保 loadInitialData 完成後再執行後續操作
  // const initialRemaining = remainingSeconds.value; // 這行可以保留用於調試

  // << 新增：添加 beforeunload 事件監聽 >>
  window.addEventListener('beforeunload', handleBeforeUnload);
});

// << 新增：移除 beforeunload 事件監聽 >>
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});


// << 新增：Vue Router 的導航守衛，在離開此頁面前觸發 >>
onBeforeRouteLeave(async (to, from, next) => {
  // 1. 執行您現有的 triggerHesitationIfNeeded (啟動後端短時效過期)
  await triggerHesitationIfNeeded();

  // 2. << 新增: 與 hesitationStore 互動，用於 AwaitingOrderActions.vue 的猶豫期倒數 >>
  const orderId = orderIdFromRoute.value ? String(orderIdFromRoute.value) : null;
  // expiresAtForCountdown.value 應該是當前頁面認為的有效付款期限
  const currentEffectiveExpiresAt = expiresAtForCountdown.value; 

  if (orderId && currentEffectiveExpiresAt) {
    const relevantOrderPages = ['OrderForm', 'OrderPayment'];

    // 如果是從 OrderPayment 離開，且目標頁面不是 OrderForm 或 OrderPayment
    // 並且沒有正在跳轉到金流 (isNavigatingToPaymentGateway 為 false)
    if (relevantOrderPages.includes(from.name) && 
        !relevantOrderPages.includes(to.name) &&
        !isNavigatingToPaymentGateway) { // 新增條件：確保不是跳轉金流
          
      // hesitationStore 內部會判斷是否已啟動，避免重複啟動
      if (!hesitationStore.getEffectiveExpiresAt(orderId)) {
          console.log(`[OrderPayment onBeforeRouteLeave] Calling startHesitationCountdown for order ${orderId} with expiry ${currentEffectiveExpiresAt}`);
          hesitationStore.startHesitationCountdown(orderId, currentEffectiveExpiresAt);
      }
    }
  } else {
      console.log("[OrderPayment onBeforeRouteLeave] No valid orderId or currentEffectiveExpiresAt for hesitationStore, skipping.");
  }
  
  next(); // 允許導航
});


const handleCountdownFinish = () => { // 這個是處理總付款時間過期的邏輯
  if (!orderExpired.value) {
    orderExpired.value = true;
    ElMessageBox.alert('此訂單的付款時間已過期，請返回訂單明細頁面確認或重新下單。', '訂單已過期', {
      confirmButtonText: '我知道了',
      type: 'warning',
    });
  }
};

const goBackToOrderDetails = () => {
  // 當用戶點擊“返回修改訂單明細”時，也應觸發猶豫期
  // onBeforeRouteLeave 會處理這個情況
  if (orderIdFromRoute.value) {
    router.push({ name: 'OrderForm', query: { orderId: orderIdFromRoute.value } });
  } else {
    router.push({ name: 'ShoppingCart' });
  }
};

const handleFinalizePayment = async () => {
  if (orderExpired.value) {
    ElMessage.error("訂單已過期，無法提交。");
    return;
  }
  if (isSubmitButtonDisabled.value || isSubmitting.value) return;

  isSubmitting.value = true; // << 標記開始提交 >>
  isNavigatingToPaymentGateway = true; // << 新增：假設即將導向金流 >>
  successRedirect = false; // << 新增：重置成功跳轉標記 >>
  clearSubmitError();
  let isFormValid = true;

  if (!paymentFormData.paymentMethod) {
    ElMessage.error("請選擇付款方式。");
    isFormValid = false;
  }
  if (einvoiceFormRef.value && typeof einvoiceFormRef.value.validate === 'function') { // << 修正：確認 validate 是函數 >>
    const einvoiceValid = await einvoiceFormRef.value.validate();
    if (!einvoiceValid) {
      isFormValid = false;
    }
  } else if (!einvoiceFormRef.value && activePaymentCollapseNames.value.includes('einvoice')) {
    console.warn("EInvoiceForm 引用不存在，但區塊已展開，可能未驗證。");
    // 根據您的業務邏輯，這裡可能也需要將 isFormValid 設為 false
  }

  if (!isFormValid) {
    isSubmitting.value = false;
    isNavigatingToPaymentGateway = false; // << 新增：提交失敗，重設標記 >>
    return;
  }

  // << 修改：memberId 已在 onMounted 或 loadInitialData 中獲取並存於 memberId.value >>
  if (!memberId.value) {
    ElMessage.error("無法獲取會員ID，請重新整理頁面或登入。");
    isSubmitting.value = false;
    isNavigatingToPaymentGateway = false; // << 新增：提交失敗，重設標記 >>
    return;
  }

  let backendPaymentMethodValue;
  switch (paymentFormData.paymentMethod) {
    case 'ECPay_CreditCard': backendPaymentMethodValue = 0; break;
    case 'LINEPay': backendPaymentMethodValue = 1; break;
    default:
      ElMessage.error(`未知的付款方式: ${paymentFormData.paymentMethod}`);
      isSubmitting.value = false;
      isNavigatingToPaymentGateway = false; // << 新增：提交失敗，重設標記 >>
      return;
  }

  const finalPayload = {
    memberId: memberId.value, // << 使用 ref 的值 >>
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
      successRedirect = true; // << 標記成功準備跳轉 >>
      form.submit();
      // 頁面即將跳轉，不需要手動關閉 loadingInstance 或重設 isSubmitting

      // 【重要】在用戶跳轉到金流頁面後，清空購物車中 "已選中" 的商品
      // 假設 cartStore.selectedItems 仍然是形成此訂單的那些商品
      const selectedCartItemIds = cartStore.selectedItems.map(item => item.id); // 獲取當前選中商品的 ID
      if (selectedCartItemIds.length > 0) {
          cartStore.removeItemsByIds(selectedCartItemIds);
          console.log("OrderPayment: 已導向金流，並嘗試清空購物車中已選商品:", selectedCartItemIds);
      }

      return;
    } else {
      console.error('最終付款 API 回應格式不正確...', response?.data); // 簡化日誌
      submitErrorTitle.value = '付款處理失敗';
      // ... (錯誤訊息處理)
      submitErrorMessage.value = response?.data?.message || '無法獲取有效的付款參數。';
      ElMessage.error(submitErrorMessage.value);
      submitError.value = true;
    }
  } catch (err) {
    console.error("最終付款過程中發生錯誤:", err);
    submitErrorTitle.value = '提交付款失敗';
    // ... (錯誤訊息處理)
    submitErrorMessage.value = err.response?.data?.message || err.message || '發生未知錯誤。';
    ElMessage.error(`${submitErrorTitle.value}: ${submitErrorMessage.value}`);
    submitError.value = true;
  } finally {
    if (!successRedirect) { // << 只有在沒有成功跳轉時才執行 >>
        if (loadingInstance) loadingInstance.close();
        isSubmitting.value = false;
        isNavigatingToPaymentGateway = false; // << 新增：重設標記 >>
    }
  }
};

watch(() => route.query.orderId, (newOrderId, oldOrderId) => {
  if (newOrderId && newOrderId !== oldOrderId) {
    orderExpired.value = false; // 重置過期狀態
    isNavigatingToPaymentGateway = false; // 重置跳轉標記
    successRedirect = false; // 重置成功跳轉標記
    // 清理舊的狀態，例如付款方式選擇
    paymentFormData.paymentMethod = null;
    // ... 其他可能需要重置的狀態 ...
    loadInitialData(); // 重新載入新訂單的資料
  }
}, { immediate: true }); // << 新增 immediate: true 確保組件首次加載時，如果已有 orderId，也會執行一次 loadInitialData (雖然 onMounted 也有調用) >>

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