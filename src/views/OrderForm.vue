<template>
  <div class="order-form-page">
    <div v-if="isLoading" class="loading-container status-container">
      <el-skeleton :rows="6" animated />
      </div>

    <div v-else-if="error" class="status-container error-container">
       <el-alert
         title="載入訂單資訊時發生錯誤"
         :description="error"
         type="error"
         show-icon
         :closable="false"
         center
         style="margin-bottom: 20px;"
       />
       <div class="status-actions">
         <el-button type="primary" @click="loadOrderItems" :icon="RefreshRight">重試</el-button>
         <router-link to="/cart">
           <el-button :icon="ShoppingCart">回到購物車</el-button>
         </router-link>
       </div>
    </div>

     <div v-else-if="!selectedOrderItems || selectedOrderItems.length === 0" class="status-container empty-container">
        <el-empty description="購物車中沒有選擇任何商品">
           <router-link to="/cart">
             <el-button type="primary" :icon="ShoppingCart">回到購物車選擇商品</el-button>
           </router-link>
        </el-empty>
    </div>

    <div v-else class="order-form-content">
      <form @submit.prevent="submitOrder" ref="orderFormRef">
        <div class="order-layout-container">

          <div class="left-column">
            <el-collapse v-model="activeCollapseNames" class="order-collapse">

              <AccordionSection
                title="訂單商品"
                section-name="items"
                class="section-card section-items"
                data-section-name="items"
              >
                 <OrderItemsDisplay :items="selectedOrderItems" />
              </AccordionSection>

              <AccordionSection
                title="訂購人資料"
                section-name="ordererInfo"
                class="section-card section-orderer"
                data-section-name="ordererInfo"
              >
                <ParticipantForm v-model="formData.ordererInfo" />
              </AccordionSection>

              <AccordionSection
                v-for="(item) in selectedOrderItems.filter(i => getItemParticipantCount(i) > 0)"
                :key="item.id"
                :title="`旅客資料 - ${item.name}`"
                :section-name="`travelers-${item.id}`"
                class="section-card section-traveler"
                :data-section-name="`travelers-${item.id}`"
              >
                 <ItemParticipantForm
                   v-if="formData.participantsByItem[item.id]"
                   :order-item="item"
                   v-model:participants="formData.participantsByItem[item.id]"
                 />
                 <div v-else>此商品無需填寫旅客資料或資料載入異常。</div>
              </AccordionSection>

              <AccordionSection
                title="付款方式"
                section-name="payment"
                class="section-card section-payment"
                data-section-name="payment"
              >
                 <PaymentOptions v-model="formData.paymentMethod" />
              </AccordionSection>

              <AccordionSection
                title="電子發票 / 收據"
                section-name="einvoice"
                :is-disabled="!isPaymentMethodSelected"
                :tooltip-disabled="isPaymentMethodSelected ? '' : '請先選擇付款方式'"
                class="section-card section-einvoice"
                data-section-name="einvoice"
              >
                 <EInvoiceForm v-model="formData.eInvoiceInfo" />
              </AccordionSection>

            </el-collapse>

            <div class="section-card note-section">
                <h3>備註</h3>
                <el-input
                  v-model="formData.note"
                  type="textarea"
                  :rows="3"
                  placeholder="有任何特殊需求嗎？（例如：過敏、飲食禁忌、希望與其他訂單同行等）"
                  show-word-limit
                  maxlength="200"
                  resize="none"
                />
            </div>
          </div>

          <div class="right-column">
            <CostSummary
                :item-count="selectedItemsTotalQuantity"
                :total-amount="totalAmount"
                :selected-payment-method="formData.paymentMethod"
                :scroll-to-payment="scrollToPaymentOptions"
                :is-submitting="isSubmitting"
                :is-checkout-disabled="isCheckoutButtonDisabled"
                @submit-order="submitOrder"
                class="cost-summary-component" />
          </div>

        </div>
      </form>

      <el-alert
         v-if="submitError"
         title="訂單提交失敗"
         :description="submitError"
         type="error"
         show-icon
         style="margin-top: 20px; max-width: 1200px; margin-left: auto; margin-right: auto;"
         @close="submitError = null"
       />
    </div>
  </div>
