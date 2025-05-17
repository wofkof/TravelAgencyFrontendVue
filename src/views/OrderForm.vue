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
          <router-link to="/ShoppingCart">
            <el-button :icon="ShoppingCart">回到購物車</el-button>
          </router-link>
        </div>
    </div>

      <div v-else-if="!selectedOrderItems || selectedOrderItems.length === 0" class="status-container empty-container">
         <el-empty description="購物車中沒有選擇任何商品">
            <router-link to="/ShoppingCart">
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
                <ParticipantForm v-model="formData.ordererInfo" ref="ordererFormRef" />
              </AccordionSection>

              <AccordionSection
                v-for="(item) in selectedOrderItems.filter(i => getItemParticipantCount(i) > 0)"
                :key="item.id"
                :title="`旅客資料 - ${item.name}`"
                :section-name="`travelers-${item.id}`"
                class="section-card section-traveler"
                :data-section-name="`travelers-${item.id}`" >
                <ItemParticipantForm
                  v-if="formData.participantsByItem[item.id]"
                  :order-item="item"
                  v-model:participants="formData.participantsByItem[item.id]"
                  :trip-destination-country="item.destinationCountryCode"
                  :ref="el => { if (el) itemTravelerFormRefs[item.id] = el }"
                  @validity-changed="handleItemTravelerFormValidityChange(item.id, $event)" />
                <div v-else>此商品無需填寫旅客資料或資料載入異常。</div>
              </AccordionSection>

              <AccordionSection
                title="付款方式"
                section-name="payment"
                class="section-card section-payment"
                data-section-name="payment"
                ref="paymentAccordionRef"
              >
                <PaymentOptions
                  v-model="formData.paymentMethod"
                  v-model:creditCardInfo="formData.creditCardDetails" @creditCardFormValidityChanged="handleCreditCardFormValidityChange"
                   ref="paymentOptionsRef" />
              </AccordionSection>

              <AccordionSection
                title="電子發票 / 收據"
                section-name="einvoice"
                :is-disabled="!isPaymentMethodSelected"
                :tooltip-disabled="isPaymentMethodSelected ? '' : '請先選擇付款方式'"
                class="section-card section-einvoice"
                data-section-name="einvoice"
              >
                <EInvoiceForm v-model="formData.eInvoiceInfo" ref="einvoiceFormRef" />
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
                class="cost-summary-component"
                :order-items="selectedOrderItems"
                :orderer-status-message="ordererStatusMessage"
                :participants-status-message="participantsStatusMessage"
                :scroll-to-items="scrollToItemsSection"
                :is-orderer-basic-info-filled="isOrdererBasicInfoFilled"
                :are-all-participant-quantities-filled="areAllParticipantQuantitiesFilled"
                :all-travelers-valid="allTravelersValid" />
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
import { ref, reactive, computed, onMounted, watch, nextTick, onBeforeUpdate } from 'vue'; // 引入所有必要的 Composition API
import { useRouter } from 'vue-router'; // Vue Router
import { createOrder } from '@/utils/orderapi'; // API Service
import { useCartStore } from '@/stores/ShoppingCart'; // Pinia Store

// --- 引入 Element Plus 圖標 ---
// 只需要引入這個組件 *直接使用* 的 Icons
// 子組件中使用的 Icons 應該在子組件內部引入
import { RefreshRight, ShoppingCart } from '@element-plus/icons-vue';

// 引入國際化庫和語言包 (通常在 main.js 全局做一次)
import countries from 'i18n-iso-countries';
import zhLocale from '/zh-tw.json'; // 確認路徑正確

// --- 引入子元件 ---
// 確保這些子元件的路徑正確
import AccordionSection from '@/components/OrderForm/AccordionSection.vue';
import OrderItemsDisplay from '@/components/OrderForm/OrderItemsDisplay.vue';
import ParticipantForm from '@/components/OrderForm/ParticipantForm.vue';
import ItemParticipantForm from '@/components/OrderForm/ItemParticipantForm.vue';
import PaymentOptions from '@/components/OrderForm/PaymentOptions.vue';
import EInvoiceForm from '@/components/OrderForm/EInvoiceForm.vue';
import CostSummary from '@/components/OrderForm/CostSummary.vue';

// --- 狀態管理 ---
const router = useRouter(); // Vue Router 實例
const cartStore = useCartStore(); // Pinia 購物車 Store
const orderFormRef = ref(null); // 原生 form 元素的引用 (如果需要直接操作原生 form)
const isLoading = ref(true); // 載入狀態
const error = ref(null); // 載入錯誤訊息
const isSubmitting = ref(false); // 提交狀態
const submitError = ref(null); // 提交錯誤訊息
const submitSuccess = ref(false); // 提交成功狀態
const createdOrderId = ref(null); // 創建的訂單 ID
const selectedOrderItems = ref([]); // 從購物車 Store 加載的選中商品列表

// 子組件表單的引用
const ordererFormRef = ref(null); // ParticipantForm 實例引用
const itemTravelerFormRefs = ref({}); // ItemParticipantForm 實例引用物件 (key: item.id, value: ItemParticipantForm 實例)
const einvoiceFormRef = ref(null); // EInvoiceForm 實例引用
const paymentOptionsRef = ref(null); // PaymentOptions 實例引用 (用於呼叫其 validate 方法，如果暴露)

