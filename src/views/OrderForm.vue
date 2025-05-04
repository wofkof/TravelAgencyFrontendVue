<!-- View//OrderForm.vue -->
<template>
  <div>
    <div v-if="isLoading">載入中...</div>
    <div v-else-if="error || selectedOrderItems.length === 0">
        <p>{{ error || '沒有選擇任何商品進行結帳。' }}</p>
        <router-link to="/cart">回到購物車</router-link>
    </div>

    <div v-else>
      <form @submit.prevent="submitOrder">
        <div class="order-layout-container">

          <div class="left-column">
            <AccordionSection title="訂單商品" section-name="items"
                              :opened-sections="openedSections" @toggle="handleToggle"
                              class="section-items"> <OrderItemsDisplay :items="selectedOrderItems" />
            </AccordionSection>

            <AccordionSection title="訂購人資料" section-name="ordererInfo"
                              :opened-sections="openedSections" @toggle="handleToggle"
                              class="section-participant">
              <ParticipantForm v-model="formData.ordererInfo" />
            </AccordionSection>

            <AccordionSection v-for="(item, index) in selectedOrderItems"
                              :key="item.id"
                              :title="`旅客資料 - ${item.name}`"
                              :section-name="`travelers-${item.id}`"
                              :opened-sections="openedSections"
                              @toggle="handleToggle"
                              class="section-traveler">
               <ItemParticipantForm v-if="formData.participantsByItem[item.id]"
                   :order-item="item"
                   v-model:participants="formData.participantsByItem[item.id]"
               />
            </AccordionSection>

            <AccordionSection title="付款方式" section-name="payment"
                              :opened-sections="openedSections" @toggle="handleToggle"
                              class="section-payment"
                              ref="paymentAccordionRef"> <PaymentOptions v-model="formData.paymentMethod" />
            </AccordionSection>

            <AccordionSection title="電子發票 / 收據 (請先選擇付款方式)" section-name="einvoice"
                              :opened-sections="openedSections" @toggle="handleToggle"
                              :is-disabled="!isPaymentMethodSelected"
                              class="section-einvoice">
               <EInvoiceForm v-model="formData.eInvoiceInfo" />
            </AccordionSection>

            <div class="note-section">
                <h3>備註</h3>
                <div>
                  <textarea v-model="formData.note" rows="3" placeholder="有任何特殊需求嗎？"></textarea>
                </div>
            </div>
          </div> <div class="right-column">
            <CostSummary
                :item-count="selectedItemsTotalQuantity"
                :total-amount="totalAmount"
                :selected-payment-method="formData.paymentMethod"
                :scroll-to-payment="scrollToPaymentOptions"
                :is-submitting="isSubmitting"
                :is-checkout-disabled="isCheckoutButtonDisabled"
                class="cost-summary-component" />
          </div>
        </div>
      </form> 
      <p v-if="submitError" style="color: red;">提交失敗: {{ submitError }}</p>
      <p v-if="submitSuccess" style="color: green;">訂單建立成功！訂單編號: {{ createdOrderId }}</p>

    </div> </div>
</template>


<script setup>
// --- 基本引入 ---
import { ref, reactive, computed, onMounted, watch } from 'vue'; // 引入 watch
import { useRouter } from 'vue-router';
import api from '@/utils/api'; // 引入 API Service
import { useCartStore } from '@/stores/cart';

// --- 引入子元件 ---
import AccordionSection from '@/components/OrderForm/AccordionSection.vue'; // ** 確保引入 AccordionSection **
import OrderItemsDisplay from '@/components/OrderForm/OrderItemsDisplay.vue';
import ParticipantForm from '@/components/OrderForm/ParticipantForm.vue';
import ItemParticipantForm from '@/components/OrderForm/ItemParticipantForm.vue';
import PaymentOptions from '@/components/OrderForm/PaymentOptions.vue';
import EInvoiceForm from '@/components/OrderForm/EInvoiceForm.vue';
import CostSummary from '@/components/OrderForm/CostSummary.vue';
// --- **修改：引入 i18n-iso-countries 和中文語言包** ---
import countries from 'i18n-iso-countries';
import zhLocale from '/zh-tw.json'; // 引入中文語言檔

// --- **註冊中文語言包** ---
countries.registerLocale(zhLocale);

// --- 狀態 ---
const router = useRouter();
const isLoading = ref(true);
const error = ref(null);
const isSubmitting = ref(false);
const submitError = ref(null);
const submitSuccess = ref(false);
const createdOrderId = ref(null);
const selectedOrderItems = ref([]);
const cartStore = useCartStore();

// --- Accordion 狀態管理 ---
const openedSections = ref(new Set(['items', 'ordererInfo', 'payment']));
const paymentAccordionRef = ref(null); // 付款方式區塊的 ref