</template>

<script setup>
// --- 基本引入 ---
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/utils/api'; // 引入 API Service
import { useCartStore } from '@/stores/cart';

// --- 引入 Element Plus 圖標 (如果需要) ---
import { RefreshRight, ShoppingCart, Goods, User, Tickets, Wallet, Document as DocIcon } from '@element-plus/icons-vue';

import countries from 'i18n-iso-countries';
import zhLocale from '/zh-tw.json'; // **請再次確認此路徑正確**

// --- 引入子元件 ---
import AccordionSection from '@/components/OrderForm/AccordionSection.vue';
import OrderItemsDisplay from '@/components/OrderForm/OrderItemsDisplay.vue';
import ParticipantForm from '@/components/OrderForm/ParticipantForm.vue';
import ItemParticipantForm from '@/components/OrderForm/ItemParticipantForm.vue';
import PaymentOptions from '@/components/OrderForm/PaymentOptions.vue';
import EInvoiceForm from '@/components/OrderForm/EInvoiceForm.vue';
import CostSummary from '@/components/OrderForm/CostSummary.vue';

// --- 在 setup 頂層註冊中文語言包** ---
try {
    countries.registerLocale(zhLocale);
    console.log("i18n-iso-countries Chinese locale registered.");
} catch (e) {
    console.error("Failed to register i18n-iso-countries locale:", e);
    // 根據需要處理錯誤，例如顯示提示或使用預設語言
}
// --- 狀態管理 ---
const router = useRouter();
const cartStore = useCartStore();
const orderFormRef = ref(null); // 用於獲取表單的 DOM 引用
const isLoading = ref(true);       // 是否正在載入購物車資料
const error = ref(null);           // 載入或提交時的錯誤訊息
const isSubmitting = ref(false);   // 是否正在提交訂單
const submitError = ref(null);     // 提交訂單失敗的錯誤訊息
const submitSuccess = ref(false);  // 訂單是否提交成功 (通常由跳轉處理)
const createdOrderId = ref(null);  // 成功創建的訂單 ID
const selectedOrderItems = ref([]); // 從購物車載入的、用於此訂單的商品列表

// --- Accordion (手風琴) 狀態管理 ---
// 預設展開的區塊名稱集合 (可以調整預設展開哪些)
const activeCollapseNames = ref(['items', 'ordererInfo', 'payment']);

const paymentAccordionRef = ref(null); // 用於獲取付款方式 AccordionSection 的 DOM 引用

// --- 表單資料模型 (使用 reactive) ---
const formData = reactive({
  memberId: 11110, // ** TODO: 應從登入狀態獲取真實 Member ID **
  note: '',
  // 訂購人資料 (與 ParticipantForm v-model 對應)
  ordererInfo: {
    firstName: '',
    lastName: '',
    country: 'TW', // 預設台灣
    countryCode: '+886', // 預設台灣區號
    phoneNumber: '',
    email: '',
    updateProfile: false, // 是否同步更新會員資料
    documentType: 'ID_CARD_TW', // 證件類型預設
    documentNumber: ''       // 證件號碼
  },
  // 旅客資料 (按商品分組，key 為 item.id)
  participantsByItem: {},
  // 付款方式 (與 PaymentOptions v-model 對應)
  paymentMethod: null,
  // 電子發票資訊 (與 EInvoiceForm v-model 對應)
  eInvoiceInfo: {
    type: 'personal',     // 預設個人發票
    taxId: '',          // 統一編號
    companyTitle: '',   // 公司抬頭
    donationCode: '',   // 捐贈碼
  }
});