// ItemParticipantForm 的驗證狀態集合 (key: item.id, value: boolean)
const itemTravelerValidity = reactive({});


// --- Accordion (手風琴) 狀態管理 ---
// 控制哪些 AccordionSection 區塊是展開的
const activeCollapseNames = ref(['items', 'ordererInfo', 'payment']); // 預設展開 商品、訂購人、付款方式 區塊

// 獲取 PaymentOptions 所在 AccordionSection 的引用 (用於滾動，也可以用 data-section-name 查找)
const paymentAccordionRef = ref(null); // 在模板中綁定到 PaymentOptions 所在 AccordionSection


// --- 表單數據模型 (使用 reactive) ---
// 集中管理所有子組件表單的數據
const formData = reactive({
  memberId: 11110, // 會員 ID，通常從登入狀態獲取
  note: '', // 訂單備註 (直接綁定到 el-input)
  // 訂購人資料 (ParticipantForm v-model 綁定)
  ordererInfo: {
    firstName: '', lastName: '', country: 'TW', countryCode: '+886',
    phoneNumber: '', email: '', updateProfile: false,
    documentType: 'ID_CARD_TW', documentNumber: ''
  },
  // 旅客資料 (按商品分組，ItemParticipantForm v-model 綁定對應的陣列)
  participantsByItem: {},
  // 付款方式 (PaymentOptions v-model 綁定)
  paymentMethod: null,
  // 電子發票資訊 (EInvoiceForm v-model 綁定)
  eInvoiceInfo: {
    type: 'personal', taxId: '', companyTitle: '', deliveryEmail: ''
  },
  // 信用卡詳細資料 (PaymentOptions 內部 CreditCardForm v-model 綁定)
  creditCardDetails: {
    cardHolderName: '', cardNumber: '', expiryMonth: '', expiryYear: '', cvc: ''
  }
});

// --- 計算屬性 (Computed Properties) ---

// 判斷付款方式是否已選擇
const isPaymentMethodSelected = computed(() => !!formData.paymentMethod);

// 追蹤信用卡表單自身的驗證狀態 (從 PaymentOptions 通過事件傳遞上來)
const isCreditCardFormValid = ref(false);
const handleCreditCardFormValidityChange = (isValid) => {
  isCreditCardFormValid.value = isValid;
};


// 計算訂單商品總 "單位" 數量 (例如總票數)
const selectedItemsTotalQuantity = computed(() => {
    return selectedOrderItems.value.reduce((totalQty, item) => {
        return totalQty + getItemParticipantCount(item); // 使用輔助函數計算單項數量
    }, 0);
});

// 計算訂單總金額 (使用 cartStore 的方法)
const totalAmount = computed(() => {
  return selectedOrderItems.value.reduce((sum, item) => {
    return sum + cartStore.calculateItemTotal(item);
  }, 0);
});

// 判斷訂購人資料是否已填寫基本資訊 (簡易檢查，更嚴謹應通過子組件驗證方法判斷)
const isOrdererBasicInfoFilled = computed(() => {
   const orderer = formData.ordererInfo;
   // 這裡根據你在 ParticipantForm 中的必填欄位做簡易判斷
   return !!orderer.firstName && !!orderer.lastName && !!orderer.country && !!orderer.phoneNumber && !!orderer.email;
});

// 計算已填寫旅客資料的數量 (簡單計數陣列長度，不檢查內容是否有效)
const filledParticipantsCount = computed(() => {
    return Object.values(formData.participantsByItem).reduce((total, paxArray) => total + (paxArray?.length || 0), 0);
});

// 檢查所有需要旅客資料的商品，其旅客陣列長度是否已滿足預期數量
const areAllParticipantQuantitiesFilled = computed(() => {
     return selectedOrderItems.value.every(item => {
         const expectedCount = getItemParticipantCount(item);
         // 如果商品不需要旅客 (expectedCount === 0)，則視為數量已滿足
         if (expectedCount === 0) return true;
         // 否則，檢查對應的旅客陣列是否存在且長度等於預期數量
         const actualArray = formData.participantsByItem[item.id];
         return actualArray && actualArray.length === expectedCount;
     });
});

// 判斷所有需要旅客資料的 ItemParticipantForm 是否都通過了自身的驗證
const allTravelersValid = computed(() => {
    // 找出所有需要旅客資料的商品 ID
    const itemIdsWithTravelers = selectedOrderItems.value
        .filter(item => getItemParticipantCount(item) > 0)
        .map(item => item.id);

    // 如果沒有需要旅客資料的商品，則視為驗證通過
    if (itemIdsWithTravelers.length === 0) {
        return true;
    }

    // 檢查每個需要旅客資料的商品 ID，在 itemTravelerValidity 中對應的狀態是否為 true
    return itemIdsWithTravelers.every(itemId => itemTravelerValidity[itemId] === true);
});


// 計算屬性：訂購人資料狀態訊息 (顯示在 CostSummary 中)
const ordererStatusMessage = computed(() => {
   // 更精確的狀態判斷應該結合 ParticipantForm 的驗證結果 (如果 ParticipantForm 暴露了狀態)
   // 但目前先使用簡易檢查狀態
   return isOrdererBasicInfoFilled.value ? '訂購人資料已填寫' : '請填寫訂購人資料';
});