// --- 表單資料模型 ---
const formData = reactive({
    memberId: 11110, // ** 範例值，記得替換 **
    note: '',
    participantInfo: {
        firstName: '',      // 原本的 name 變成了 firstName
        lastName: '',       // 新增 lastName
        country: 'TW',      // 新增 country, 預設值要對應下拉選單
        countryCode: '+886', // 新增 countryCode, 預設值要對應下拉選單
        phoneNumber: '',    // 原本的 phone 變成了 phoneNumber
        email: '',          // 新增 email
        updateProfile: false, // 新增 updateProfile
        documentType: 'ID_CARD_TW', // 與 ParticipantForm 的預設值一致
        documentNumber: ''
    },
    participantsByItem: {}, // ** 改為物件，用 item.id 作為 key **
    paymentMethod: null, // 預設未選擇
    eInvoiceInfo: { type: 'personal', taxId: '', companyTitle: '', donationCode: '', }
});

// --- 計算屬性：判斷付款方式是否已選 ---
const isPaymentMethodSelected = computed(() => !!formData.paymentMethod);

// 計算商品總件數 (用於 CostSummary 標題)
const selectedItemsTotalQuantity = computed(() => {
    return selectedOrderItems.value.reduce((totalQty, item) => {
        let itemQty = 0;
        if (item.options && item.options.length > 0) {
            itemQty = item.options.reduce((optionQty, option) => optionQty + option.quantity, 0);
        } else if (item.quantity) {
            itemQty = item.quantity;
        }
        return totalQty + itemQty;
    }, 0);
});

// 計算單項小計 (用於總金額)
const calculateItemSubtotal = (item) => {
  if (item.options && item.options.length > 0) {
    return item.options.reduce((sum, option) => sum + (option.price * option.quantity), 0);
  } else if (item.quantity && item.pricePerUnit) {
    return item.pricePerUnit * item.quantity;
  }
  return 0;
};

// 計算總金額
const totalAmount = computed(() => {
  return selectedOrderItems.value.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item);
  }, 0);
});

// 計算結帳按鈕是否禁用
const isCheckoutButtonDisabled = computed(() => {
    // 增加對訂購人資料和旅客資料的檢查
    const isOrdererInfoValid = formData.ordererInfo && formData.ordererInfo.firstName && formData.ordererInfo.lastName /* && 其他必填 */;
    const allTravelersValid = Object.values(formData.participantsByItem).every(paxArray =>
        paxArray && paxArray.length > 0 && paxArray.every(pax => pax && pax.firstNameZh && pax.lastNameZh && pax.country && pax.documentNumber && pax.birthDate /* && 其他必填 */)
    );
    // 檢查每個商品的旅客陣列長度是否正確
    const quantitiesMatch = selectedOrderItems.value.every(item => {
        const expectedCount = getItemParticipantCount(item);
        return formData.participantsByItem[item.id]?.length === expectedCount;
    });

    return isSubmitting.value
        || selectedOrderItems.value.length === 0
        || !isPaymentMethodSelected.value
        || !isOrdererInfoValid
        || !allTravelersValid
        || !quantitiesMatch; // 加入數量匹配檢查
});
// Accordion 開關
const handleToggle = (sectionName) => {
  const newOpenedSections = new Set(openedSections.value);
  if (newOpenedSections.has(sectionName)) {
    newOpenedSections.delete(sectionName);
  } else {
    newOpenedSections.add(sectionName);
  }
  openedSections.value = newOpenedSections;
};

// 監聽付款方式變化，自動展開電子發票
watch(() => formData.paymentMethod, (newValue, oldValue) => {
    if (newValue && !oldValue) {
        if (!openedSections.value.has('einvoice')) {
            handleToggle('einvoice');
        }
    }
});

// 滾動到付款方式區塊
const scrollToPaymentOptions = () => {
    if (paymentAccordionRef.value?.$el) {
        paymentAccordionRef.value.$el.scrollIntoView({ behavior: 'smooth', block: 'center' });
         if (!openedSections.value.has('payment')) {
            handleToggle('payment');
         }
    } else {
        console.warn("Payment options section ref not found.");
    }
};

// 輔助函式：計算單個商品需要多少旅客
const getItemParticipantCount = (item) => {
    let quantity = 0;
    if (item.options && item.options.length > 0) {
        quantity = item.options.reduce((sum, option) => sum + option.quantity, 0);
    } else if (item.quantity) {
        quantity = item.quantity;
    }
    return quantity;
};