// --- 計算屬性 (Computed Properties) ---

// 判斷付款方式是否已選擇
const isPaymentMethodSelected = computed(() => !!formData.paymentMethod);

// 計算訂單商品總 "單位" 數量 (例如總票數)
const selectedItemsTotalQuantity = computed(() => {
    return selectedOrderItems.value.reduce((totalQty, item) => {
        return totalQty + getItemParticipantCount(item); // 使用輔助函數計算單項數量
    }, 0);
});

// 計算訂單總金額
const totalAmount = computed(() => {
  return selectedOrderItems.value.reduce((sum, item) => {
    return sum + cartStore.calculateItemTotal(item); // 直接調用 Store 中的計算方法
  }, 0);
});

// 判斷所有旅客資料是否有效 (基礎檢查)
const allTravelersValid = computed(() => {
    // 檢查是否存在旅客資料區塊
    if (Object.keys(formData.participantsByItem).length === 0 && selectedOrderItems.value.length > 0) {
        // 如果有商品但旅客資料結構是空的 (可能初始化問題)，視為無效
        const needsTravelers = selectedOrderItems.value.some(item => getItemParticipantCount(item) > 0);
        if (needsTravelers) return false;
    }
    // 遍歷所有商品的旅客陣列
    return Object.values(formData.participantsByItem).every(paxArray =>
        // 每個陣列都必須存在，並且內部每個旅客都必須有效
        paxArray && paxArray.length > 0 && paxArray.every(pax =>
            pax &&
            pax.firstNameZh && // 假設這些是必填欄位
            pax.lastNameZh &&
            pax.country &&
            pax.documentNumber &&
            pax.birthDate
            // ... 可根據 ParticipantForm 添加更多必填驗證
        )
    );
});

// 判斷每個商品的旅客數量是否與訂購數量匹配
const quantitiesMatch = computed(() => {
    return selectedOrderItems.value.every(item => {
        const expectedCount = getItemParticipantCount(item);
        // 如果預期數量為 0 (例如某些商品不需旅客資料)，則視為匹配
        if (expectedCount === 0) return true;
        // 否則檢查實際填寫的旅客數量是否等於預期數量
        return formData.participantsByItem[item.id]?.length === expectedCount;
    });
});

// 判斷結帳按鈕是否應禁用
const isCheckoutButtonDisabled = computed(() => {
    // 基礎檢查：是否正在提交、是否有商品、是否選了付款方式
    if (isSubmitting.value || selectedOrderItems.value.length === 0 || !isPaymentMethodSelected.value) {
        return true;
    }
    // 檢查訂購人資料是否有效 (簡單檢查姓名)
    const isOrdererInfoValid = formData.ordererInfo && formData.ordererInfo.firstName && formData.ordererInfo.lastName;
    if (!isOrdererInfoValid) {
        // console.log("禁用原因：訂購人資料無效");
        return true;
    }
    // 檢查旅客數量是否匹配
    if (!quantitiesMatch.value) {
       // console.log("禁用原因：旅客數量不匹配");
       return true;
    }
    // 檢查所有旅客資料是否有效 (根據 allTravelersValid 的計算結果)
    if (!allTravelersValid.value) {
        // console.log("禁用原因：旅客資料無效");
        return true;
    }
    // 如果所有檢查都通過，則不禁用
    return false;
});

// --- 方法 (Methods) ---


// 滾動到付款方式區塊並展開
const scrollToPaymentOptions = () => {
    // 使用 data-attribute 選擇器
    const paymentSectionElement = document.querySelector('[data-section-name="payment"]');
    if (paymentSectionElement) {
        // 找到元素後，可以選擇滾動到元素本身，或者滾動到它的頭部
        // 如果 AccordionSection 內部渲染的是 el-collapse-item，可能需要滾動到 header
        const headerElement = paymentSectionElement.querySelector('.el-collapse-item__header');
        const targetElement = headerElement || paymentSectionElement; // 優先滾動到 header

        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 確保付款區塊是展開的
        if (!activeCollapseNames.value.includes('payment')) {
             activeCollapseNames.value.push('payment');
        }
    } else {
        console.warn("無法找到 data-section-name='payment' 的區塊元素進行滾動。");
    }
};