// 計算屬性：旅客資料狀態訊息 (顯示在 CostSummary 中)
const participantsStatusMessage = computed(() => {
     const totalExpected = selectedItemsTotalQuantity.value;
     // 如果沒有需要旅客資料的商品，直接返回無需填寫訊息
     if (totalExpected === 0) {
         return '此訂單無需填寫旅客資料';
     }

     const totalFilledSlots = filledParticipantsCount.value;

     // 如果所有商品的旅客數量都已填滿
     if (areAllParticipantQuantitiesFilled.value) {
         // 如果所有 ItemParticipantForm 都通過了自身的驗證
         if (allTravelersValid.value) {
              return `共 ${totalExpected} 位旅客資料已完成`; // 數量對且驗證通過
         } else {
             // 數量對但有 ItemParticipantForm 驗證未通過 (表示有錯誤)
              return `共 ${totalExpected} 位旅客資料有誤，請檢查`;
         }
     } else {
         // 顯示已填寫數量和總數，表示待填寫
         return `共 ${totalFilledSlots} / ${totalExpected} 位旅客資料待填寫`;
     }
});


// 判斷結帳按鈕是否應禁用 (包含更完整的簡易檢查)
const isCheckoutButtonDisabled = computed(() => {
    // 基礎檢查：是否正在提交、是否有選中商品、是否選了付款方式
    if (isSubmitting.value || selectedOrderItems.value.length === 0 || !isPaymentMethodSelected.value) {
        // console.log("禁用原因: 基礎檢查失敗");
        return true;
    }
    // 檢查訂購人資料基本資訊是否已填寫 (簡易檢查)
    if (!isOrdererBasicInfoFilled.value) {
        // console.log("禁用原因: 訂購人基本資料未填寫");
        return true;
    }
    // 檢查所有需要旅客資料的商品，其旅客陣列長度是否已填滿
    if (!areAllParticipantQuantitiesFilled.value) {
        // console.log("禁用原因: 旅客數量未填滿");
        return true;
    }
    // 檢查所有 ItemParticipantForm 是否都通過了自身的驗證
    if (!allTravelersValid.value) {
        // console.log("禁用原因: 旅客資料驗證失敗");
        return true;
    }
     // 如果選擇了信用卡支付，則信用卡表單必須有效 (從 PaymentOptions 通過事件傳遞狀態)
     if (formData.paymentMethod && formData.paymentMethod.endsWith('CreditCard')) {
       if (!isCreditCardFormValid.value) {
         // console.log("禁用原因: 信用卡表單無效");
         return true;
       }
     }

    // 只有當以上所有簡易檢查都通過，按鈕才不被禁用 (但最終提交前仍需要呼叫所有子組件的 validate 方法來執行嚴謹驗證)
    // console.log("禁用狀態: false (通過簡易檢查)");
    return false; // 通過簡易檢查，按鈕啟用
});


// --- 方法 (Methods) ---

// 滾動到指定的區塊並展開
const scrollToSection = (sectionName) => {
     const sectionElement = document.querySelector(`[data-section-name="${sectionName}"]`);
     if (sectionElement) {
         const headerElement = sectionElement.querySelector('.el-collapse-item__header');
         const targetElement = headerElement || sectionElement;

         targetElement.scrollIntoView({ behavior: 'smooth', block: sectionName === 'items' ? 'start' : 'center' }); // 商品區塊滾動到頂部，其他滾動到中間

         // 確保目標區塊是展開的
         if (!activeCollapseNames.value.includes(sectionName)) {
               nextTick(() => { // 在滾動後或 DOM 更新後展開
                   activeCollapseNames.value.push(sectionName);
               });
         }
     } else {
         console.warn(`無法找到 data-section-name='${sectionName}' 的區塊元素進行滾動。`);
     }
};


// 滾動到訂單商品區塊並展開 (使用通用滾動方法)
const scrollToItemsSection = () => {
    scrollToSection('items');
};

// 滾動到付款方式區塊並展開 (使用通用滾動方法)
const scrollToPaymentOptions = () => {
    scrollToSection('payment');
};

// 處理 ItemParticipantForm 發出的 validity-changed 事件
const handleItemTravelerFormValidityChange = (itemId, isValid) => {
    // 更新對應商品 ID 的旅客表單驗證狀態
    itemTravelerValidity[itemId] = isValid;
     console.log(`ItemParticipantForm (${itemId}) validity changed: ${isValid}`);
};


// 輔助函式：計算單個商品需要填寫的旅客數量 (使用數字類型，預設0)
const getItemParticipantCount = (item) => {
    if (item?.participantRequired === false) {
        return 0;
    }
    let quantity = 0;
    if (item.options && item.options.length > 0) {
        // 確保 quantity 是數字
        quantity = item.options.reduce((sum, option) => sum + (Number(option.quantity) || 0), 0);
    } else if (item.quantity !== undefined) {
        // 確保 quantity 是數字
        quantity = Number(item.quantity) || 0;
    }
    return quantity;
};