// --- **修改：監聽 selectedOrderItems 變化，初始化/更新 participantsByItem** ---
watch(selectedOrderItems, (newItems) => {
    const newParticipantsByItem = {};
    let totalExpectedPax = 0;
    newItems.forEach(item => {
        const expectedCount = getItemParticipantCount(item);
        totalExpectedPax += expectedCount;
        // 保留舊的資料（如果 key 存在），或創建新的空陣列
        const existingPaxs = formData.participantsByItem[item.id] || [];
        const currentPaxs = [];
        for (let i = 0; i < expectedCount; i++) {
            // 如果舊資料夠用就沿用，不夠就補上預設值
            currentPaxs.push(existingPaxs[i] || {
                country: 'TW', firstNameZh: '', lastNameZh: '', documentNumber: '', birthDate: null
            });
        }
        newParticipantsByItem[item.id] = currentPaxs;
    });
    formData.participantsByItem = newParticipantsByItem;

    // ** 更新 accordion state，為每個商品旅客區塊添加 section name **
    const newOpenedSections = new Set(openedSections.value);
    newItems.forEach(item => {
        const sectionName = `travelers-${item.id}`;
        // 可以選擇是否預設展開旅客區塊
        newOpenedSections.add(sectionName);
    });

}, { deep: true, immediate: true }); // deep: true 可能需要，immediate 確保初始化

// 載入購物車資料，從 Pinia Store 讀取
const loadOrderItems = () => {
  isLoading.value = true;
  error.value = null;
  try {
    // 從 Pinia store 的 getter 直接獲取已選中的商品
    // 注意：selectedItems getter 返回的是響應式數據，直接賦值即可
    // 如果擔心後續操作會意外修改 store 狀態，可以做淺拷貝 [...cartStore.selectedItems]
    // 但通常讀取 getter 是安全的
    selectedOrderItems.value = cartStore.selectedItems;

    // 檢查從 store 讀取後是否真的有選中商品
    if (selectedOrderItems.value.length === 0) {
      // 你可以選擇在這裡設定 error，或者讓模板中的判斷來處理
      // error.value = '沒有選擇任何商品進行結帳。';
      console.warn("從 Pinia Store 加載訂單：購物車中沒有選中的商品。");
    }

    isLoading.value = false;
  } catch (err) {
    // 這個 catch 現在主要是處理訪問 store 可能出現的意外錯誤
    error.value = '讀取購物車狀態時發生錯誤。';
    console.error("Error loading selected items from Pinia store:", err);
    isLoading.value = false;
  }
};

// 修改：提交訂單，整合 participantsByItem
const submitOrder = async () => {
    if (isCheckoutButtonDisabled.value && !isSubmitting.value) {
        // ... (錯誤提示) ...
        return;
    }
    // (設定 isSubmitting 等)

    const orderDetails = selectedOrderItems.value.flatMap(item => { /* ... */ });

    // 將 participantsByItem 轉換為後端需要的格式
    const allParticipants = Object.values(formData.participantsByItem).flat().map(p => ({ ...p }));

    const orderPayload = {
        memberId: formData.memberId,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        ordererInfo: { ...formData.ordererInfo },
        participants: allParticipants, // 使用整合後的旅客陣列
        eInvoiceInfo: { ...formData.eInvoiceInfo },
        orderDetails: orderDetails
    };

    console.log("Submitting Order Payload:", JSON.stringify(orderPayload, null, 2));

    try {
        const response = await api.createOrder(orderPayload);
        // ... (成功處理) ...
    } catch (err) {
        // ... (錯誤處理) ...
    } finally {
        isSubmitting.value = false;
    }
};

// --- 生命週期鉤子 ---
// ** 確保 onMounted 只出現一次 **
onMounted(() => {
  loadOrderItems(); // 元件掛載後載入資料
});
</script>

<style scoped>
  /* 整體佈局容器 */
  .order-layout-container {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 15px;
  }

  /* 左欄 */
  .left-column {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 30px; /* 使用 gap 控制垂直間距 */
  }

  /* 右欄 */
  .right-column {
    flex: 1;
    position: sticky;
    top: 80px; /* 確保這個值適合你的導覽列高度 */
  }

  /* 右欄的 CostSummary 元件間距 (因為它現在是直接子元素) */
  .right-column > .cost-summary-component {
      margin-bottom: 0; /* 作為右欄唯一內容(除了按鈕)，下方不需要 margin */
  }

  /* 備註區塊樣式 */
  .note-section {
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
      /* gap 屬性會處理與上方元件的間距，所以 margin-top 可以移除 */
  }
  .note-section h3 { 
    margin-top: 0; 
    margin-bottom: 15px; 
  }
  textarea { 
    width: 100%; 
    padding: 8px; 
    box-sizing: border-box; 
    border: 1px solid #ccc; 
    border-radius: 4px; 
    min-height: 60px; 
  }

</style>