// 輔助函式：計算單個商品需要填寫的旅客數量
const getItemParticipantCount = (item) => {
    if (item?.participantRequired === false) { // 假設商品數據有個標誌指示是否需要旅客資料
        return 0;
    }
    let quantity = 0;
    if (item.options && item.options.length > 0) {
        quantity = item.options.reduce((sum, option) => sum + option.quantity, 0);
    } else if (item.quantity !== undefined) {
        quantity = item.quantity;
    }
    return quantity;
};

// 從 Pinia Store 加載已選中的購物車商品
const loadOrderItems = () => {
  console.log("載入訂單商品...");
  isLoading.value = true;
  error.value = null;
  try {
    // 直接從 store 的 selectedItems getter 獲取數據
    // selectedItems getter 應確保只返回有效的、選中的商品
    const itemsFromStore = cartStore.selectedItems;
    console.log("從 Store 獲取的商品:", itemsFromStore);

    // 深拷貝一份數據，避免後續操作意外修改 store 狀態
    selectedOrderItems.value = JSON.parse(JSON.stringify(itemsFromStore));

    if (selectedOrderItems.value.length === 0) {
      console.warn("購物車中沒有選擇任何商品進行結帳。");
      // error.value = '沒有選擇任何商品進行結帳。'; // 或者讓模板處理空狀態
    }
    isLoading.value = false;
  } catch (err) {
    console.error("從 Pinia Store 加載訂單商品時出錯:", err);
    error.value = '讀取購物車狀態時發生錯誤，請稍後再試。';
    isLoading.value = false;
  }
};