// 從 Pinia Store 加載已選中的購物車商品
const loadOrderItems = () => {
  console.log("載入訂單商品...");
  isLoading.value = true;
  error.value = null;
  try {
    const itemsFromStore = cartStore.selectedItems;
    console.log("從 Store 獲取的商品:", itemsFromStore);

    // 深拷貝一份數據，避免後續操作意外修改 store 狀態
    // TODO: 如果商品結構複雜 (例如嵌套響應式對象)，JSON.parse(JSON.stringify) 可能不足夠，可以考慮 lodash.cloneDeep
    selectedOrderItems.value = JSON.parse(JSON.stringify(itemsFromStore));

    if (selectedOrderItems.value.length === 0) {
      console.warn("購物車中沒有選擇任何商品進行結帳。");
    }
    isLoading.value = false;
  } catch (err) {
    console.error("從 Pinia Store 加載訂單商品時出錯:", err);
    error.value = '讀取購物車狀態時發生錯誤，請稍後再試。';
    isLoading.value = false;
  }
};

// 提交訂單 - **重要：在提交前需要觸發所有子表單的驗證**
const submitOrder = async () => {
    // 檢查按鈕是否已被禁用 (避免重複點擊)
    if (isCheckoutButtonDisabled.value || isSubmitting.value) {
        console.warn("提交按鈕被禁用或正在提交中。");
        // ElMessage.warning("請檢查表單是否填寫完整或正在提交中。");
        return;
    }

    isSubmitting.value = true; // 設定提交狀態
    submitError.value = null; // 清除上次的提交錯誤

    console.log("開始訂單提交前嚴謹驗證...");

    try {
        let isFormValid = true; // 總體表單驗證結果

        // --- **觸發所有子表單的嚴謹驗證** ---

        // 1. 訂購人表單驗證 (ParticipantForm 暴露了 validateForm 方法)
        if (ordererFormRef.value && ordererFormRef.value.validateForm) {
             const ordererValid = await ordererFormRef.value.validateForm();
             if (!ordererValid) {
                 console.log("訂購人表單驗證失敗");
                 isFormValid = false;
                 // 滾動到訂購人區塊並展開
                 scrollToSection('ordererInfo');
                 // 可以添加提示給用戶
                 // ElMessage.error("請檢查訂購人資料。");
             }
        } else {
             // 如果 ParticipantForm 引用不存在或未暴露 validateForm 方法，視為驗證失敗
             console.error("無法獲取 ParticipantForm 引用或其 validateForm 方法。訂購人驗證失敗。");
             isFormValid = false; // 訂購人驗證是必須的
        }

        // 如果訂購人驗證失敗，停止後續驗證和提交
        if (!isFormValid) {
             isSubmitting.value = false;
             return;
        }
        console.log("訂購人表單驗證通過");


        // 2. 所有商品旅客資料表單驗證 (ItemParticipantForm 暴露了 validateAll 方法)
        // 遍歷 itemTravelerFormRefs.value 物件中所有 ItemParticipantForm 實例的引用
        const itemTravelerFormInstances = Object.values(itemTravelerFormRefs.value); // 獲取所有 ItemParticipantForm 實例的陣列
        for (const formInstance of itemTravelerFormInstances) {
            // 檢查引用是否存在且暴露了 validateAll 方法
            // 並且只有當這個 ItemParticipantForm 應該顯示時才進行驗證 (由模板中的 v-if 控制)
            // 這裡可以再加一層檢查，確保這個 ItemParticipantForm 對應的商品確實需要旅客資料
            const relatedItem = selectedOrderItems.value.find(item => item.id === formInstance.orderItem?.id);
            // 如果商品需要旅客且 ItemParticipantForm 引用存在並暴露了 validateAll
            if (relatedItem && getItemParticipantCount(relatedItem) > 0 && formInstance && formInstance.validateAll) {
                 console.log(`觸發商品旅客資料表單 (${relatedItem.id}) 驗證...`);
                 const valid = await formInstance.validateAll(); // validateAll 應返回 Promise<boolean>
                 if (!valid) {
                     const itemId = formInstance.orderItem?.id; // 嘗試從 ItemParticipantForm 獲取商品 ID
                     console.log(`商品旅客資料表單 (${itemId || '未知'}) 驗證失敗`);
                     isFormValid = false;
                     // 滾動到對應的旅客區塊並展開
                     scrollToSection(`travelers-${itemId}`);
                     // ElMessage.error(`請檢查商品 "${formInstance.orderItem?.name || '未知商品'}" 的旅客資料。`);
                     break; // 通常找到第一個錯誤就停止後續旅客表單的驗證
                 }
            } else if (relatedItem && getItemParticipantCount(relatedRelatedItem) > 0) {
                 // 如果這個商品需要旅客資料，但無法獲取 ItemParticipantForm 引用或其 validateAll 方法
                 console.error(`無法獲取 ItemParticipantForm 引用或其 validateAll 方法 (${relatedItem.id})。旅客驗證失敗。`);
                 isFormValid = false; // 旅客驗證是必須的
                 // 可選：滾動到對應區塊提示用戶
                 scrollToSection(`travelers-${relatedItem.id}`);
                 // ElMessage.error(`無法驗證商品 "${relatedItem.name}" 的旅客資料。請檢查。`);
                 break; // 停止驗證
            }
             // 如果商品不需要旅客資料 (getItemParticipantCount <= 0)，則跳過此 ItemParticipantForm 的驗證
        }

         // 如果旅客驗證失敗，停止後續驗證和提交
        if (!isFormValid) {
             isSubmitting.value = false;
             return;
        }
        console.log("所有商品旅客資料表單驗證通過");


         // 3. 電子發票表單驗證 (EInvoiceForm 暴露了 validate 方法)
         // 檢查 einvoiceFormRef 引用是否存在且暴露了 validate 方法
         // 並且只有當電子發票區塊不是禁用狀態時才進行驗證
         const isEinvoiceSectionDisabled = computed(() => !isPaymentMethodSelected.value); // 定義電子發票區塊的禁用狀態
         if (!isEinvoiceSectionDisabled.value) { // 如果電子發票區塊未禁用
             if (einvoiceFormRef.value && einvoiceFormRef.value.validate) {
                console.log("觸發電子發票表單驗證...");
                const valid = await einvoiceFormRef.value.validate();
                if (!valid) {
                    console.log("電子發票表單驗證失敗");
                    isFormValid = false;
                    // 滾動到發票區塊並展開
                    scrollToSection('einvoice');
                    // ElMessage.error("請檢查電子發票資料。");
                }
             } else {
                  // 如果電子發票區塊未禁用，但無法獲取引用或其 validate 方法
                  console.error("無法獲取 EInvoiceForm 引用或其 validate 方法。電子發票驗證失敗。");
                  isFormValid = false; // 發票驗證是必須的 (當未禁用時)
                  // 可選：滾動到發票區塊提示用戶
                  scrollToSection('einvoice');
                  // ElMessage.error("無法驗證電子發票資料。請檢查。");
             }
         } else {
             // 如果電子發票區塊是禁用狀態，則視為驗證通過
             console.log("電子發票區塊已禁用，跳過驗證。");
         }


         // 如果電子發票驗證失敗，停止後續驗證和提交
        if (!isFormValid) {
             isSubmitting.value = false;
             return;
        }
        console.log("電子發票表單驗證通過");


         // 4. 付款方式/信用卡表單驗證 (PaymentOptions 暴露 validate 方法，或直接檢查狀態)
         // 檢查 paymentOptionsRef 引用是否存在且暴露 validate 方法
         // 或者直接檢查 isCreditCardFormValid 狀態 (如果選擇了信用卡)
         // 這裡使用檢查 isCreditCardFormValid 狀態的方式，因為 PaymentOptions 主要通過這個狀態匯報信用卡驗證結果
         if (formData.paymentMethod && formData.paymentMethod.endsWith('CreditCard')) {
             // 如果選擇了信用卡支付方式，直接檢查 isCreditCardFormValid 狀態
             if (!isCreditCardFormValid.value) {
                 console.log("信用卡表單驗證失敗 (狀態無效)");
                 isFormValid = false;
                 // 滾動到付款區塊並展開
                 scrollToSection('payment');
                 // ElMessage.error("請檢查信用卡資料。");
             } else {
                  console.log("信用卡表單驗證通過 (狀態有效)");
             }
         } else {
              // 如果沒有選擇信用卡支付，或者選擇了非信用卡支付方式，則付款方式驗證視為通過
              console.log("未選擇信用卡支付，或選擇非信用卡支付，付款方式驗證視為通過");
         }

        // 如果付款方式驗證失敗，停止後續提交
        if (!isFormValid) {
             isSubmitting.value = false;
             return;
        }
        console.log("付款方式/信用卡表單驗證通過");


        // --- 執行嚴謹驗證後的最終判斷 ---
        // 如果所有子表單驗證都通過 (isFormValid 仍然是 true)
        if (!isFormValid) {
             // 這個判斷其實在每個驗證步驟後都做了 return，這裡作為一個最終的雙重檢查
             console.error("總體表單驗證失敗，停止提交。");
             // 可以在這裡添加一個總體的錯誤提示
             // ElMessage.error("請檢查所有必填欄位和格式是否正確。");
             isSubmitting.value = false;
             return;
        }

        console.log("所有表單嚴謹驗證通過。準備提交數據...");

        // --- 準備 API Payload (這部分邏輯應正確映射所有 formData 的數據) ---
        // 1. 準備訂購人資訊
        const preparedOrdererInfo = {
            // 確保這裡的欄位名稱和數據格式與後端 API 要求的 OrdererInfoDto 一致
            Name: `${formData.ordererInfo.lastName || ''}${formData.ordererInfo.firstName || ''}`.trim(),
            MobilePhone: `${formData.ordererInfo.countryCode || ''}${formData.ordererInfo.phoneNumber || ''}`.replace(/\s/g, ''),
            Email: formData.ordererInfo.email || null,
            // 添加 ParticipantForm 中收集的更多訂購人資訊
            //  documentType: formData.ordererInfo.documentType, // 添加證件類型
            //  idNumber: formData.ordererInfo.documentNumber, // 添加證件號碼
            //  nationality: formData.ordererInfo.country, // 添加國籍
        };

        // 2. 準備旅客列表
        // 遍歷 formData.participantsByItem 中的每個商品對應的旅客陣列
        const preparedParticipants = Object.values(formData.participantsByItem).flat().map(paxData => {
            // 確保這裡的欄位名稱和數據格式與後端 API 要求的 OrderParticipantDto 一致
            // 映射 ItemParticipantForm 的數據到後端 DTO
             let backendDocumentType = null;
             switch (paxData.documentType) {
                 case 'ID_CARD_TW': backendDocumentType = 0; break;
                 case 'PASSPORT': backendDocumentType = 1; break;
                 case 'ARC': backendDocumentType = 2; break;
                 case 'ENTRY_PERMIT': backendDocumentType = 3; break;
                 default: backendDocumentType = null; // 處理未知類型
             }
             let backendGender = null;
             switch (paxData.gender) {
                 case 'male': backendGender = 0; break;
                 case 'female': backendGender = 1; break;
                 case 'other': backendGender = 2; break;
                 default: backendGender = null; // 處理未知性別
             }

            return {
                 // 這些欄位需要根據後端 OrderParticipantDto 的實際定義來映射
                 // favoriteTravelerId: paxData.selectedFrequentTraveler || null, // 如果後端 DTO 需要這個
                 // memberIdAsParticipant: paxData.memberIdAsParticipant || null, // 如果旅客本身就是會員，這裡需要會員 ID
                 Name: `${paxData.lastNameZh || ''}${paxData.firstNameZh || ''}`.trim(), // 中文姓名
                 BirthDate: paxData.birthDate, // "YYYY-MM-DD"
                 IdNumber: paxData.idNumber, // 主要證件號碼 (身分證或居留證等)
                 Gender: backendGender, // 性別 Enum 值
                 // 假設 ItemParticipantForm 收集了電話和 email
                 Phone: paxData.phoneNumber || '', // 電話
                 Email: paxData.email || '', // Email
                 DocumentType: backendDocumentType, // 證件類型 Enum 值
                 // documentNumber: paxData.idNumber, // 如果後端 DTO 需要證件號碼欄位，通常和 idNumber 相同
                 PassportSurname: paxData.lastNameEn || '', // 護照英文姓
                 PassportGivenName: paxData.firstNameEn || '', // 護照英文名
                 PassportExpireDate: paxData.passportExpiryDate || null, // 護照效期 "YYYY-MM-DD"
                 Nationality: paxData.country, // 國籍 (ISO 3166-1 Alpha-2 Code, e.g., 'TW')
                 Note: paxData.remarks || '' // 備註
            };
        });


        // 3. 準備發票請求資訊
        let backendInvoiceOption = 0; // 預設個人
        switch (formData.eInvoiceInfo.type) {
            case 'personal': backendInvoiceOption = 0; break;
            case 'company': backendInvoiceOption = 1; break;
            // case 'donation': backendInvoiceOption = 2; break;
            default: backendInvoiceOption = 0; // 處理未知類型
        }

        const preparedInvoiceRequestInfo = {
            // 確保這裡的欄位名稱和數據格式與後端 API 要求的 OrderInvoiceRequestDto 一致
            InvoiceOption: backendInvoiceOption,
            InvoiceDeliveryEmail: formData.eInvoiceInfo.deliveryEmail || formData.ordererInfo.email, // 使用 EInvoiceForm 中的 deliveryEmail 或訂購人 email
            InvoiceUniformNumber: formData.eInvoiceInfo.type === 'company' ? formData.eInvoiceInfo.taxId : null,
            InvoiceTitle: formData.eInvoiceInfo.type === 'company' ? formData.eInvoiceInfo.companyTitle : null,
            InvoiceAddBillingAddr: formData.eInvoiceInfo.addBillingAddress || false, // 如果有這個欄位
            InvoiceBillingAddress: formData.eInvoiceInfo.addBillingAddress ? (formData.eInvoiceInfo.billingAddress || null) : null // 如果有這個欄位
        };

        // 4. 準備選擇的付款方式
         let backendSelectedPaymentMethod = 0; // 預設一個值
         switch (formData.paymentMethod) {
             // 確保這裡的 case 值與 PaymentOptions.vue 中定義的 value 對應
             // 確保後端 Enum 值正確
             case 'NewebPay_CreditCard': backendSelectedPaymentMethod = 0; break;
             case 'ECPay_CreditCard': backendSelectedPaymentMethod = 0; break; // 如果後端不區分具體信用卡金流，可以都映射到信用卡 Enum
             case 'BankTransfer': backendSelectedPaymentMethod = 1; break;
             case 'LINEPay': backendSelectedPaymentMethod = 2; break; // 假設後端 2 是 LINE Pay 或其他
             default:
                 console.warn("未知的支付方式:", formData.paymentMethod);
                 backendSelectedPaymentMethod = 2; // 處理未知情況
                 break;
         }


        // 組合最終 API Payload
        const orderPayload = {
            // memberId: formData.memberId, // 通常由後端處理
            totalAmount: totalAmount.value,
            orderNotes: formData.note,
            ordererInfo: preparedOrdererInfo,
            participants: preparedParticipants, // 扁平化的旅客陣列
            invoiceRequestInfo: preparedInvoiceRequestInfo,
            selectedPaymentMethod: backendSelectedPaymentMethod,
            // orderDetails: [], // 商品明細通常不由前端在創建訂單時傳送，後端應根據購物車商品創建
        };

        console.log("準備提交的訂單 Payload:", JSON.stringify(orderPayload, null, 2));

        // --- 調用 API 提交訂單 ---
        const response = await createOrder(orderPayload);
        console.log('訂單創建成功:', response);

        createdOrderId.value = response.data?.orderId;
        submitSuccess.value = true;

        // 清空購物車中已結帳的商品
        const submittedItemIds = selectedOrderItems.value.map(item => item.id);
        cartStore.removeItemsByIds(submittedItemIds);

        // 跳轉到訂單完成頁面
        router.push({ path: '/order-complete', query: { orderId: createdOrderId.value } });

    } catch (err) {
        console.error('訂單提交失敗:', err);
        submitError.value = err.response?.data?.message || err.message || '發生未知錯誤，請稍後再試。';
        // 顯示錯誤提示 (例如使用 ElMessage)
        // ElMessage.error(`訂單提交失敗: ${submitError.value}`);

    } finally {
        isSubmitting.value = false; // 結束提交狀態
    }
};