// 提交訂單
const submitOrder = async () => {
    // --- 1. 準備訂購人資訊 (OrdererInfo) ---
    // 來自 ParticipantForm.vue (formData.ordererInfo)
    // ParticipantForm.vue 的 modelValue: { firstName, lastName, country, countryCode, phoneNumber, email, updateProfile, documentType, documentNumber }
    const preparedOrdererInfo = {
        name: `${formData.ordererInfo.lastName || ''}${formData.ordererInfo.firstName || ''}`.trim(),
        mobilePhone: `${formData.ordererInfo.countryCode || ''}${formData.ordererInfo.phoneNumber || ''}`.replace(/\s/g, ''), // 合併國碼和號碼，並移除空格
        email: formData.ordererInfo.email || null
    };

    // --- 2. 準備旅客列表 (Participants) ---
    // 來自 ItemParticipantForm.vue (formData.participantsByItem[itemId])
    // ItemParticipantForm.vue 每個 participant 物件的結構: { id, country, firstNameZh, lastNameZh, documentNumber, birthDate, (可能還有 gender, email, phone, documentType 等) }
    // 後端 OrderParticipantDto 需要: Name, BirthDate, IdNumber, Gender, Phone, Email, DocumentType, Nationality 等
    const preparedParticipants = Object.values(formData.participantsByItem).flat().map(p_vue => {
        const participantName = `${p_vue.lastNameZh || ''}${p_vue.firstNameZh || ''}`.trim();

        // 假設 ItemParticipantForm.vue 也收集了 gender, email, phone, documentType
        // 如果沒有，您需要在 ItemParticipantForm.vue 中添加這些欄位
        // 或者在後端將它們設為可選 (nullable)

        // 處理 DocumentType 映射 (假設 Vue 的 'ID_CARD_TW' 對應後端某個 Enum 值)
        let backendDocumentType;
        switch (p_vue.documentType) { // 假設 p_vue.documentType 是從 ItemParticipantForm 來的
            case 'ID_CARD_TW': backendDocumentType = 0; break; // 假設後端 DocumentType Enum 0 是台灣身分證
            case 'PASSPORT': backendDocumentType = 1; break;   // 假設後端 DocumentType Enum 1 是護照
            case 'ARC': backendDocumentType = 2; break;        // 假設後端 DocumentType Enum 2 是居留證
            case 'ENTRY_PERMIT': backendDocumentType = 3; break; // 假設後端 DocumentType Enum 3 是入台證
            default: backendDocumentType = null; // 或一個預設值
        }

        // 處理 GenderType 映射 (假設 ItemParticipantForm 有 gender 欄位)
        let backendGender;
        switch (p_vue.gender) { // 假設 p_vue.gender 是從 ItemParticipantForm 來的 (例如 'male', 'female', 'other')
            case 'male': backendGender = 0; break;   // 假設後端 GenderType Enum 0 是 Male
            case 'female': backendGender = 1; break; // 假設後端 GenderType Enum 1 是 Female
            case 'other': backendGender = 2; break;  // 假設後端 GenderType Enum 2 是 Other
            default: backendGender = null;
        }


        return {
            favoriteTravelerId: p_vue.favoriteTravelerId || null, // 假設 ItemParticipantForm 有此欄位
            memberIdAsParticipant: p_vue.memberIdAsParticipant || null, // 假設 ItemParticipantForm 有此欄位
            name: participantName,
            birthDate: p_vue.birthDate, // 確保是 "YYYY-MM-DD" 或 "YYYY-MM-DDTHH:mm:ss"
            idNumber: p_vue.documentNumber, // 後端用 IdNumber 代表主要證件號
            gender: backendGender, // 使用映射後的 Gender Enum 整數值
            phone: p_vue.phoneNumber || '', // 假設 ItemParticipantForm 有 phoneNumber 欄位
            email: p_vue.email || '',     // 假設 ItemParticipantForm 有 email 欄位
            documentType: backendDocumentType, // 使用映射後的 DocumentType Enum 整數值
            documentNumber: p_vue.documentNumber, // 可以與 IdNumber 相同，或如果用途不同則分別提供
            passportSurname: p_vue.lastNameEn || '', // 假設 ItemParticipantForm 有 lastNameEn
            passportGivenName: p_vue.firstNameEn || '', // 假設 ItemParticipantForm 有 firstNameEn
            passportExpireDate: p_vue.passportExpireDate || null, // 假設 ItemParticipantForm 有
            nationality: p_vue.country, // 直接使用前端的國家代碼 (例如 'TW')
            note: p_vue.note || '' // 假設 ItemParticipantForm 有
        };
    });

    // --- 3. 準備發票請求資訊 (InvoiceRequestInfo) ---
    // 來自 EInvoiceForm.vue (formData.eInvoiceInfo)
    // EInvoiceForm.vue 的 modelValue: { type: 'personal', taxId: '', companyTitle: '', donationCode: '' }
    // 後端 OrderInvoiceRequestDto 需要: InvoiceOption (enum), InvoiceDeliveryEmail, InvoiceUniformNumber, InvoiceTitle, InvoiceAddBillingAddr, InvoiceBillingAddress
    let backendInvoiceOption;
    switch (formData.eInvoiceInfo.type) {
        case 'personal': backendInvoiceOption = 0; break; // 假設後端 InvoiceOption Enum 0 是 Personal
        case 'company': backendInvoiceOption = 1; break;  // 假設後端 InvoiceOption Enum 1 是 Company
        // case 'donation': // 您說暫時不需要捐贈
        default: backendInvoiceOption = 0; // 預設為個人
    }

    const preparedInvoiceRequestInfo = {
        invoiceOption: backendInvoiceOption,
        invoiceDeliveryEmail: formData.eInvoiceInfo.deliveryEmail || formData.ordererInfo.email, // EInvoiceForm 應有 deliveryEmail，或預設用訂購人 email
        invoiceUniformNumber: formData.eInvoiceInfo.type === 'company' ? formData.eInvoiceInfo.taxId : null,
        invoiceTitle: formData.eInvoiceInfo.type === 'company' ? formData.eInvoiceInfo.companyTitle : null,
        invoiceAddBillingAddr: formData.eInvoiceInfo.addBillingAddress || false, // EInvoiceForm 應有此欄位
        invoiceBillingAddress: formData.eInvoiceInfo.addBillingAddress ? (formData.eInvoiceInfo.billingAddress || null) : null // EInvoiceForm 應有此欄位
    };

    // --- 4. 準備選擇的付款方式 (SelectedPaymentMethod) ---
    // 來自 PaymentOptions.vue (formData.paymentMethod)
    // PaymentOptions.vue 的 modelValue: 'CreditCard', 'BankTransfer'
    // 後端 PaymentMethod enum: CreditCard = 0, BankTransfer = 1, Other = 2
    let backendSelectedPaymentMethod;
    switch (formData.paymentMethod) {
        case 'CreditCard': backendSelectedPaymentMethod = 0; break;
        case 'BankTransfer': backendSelectedPaymentMethod = 1; break;
        case 'LINEPay': backendSelectedPaymentMethod = 2; break; // 假設 LINEPay 對應 Other 或您新增的 Enum 值
        default: backendSelectedPaymentMethod = 0; // 或拋出錯誤，因為必須選擇
    }


    // --- 5. 組合最終 Payload ---
    const orderPayload = {
        totalAmount: totalAmount.value, // 來自 computed totalAmount
        orderNotes: formData.note,
        ordererInfo: preparedOrdererInfo,
        participants: preparedParticipants,
        invoiceRequestInfo: preparedInvoiceRequestInfo,
        selectedPaymentMethod: backendSelectedPaymentMethod
        // memberId 不從前端傳送
        // orderDetails 也不在初次建立訂單時傳送
    };

    console.log("準備提交的訂單 Payload (精確映射後):", JSON.stringify(orderPayload, null, 2));

    try {
        const response = await api.createOrder(orderPayload); // 調用 API
        console.log('訂單創建成功:', response);

        // 處理成功響應
        createdOrderId.value = response.data?.orderId; // 假設後端返回訂單 ID
        submitSuccess.value = true;

        // **重要：訂單成功後的操作**
        // 1. 清空購物車中已結帳的商品 (調用 store action)
        const submittedItemIds = selectedOrderItems.value.map(item => item.id);
        cartStore.removeItemsByIds(submittedItemIds); // 清除購物車

        // 2. 跳轉到訂單完成頁面，並帶上訂單 ID
        router.push({ path: '/order-complete', query: { orderId: createdOrderId.value } });

    } catch (err) {
        console.error('訂單提交失敗:', err);
        submitError.value = err.response?.data?.message || err.message || '發生未知錯誤，請稍後再試。';
        // 可以在這裡顯示更友好的錯誤提示給用戶，例如使用 Element Plus 的 Message
        // ElMessage.error(`訂單提交失敗: ${submitError.value}`);
    } finally {
        isSubmitting.value = false; // 結束提交狀態
    }
};