// 在組件更新之前清理 ItemParticipantForm 的 refs
// 這是因為 v-for 中的元素可能會被移除，舊的 ref 引用需要清理
onBeforeUpdate(() => {
  // 清空 refs 物件
  itemTravelerFormRefs.value = {};
});


// --- Watchers (監聽器) ---

// 監聽從 Store 獲取的 selectedOrderItems 變化，自動初始化/更新旅客資料區塊
watch(selectedOrderItems, (newItems) => {
    // 這裡的邏輯負責根據新的商品列表，初始化或更新 formData.participantsByItem 的結構
    // 它會保留現有數據，並為新增的旅客創建預設數據
    console.log("監聽到 selectedOrderItems 變化，更新旅客表單結構和 Collapse 狀態");

    const newParticipantsByItem = {}; // 用於構建新的旅客數據結構
    const currentActiveNamesSet = new Set(activeCollapseNames.value); // 用於維護展開狀態
    const requiredTravelerSections = new Set(); // 記錄本次更新後需要保留展開的旅客區塊 section-name
    const newItemIdsWithTravelers = new Set(); // 記錄本次更新後需要旅客資料的商品 ID

    newItems.forEach(item => {
        const expectedCount = getItemParticipantCount(item);
        const sectionName = `travelers-${item.id}`;

        // 如果商品不需要旅客，確保在新的結構中存在對應的 key 但值為空陣列
        // 同時移除其展開狀態
        if (expectedCount === 0) {
             newParticipantsByItem[item.id] = [];
             currentActiveNamesSet.delete(sectionName);
             // 確保移除 itemTravelerValidity 中對應的狀態
             delete itemTravelerValidity[item.id];
             return;
        }

        // 如果需要旅客資料，標記這個旅客區塊是需要的，並確保其展開狀態被保留
        requiredTravelerSections.add(sectionName);
        currentActiveNamesSet.add(sectionName); // 預設保留展開或展開新的需要旅客的區塊
        newItemIdsWithTravelers.add(item.id); // 記錄需要旅客的商品 ID

        // 從現有數據中獲取或創建新的旅客物件
        const existingPaxs = formData.participantsByItem[item.id] || [];
        const currentPaxs = [];
        for (let i = 0; i < expectedCount; i++) {
            currentPaxs.push(existingPaxs[i] || {
                 // 使用更完整的預設值，與 ItemParticipantForm 的數據結構一致
                 id: `pax-${item.id}-${i}-${Date.now()}`, // 為新創建的旅客提供一個臨時 ID
                 selectedFrequentTraveler: null,
                 country: formData.ordererInfo.country || 'TW',
                 firstNameZh: '', lastNameZh: '',
                 firstNameEn: '', lastNameEn: '',
                 gender: null,
                 birthDate: null,
                 idNumber: '',
                 passportNumber: '',
                 passportExpiryDate: null,
                 remarks: '',
                 // 添加電話和 Email 預設值
                 phoneNumber: '',
                 email: '',
                 countryCode: '+886',
                 documentType: 'ID_CARD_TW',
                 // 可以考慮是否自動填充訂購人資訊到第一個旅客
                 // ...(i === 0 && isOrdererBasicInfoFilled.value ? { ...formData.ordererInfo } : {})
            });
        }
        newParticipantsByItem[item.id] = currentPaxs;

        // 初始化或保留 ItemParticipantForm 的驗證狀態為 false (待驗證)
        // 如果之前已經有這個商品的驗證狀態，保留它
        if (itemTravelerValidity[item.id] === undefined) {
             itemTravelerValidity[item.id] = false; // 預設為未通過驗證
        }
    });

    // 清理不再需要旅客的商品在 formData 和 activeCollapseNames 中的狀態
    for (const itemId in formData.participantsByItem) {
         if (!newItemIdsWithTravelers.has(itemId)) { // 檢查新的需要旅客的商品 ID 集合中是否包含這個 key
             delete formData.participantsByItem[itemId]; // 從 formData 中移除數據
             const sectionName = `travelers-${itemId}`;
             currentActiveNamesSet.delete(sectionName); // 從展開狀態中移除
             // 確保移除 itemTravelerValidity 中對應的狀態
             delete itemTravelerValidity[itemId];
         }
    }

    // 將構建好的新旅客數據結構賦予給 formData.participantsByItem (確保響應性)
    // 使用 Object.assign 或一個新的對象來替換整個 property 是確保響應性的方法
    Object.assign(formData.participantsByItem, newParticipantsByItem);
    // 如果 newParticipantsByItem 的 key 少於原來的，需要手動刪除舊的 key (已在上面處理)


    // 更新綁定到 v-model 的 AccordionSection 展開狀態
    activeCollapseNames.value = Array.from(currentActiveNamesSet);

}, { immediate: true, deep: true }); // immediate 在組件掛載時立即執行一次，deep 監聽陣列內部變化