// --- Watchers (監聽器) ---

// 監聽從 Store 獲取的 selectedOrderItems 變化，自動初始化/更新旅客資料區塊
watch(selectedOrderItems, (newItems, oldItems) => {
    // 只有當商品列表實際變化時才處理 (避免不必要的重置)
    // 簡單比較 JSON 字串判斷是否有實質變化 (可能不是最高效，但適用於此場景)
    if (JSON.stringify(newItems) === JSON.stringify(oldItems)) {
        return;
    }
    console.log("監聽到 selectedOrderItems 變化，更新旅客表單結構和 Collapse 狀態");

    const newParticipantsByItem = {};
    const currentActiveNamesSet = new Set(activeCollapseNames.value);
    const requiredTravelerSections = new Set(); // 儲存這次更新後 *需要* 的旅客區塊名稱

    newItems.forEach(item => {
        const expectedCount = getItemParticipantCount(item);
        const sectionName = `travelers-${item.id}`;

        // 如果預期旅客數為 0，則不需要為此商品創建旅客資料區塊
        if (expectedCount === 0) {
             newParticipantsByItem[item.id] = []; // 確保 key 存在但值為空陣列
             newOpenedSections.delete(sectionName); // 如果之前展開了，關閉它
             return; // 處理下一個商品
        }

        // 如果需要旅客資料
        requiredTravelerSections.add(sectionName); // 標記這個旅客區塊是需要的
        const existingPaxs = formData.participantsByItem[item.id] || [];
        const currentPaxs = []; // 當前商品的旅客資料陣列

        for (let i = 0; i < expectedCount; i++) {
            // 如果現有資料夠用，則沿用；否則，創建新的預設旅客物件
            currentPaxs.push(existingPaxs[i] || {
                country: formData.ordererInfo.country || 'TW', // 可以預設為訂購人國籍
                firstNameZh: '', lastNameZh: '',
                firstNameEn: '', lastNameEn: '',
                gender: null, // 性別預設未知
                birthDate: null, // 生日預設空
                documentType: formData.ordererInfo.documentType || 'ID_CARD_TW', // 預設同訂購人
                documentNumber: ''
                // ... 其他需要的預設欄位
            });
        }
        newParticipantsByItem[item.id] = currentPaxs;

        // **將需要展開的區塊名稱加入 Set (Set 會自動處理重複)**
        currentActiveNamesSet.add(sectionName); // 預設展開需要的旅客區塊
    });


    // 清理不再需要的旅客區塊的展開狀態
    // 遍歷 *當前* 展開的區塊名稱 (從修改前的 activeCollapseNames 獲取)
    const previousActiveNames = activeCollapseNames.value || [];
    previousActiveNames.forEach(name => {
        // 只處理旅客區塊的名稱
        if (name.startsWith('travelers-')) {
            // 如果這個區塊在這次更新中不再是必需的，則從 Set 中移除
            if (!requiredTravelerSections.has(name)) {
                currentActiveNamesSet.delete(name);
            }
        }
    });


    formData.participantsByItem = newParticipantsByItem;    // 更新旅客資料結構
    // **將最終的 Set 轉換回陣列，並更新綁定到 v-model 的 ref**
    activeCollapseNames.value = Array.from(currentActiveNamesSet);

}, { deep: true }); // 使用 deep watch 來監聽數組內部元素的變化