// 監聽付款方式變化，自動展開/收起電子發票區塊 (使用通用滾動方法)
watch(() => formData.paymentMethod, (newValue) => {
    const einvoiceSectionName = 'einvoice';
    if (newValue) { // 只要選擇了任何付款方式
        // 自動展開電子發票區塊
        if (!activeCollapseNames.value.includes(einvoiceSectionName)) {
           nextTick(() => {
               activeCollapseNames.value.push(einvoiceSectionName);
           });
        }
         // 可選：滾動到發票區塊
         // scrollToSection(einvoiceSectionName);
    } else {
        // 如果取消選擇付款方式，收起發票區塊
        const index = activeCollapseNames.value.indexOf(einvoiceSectionName);
        if (index > -1) {
             activeCollapseNames.value.splice(index, 1);
        }
         // 可選：清除發票區塊的數據 (如果取消支付方式意味著發票信息也無效)
         // formData.eInvoiceInfo = { type: 'personal', taxId: '', companyTitle: '', deliveryEmail: '' };
    }
});

// 監聽 isCreditCardFormValid 變化 (從 PaymentOptions 通過事件傳遞)
// 當信用卡表單無效時，可以考慮提供一些視覺回饋，例如滾動到付款區塊或發出警告
// watch(isCreditCardFormValid, (isValid) => {
//      if (!isValid && formData.paymentMethod && formData.paymentMethod.endsWith('CreditCard')) {
//           console.warn("信用卡表單無效");
//           // 可選：滾動到付款區塊
//           // scrollToSection('payment');
//           // 可選：顯示警告
//           // ElMessage.warning("請檢查信用卡資料。");
//      }
// });


// --- 生命週期鉤子 ---
onMounted(() => {
  // 元件掛載後，從 Pinia Store 加載需要結帳的商品
  loadOrderItems();
});

</script>

<style scoped>
  /* 整體頁面容器 */
  .order-form-page {
    /* 使用 Element Plus 背景色變數 */
    /* background-color: var(--el-fill-color-extra-light); */
    padding-bottom: 40px;
  }

  /* 狀態容器 (載入、錯誤、空) */
  .status-container {
      max-width: 800px;
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

  /* 主要佈局容器 */
  .order-layout-container {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    align-items: flex-start;
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 15px;
  }

  /* 左側欄 */
  .left-column {
    flex: 2;
    min-width: 400px; /* 確保在較寬螢幕下有足夠寬度 */
    display: flex;
    flex-direction: column;
    /* 使用 margin-bottom 控制 AccordionSection 和 note-section 之間的間距 */
    /* gap: 24px; */
  }

  /* 右側欄 */
  .right-column {
    flex: 1;
    min-width: 300px; /* 確保在較寬螢幕下有足夠寬度 */
    position: sticky;
    top: 160px; /* 調整 sticky 的起始位置，考慮到頂部導航或 Header */
  }


  /* --- el-collapse 基本樣式 (使用 Element Plus 變數) --- */
  .order-collapse {
    border-top: none;
    border-bottom: none;
  }
   .order-collapse :deep(.el-collapse-item__header) {
       /* 可選：自訂 header 樣式 */
       /* border-bottom: 1px solid var(--el-border-color-light); */
       /* background-color: var(--el-fill-color-light); */
       font-weight: var(--el-font-weight-primary);
   }
    .order-collapse :deep(.el-collapse-item__wrap) {
      border-bottom: none;
   }
    .order-collapse :deep(.el-collapse-item__content) {
       padding-bottom: 15px; /* 調整內容底部內邊距 */
       /* background-color: var(--el-fill-color-extra-light); */ /* 可選：內容區域背景色 */
   }


  /* 通用的 Section 卡片樣式 (使用 Element Plus 變數) */
  /* 這個樣式應用在 AccordionSection 外層 div */
  .section-card {
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color-light); /* 使用細一點的邊框 */
      border-radius: var(--el-border-radius-base);
      box-shadow: var(--el-box-shadow); /* 使用稍重一點的陰影 */
      overflow: hidden;
      margin-bottom: 25px; /* 控制區塊之間的垂直間距 */
      /* 注意：AccordionSection 內部也可能需要 padding */
  }
  /* 移除左欄最後一個卡片的下邊距 */
  .left-column > *:last-child {
      margin-bottom: 0;
  }

  /* 備註區塊特定樣式 */
  .note-section {
      padding: 20px;
  }
  .note-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1em;
    color: var(--el-text-color-primary);
    font-weight: var(--el-font-weight-primary);
  }


  /* 響應式調整 */
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
     /* 在小螢幕，左側最後一個卡片下方應該有間距 */
     .left-column > *:last-child {
          margin-bottom: 25px;
     }
      /* 確保整個佈局容器的最後一個元素下方沒有間距 */
      .order-layout-container > *:last-child {
        margin-bottom: 0;
     }
  }

</style>