// 監聽付款方式變化，自動展開電子發票區塊
watch(() => formData.paymentMethod, (newValue) => {
    if (newValue) { // 只要選擇了任何付款方式
        if (!activeCollapseNames.value.includes('einvoice')) {
          console.log("付款方式已選，自動展開電子發票區塊。");
          activeCollapseNames.value.push('einvoice');
        }
    }

});


// --- 生命週期鉤子 ---
onMounted(() => {
  // 元件掛載後，從 Pinia Store 加載需要結帳的商品
  loadOrderItems();
});

</script>

<style scoped>
  /* 整體頁面容器 */
  .order-form-page {
    /* background-color: #f5f7fa; */ /* 可選：設定頁面背景色 */
    padding-bottom: 40px; /* 頁面底部留白 */
  }

  /* 狀態容器 (載入、錯誤、空) */
  .status-container {
     max-width: 800px;
     margin: 40px auto;
     padding: 30px; /* 增加內邊距 */
     background-color: #fff;
     border-radius: 8px;
     box-shadow: var(--el-box-shadow-light, 0 2px 12px 0 rgba(0,0,0,0.1));
     text-align: center;
  }
  .status-actions {
    margin-top: 25px; /* 加大按鈕與提示信息的間距 */
    display: flex; /* 按鈕並排 */
    justify-content: center; /* 按鈕居中 */
    gap: 15px; /* 按鈕間距 */
  }

  /* 主要佈局容器 */
  .order-layout-container {
    display: flex;
    flex-wrap: wrap; /* 在小螢幕時允許換行 */
    gap: 30px; /* 左右列之間的間距 */
    align-items: flex-start;
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 15px;
  }

  /* 左側欄 */
  .left-column {
    flex: 2;
    min-width: 400px; /* 保持最小寬度 */
    display: flex;
    flex-direction: column;
    /* gap: 24px; */ /* <-- 移除 gap，改用 margin 控制間距 */
  }

  /* 右側欄 */
  .right-column {
    flex: 1;
    min-width: 300px;
    position: sticky;
    top: 160px; /* Sticky 定位的起始位置 */
    /* height: calc(100vh - 100px); */ /* 移除固定高度，讓它自適應內容 */
    /* overflow-y: auto; */ /* 移除內部滾動，讓頁面滾動 */
  }
  /* 如果右欄內容可能超長，可以考慮給 CostSummary 內部加滾動，而不是整個右欄 */


  /* --- el-collapse 基本樣式 --- */
  .order-collapse {
    border-top: none;  /* 移除 el-collapse 可能的頂部邊框 */
    border-bottom: none; /* 移除 el-collapse 可能的底部邊框 */
    /* --el-collapse-header-height: 58px; */ /* 可選：調整標題高度 */
    /* --el-collapse-border-color: transparent; */ /* 可選：完全移除邊框顏色 */
  }
  /* 移除 el-collapse item 之間的預設邊框（如果有的話）*/
  .order-collapse :deep(.el-collapse-item__header) {
      /* border-bottom: none; */ /* 通常展開時會有，保持即可 */
  }
   .order-collapse :deep(.el-collapse-item__wrap) {
      border-bottom: none; /* 移除內容區域的下邊框 */
  }


  /* 通用的 Section 卡片樣式 */
  /* 這個樣式現在應用在 AccordionSection 元件上，或直接應用在 el-collapse-item 外層(如果不用AccordionSection) */
  .section-card {
     background-color: #ffffff;
     border: 2px solid var(--el-border-color-light, #e4e7ed);
     border-radius: 10px;
     box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); /* 陰影效果 */
     overflow: hidden; /* 確保內容不超出圓角 */
     margin-bottom: 25px; /* <--- 新增：控制區塊之間的垂直間距 */
  }
  /* 移除左欄最後一個卡片的下邊距 */
  .left-column > *:last-child { /* 選中左欄的最後一個直接子元素 */
     margin-bottom: 0;
  }

  /* 備註區塊特定樣式 */
  .note-section {
     padding: 20px; /* 為備註區塊添加內邊距 */
     /* margin-bottom 已由 .section-card 控制 */
  }
  .note-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1em;
    color: var(--el-text-color-primary, #303133);
  }
  /* el-input textarea 會自帶 Element Plus 樣式 */


  /* 響應式調整 (保持不變) */
  @media (max-width: 992px) {
    .order-layout-container {
      flex-direction: column;
      gap: 20px;
    }
    .left-column,
    .right-column {
      flex: none;
      width: 100%;
      min-width: unset;
    }
    .right-column {
      position: static;
      height: auto;
      overflow-y: visible;
    }
    /* 在小螢幕，最後一個卡片也要有下邊距，除非它是頁面最後元素 */
     .left-column > *:last-child {
         margin-bottom: 25px; /* 在堆疊時恢復間距 */
     }
     .order-layout-container > *:last-child {
        margin-bottom: 0; /* 確保整個佈局的最後元素下方無間距 */
     }
  }

</style>