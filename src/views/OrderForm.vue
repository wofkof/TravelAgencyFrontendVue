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
                :is-submitting="isSubmitting"
                :is-checkout-disabled="isCheckoutButtonDisabled"
                @submit-order="handleGoToPayment" 
                button-text="送出訂單資料" 
                :show-payment-info="false"       
                :payment-timer-seconds="30"      
                class="cost-summary-component"
                :order-items="selectedOrderItems"
                :orderer-status-message="ordererStatusMessage"
                :participants-status-message="participantsStatusMessage"
                :scroll-to-items="scrollToItemsSection"
                :is-orderer-basic-info-filled="isOrdererBasicInfoFilled"
                :are-all-participant-quantities-filled="areAllParticipantQuantitiesFilled"
                :all-travelers-valid="allTravelersValid"
            />
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
import { useCartStore } from '@/stores/ShoppingCart'; // Pinia Store
import { initiateOrder } from '@/utils/orderapi'; // API Service

// --- 引入 Element Plus 圖標 ---
import { RefreshRight, ShoppingCart } from '@element-plus/icons-vue';

// --- 引入子元件 ---
// 確保這些子元件的路徑正確
import AccordionSection from '@/components/OrderForm/AccordionSection.vue';
import OrderItemsDisplay from '@/components/OrderForm/OrderItemsDisplay.vue';
import ParticipantForm from '@/components/OrderForm/ParticipantForm.vue';
import ItemParticipantForm from '@/components/OrderForm/ItemParticipantForm.vue';
import CostSummary from '@/components/OrderForm/CostSummary.vue';

// --- 狀態管理 ---
const router = useRouter(); // Vue Router 實例
const cartStore = useCartStore(); // Pinia 購物車 Store
const orderFormRef = ref(null); // 原生 form 元素的引用 (如果需要直接操作原生 form)
const isLoading = ref(true); // 載入狀態
const error = ref(null); // 載入錯誤訊息
const isSubmitting = ref(false); // 提交狀態
const submitError = ref(null); // 提交錯誤訊息
const selectedOrderItems = ref([]); // 從購物車 Store 加載的選中商品列表

// 子組件表單的引用
const ordererFormRef = ref(null); // ParticipantForm 實例引用
const itemTravelerFormRefs = ref({}); // ItemParticipantForm 實例引用物件 (key: item.id, value: ItemParticipantForm 實例)

// ItemParticipantForm 的驗證狀態集合 (key: item.id, value: boolean)
const itemTravelerValidity = reactive({});


// --- Accordion (手風琴) 狀態管理 ---
// 控制哪些 AccordionSection 區塊是展開的
const activeCollapseNames = ref(['items', 'ordererInfo']); // 預設展開 商品、訂購人區塊

// 獲取 PaymentOptions 所在 AccordionSection 的引用 (用於滾動，也可以用 data-section-name 查找)
// const paymentAccordionRef = ref(null); // 在模板中綁定到 PaymentOptions 所在 AccordionSection


// --- 表單數據模型 (使用 reactive) ---
// 集中管理所有子組件表單的數據
const formData = reactive({
  memberId: null, // 會員 ID
  note: '', // 訂單備註 (綁定到 el-input)
  // 訂購人資料 (ParticipantForm v-model 綁定)
  ordererInfo: {
    firstName: '', lastName: '', country: 'TW', countryCode: '+886',
    phoneNumber: '', email: '', updateProfile: false,
    documentType: 'ID_CARD_TW', documentNumber: ''
  },
  // 旅客資料 (按商品分組，ItemParticipantForm v-model 綁定對應的陣列)
  participantsByItem: {},
  
});

// --- 生命週期鉤子 ---
onMounted(() => {
  // 元件掛載後，從 Pinia Store 加載需要結帳的商品
  loadOrderItems();

  // 從 localStorage 讀取會員資料並填充訂購人表單
  try {
    const storedMemberId = localStorage.getItem('memberId'); 
    const storedMemberName = localStorage.getItem('memberName');
    const storedEmail = localStorage.getItem('memberEmail');
    const storedPhone = localStorage.getItem('memberPhone');

  if (storedMemberId) {
      formData.memberId = parseInt(storedMemberId, 10); // 正確：轉換為整數
      if (isNaN(formData.memberId)) { // 檢查轉換是否成功
          formData.memberId = 0; // 或 null，或其他錯誤處理
          console.error("無法將 localStorage 中的 memberId 轉換為數字:", storedMemberId);
      }
  } else {
      formData.memberId = 0; // 或 null，如果 localStorage 中沒有
  }

    if (storedMemberName && typeof storedMemberName === 'string' && storedMemberName.length > 0) {
      let lastName = '';
      let firstName = '';

      // 簡單拆分姓名：假設第一個字元是姓氏，其餘是名字。
      if (storedMemberName.length === 1) {
        lastName = storedMemberName; 
        firstName = '';
      } else { // storedMemberName.length >= 2
        lastName = storedMemberName.substring(0, 1);
        firstName = storedMemberName.substring(1);
      }
      
      // 更新 formData.ordererInfo 中的姓和名
      formData.ordererInfo.lastName = lastName;
      formData.ordererInfo.firstName = firstName;

      // console.log(`從 localStorage 加載會員姓名: 姓=${lastName}, 名=${firstName}`);

      if (storedEmail) {
        formData.ordererInfo.email = storedEmail;
      }

      if (storedPhone) {
        formData.ordererInfo.phoneNumber = storedPhone;
      }
    }
  } catch (e) {
    console.error("從 localStorage 讀取會員資料時發生錯誤:", e);
  }

  // << 如果 URL 中有 orderId (例如從付款頁返回)，嘗試載入訂單資料 >>
  const routeOrderId = router.currentRoute.value.query.orderId;
  if (routeOrderId) {
    // TODO: 實作載入現有訂單資料填充表單的邏輯
    // loadExistingOrderData(routeOrderId);
    console.log("偵測到 orderId，應載入訂單資料以供修改：", routeOrderId);
    // 載入完成後，可能需要展開所有相關旅客區塊
  } else {
    // 如果是新訂單，展開第一個旅客資料區塊 (如果有的話)
    watch(selectedOrderItems, (newItems) => {
        if (newItems.length > 0) {
            const firstItemWithTravelers = newItems.find(item => getItemParticipantCount(item) > 0);
            if (firstItemWithTravelers && !activeCollapseNames.value.includes(`travelers-${firstItemWithTravelers.id}`)) {
                activeCollapseNames.value.push(`travelers-${firstItemWithTravelers.id}`);
            }
        }
    }, { immediate: true });
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
    if (isSubmitting.value || selectedOrderItems.value.length === 0) {
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
const handleGoToPayment = async () => {
    // 檢查按鈕是否已被禁用 (避免重複點擊)
    if (isCheckoutButtonDisabled.value || isSubmitting.value) {
        console.warn("提交按鈕被禁用或正在提交中。");
        ElMessage.warning("請檢查表單是否填寫完整或正在提交中。");
        return;
    }

    isSubmitting.value = true; // 設定提交狀態
    submitError.value = null; // 清除上次的提交錯誤
    let isFormValid = true; // 總體表單驗證結果

    // --- **觸發所有子表單的嚴謹驗證** ---

    // 1. 訂購人表單驗證 (ParticipantForm 暴露了 validateForm 方法)
    if (ordererFormRef.value && ordererFormRef.value.validateForm) {
          const ordererValid = await ordererFormRef.value.validateForm();
          if (!ordererValid) {
            isFormValid = false;
            scrollToSection('ordererInfo');
            ElMessage.error("請檢查訂購人資料。");
          }
    } else {
          console.error("無法獲取 ParticipantForm 引用或其 validateForm 方法。訂購人驗證失敗。");
          isFormValid = false; // 訂購人驗證是必須的
    }

    // 如果訂購人驗證失敗，停止後續驗證和提交
    if (!isFormValid) {
      isSubmitting.value = false;
      return;
    }

    // 2. 所有商品旅客資料表單驗證
    const itemTravelerFormInstances = Object.values(itemTravelerFormRefs.value);
    for (const formInstance of itemTravelerFormInstances) {
      const relatedItem = selectedOrderItems.value.find(item => item.id === formInstance.orderItem?.id);
      if (relatedItem && getItemParticipantCount(relatedItem) > 0 && formInstance && formInstance.validateAll) {
        const valid = await formInstance.validateAll();
        if (!valid) {
          isFormValid = false;
          scrollToSection(`travelers-${formInstance.orderItem?.id}`);
          ElMessage.error(`請檢查商品 "${formInstance.orderItem?.name || '未知商品'}" 的旅客資料。`);
          break;
        }
      } else if (relatedItem && getItemParticipantCount(relatedItem) > 0) {
          console.error(`無法獲取 ItemParticipantForm 引用或其 validateAll 方法 (${relatedItem.id})。`);
          isFormValid = false;
          break;
      }
    }
    if (!isFormValid) {
      isSubmitting.value = false;
      return;
    }      

    console.log("所有表單嚴謹驗證通過。準備提交數據...");

    // --- 準備 API Payload (這部分邏輯應正確映射所有 formData 的數據) ---
    // --- 準備要傳給後端的購物車項目 ---
    const cartItemsForApi = [];
    cartStore.selectedItems.forEach(item => {
        if (item.options && item.options.length > 0) {
            item.options.forEach(option => {
                if (option.quantity > 0) { // 只處理數量大於0的選項
                    cartItemsForApi.push({
                        productId: parseInt(item.productId), // GroupTravelId 或 CustomTravelId
                        productType: item.productType, // "GroupTravel", "CustomTravel"
                        optionType: option.type, // "成人", "兒童", "嬰兒"
                        quantity: option.quantity,
                    });
                }
            });
        } else if (item.quantity > 0) { // 如果商品沒有 options，但有直接的 quantity
            cartItemsForApi.push({
                productId: parseInt(item.productId),
                productType: item.productType,
                optionType: "Standard", // 或其他預設值，後端需要能處理這種情況的定價
                quantity: item.quantity,
            });
        }
    });
    if (cartItemsForApi.length === 0) {
        ElMessage.error("購物車中沒有選擇任何有效的商品項目。");
        isSubmitting.value = false;
        return;
    }        

    // 1. 準備訂購人資訊
    const preparedOrdererInfo = {
        Name: `${formData.ordererInfo.lastName || ''}${formData.ordererInfo.firstName || ''}`.trim(),
        MobilePhone: `${formData.ordererInfo.countryCode || ''}${formData.ordererInfo.phoneNumber || ''}`.replace(/\s/g, ''),
        Email: formData.ordererInfo.email || null,
    };


    // 2. 準備會員更新專用的完整個人資料 (只有當用戶勾選時才準備)
    let memberProfileToUpdate = null; // 需與後端確認此物件的欄位名和結構
    if (formData.ordererInfo.updateProfile) {
        let backendOrdererDocumentType = null;
        switch (formData.ordererInfo.documentType) {
            case 'ID_CARD_TW': backendOrdererDocumentType = 0; break;
            case 'PASSPORT':   backendOrdererDocumentType = 1; break;
            case 'ARC':        backendOrdererDocumentType = 2; break;
            case 'ENTRY_PERMIT': backendOrdererDocumentType = 3; break;
            default: backendOrdererDocumentType = null;
        }
        memberProfileToUpdate = {
            Name: `${formData.ordererInfo.lastName || ''}${formData.ordererInfo.firstName || ''}`.trim(),
            MobilePhone: `${formData.ordererInfo.countryCode || ''}${formData.ordererInfo.phoneNumber || ''}`.replace(/\s/g, ''),
            Email: formData.ordererInfo.email || null,
            Nationality: formData.ordererInfo.country,
            DocumentType: backendOrdererDocumentType,
            DocumentNumber: formData.ordererInfo.documentNumber || null,
        };
    }
    // 3. 準備旅客列表 (此處邏輯與會員更新無關，保持原樣)
    const preparedParticipants = Object.values(formData.participantsByItem).flat().map(paxData => {
        let backendDocumentType; // 這是旅客的證件類型
        switch (paxData.documentType) {
            case 'ID_CARD_TW': backendDocumentType = 0; break;
            case 'PASSPORT': backendDocumentType = 1; break;
            case 'ARC': backendDocumentType = 2; break;
            case 'ENTRY_PERMIT': backendDocumentType = 3; break;
        }
        let backendGender = null;
        switch (paxData.gender) {
            case 'male': backendGender = 0; break;
            case 'female': backendGender = 1; break;
            case 'other': backendGender = 2; break;
        }
        let backendIdNumber = null;
        let backendPaxDocumentNumber = null; // 改名以區分訂購人的 documentNumber

        if (paxData.documentType === 'ID_CARD_TW') {
            backendIdNumber = paxData.idNumber || null;
        } else {
            backendPaxDocumentNumber = paxData.documentNumber || null;
        }
        return {
            Name: `${paxData.lastNameZh || ''}${paxData.firstNameZh || ''}`.trim(),
            BirthDate: paxData.birthDate,
            IdNumber: backendIdNumber,
            Gender: backendGender,
            Phone: paxData.phoneNumber || null,
            Email: paxData.email || null,
            DocumentType: backendDocumentType, // 旅客的證件類型
            DocumentNumber: backendPaxDocumentNumber, // 旅客的證件號碼
            PassportSurname: paxData.lastNameEn || null,
            PassportGivenName: paxData.firstNameEn || null,
            PassportExpireDate: paxData.passportExpiryDate || null,
            Nationality: paxData.country,
            Note: paxData.remarks || ''
        };
    });

    // 組合最終 API Payload
    const orderDetailsPayload = {
        memberId: formData.memberId, 
        totalAmount: totalAmount.value,
        orderNotes: formData.note,
        ordererInfo: preparedOrdererInfo,
        participants: preparedParticipants, // 扁平化的旅客陣列
        cartItems: cartItemsForApi, // 從 Pinia Store 獲取的 cartItems
    };
    console.log("準備提交的初步訂單 Payload:", JSON.stringify(orderDetailsPayload, null, 2));

    try {
      // --- 第一步：呼叫後端 API 建立訂單 ---
      const response = await initiateOrder(orderDetailsPayload);
      console.log('初步訂單建立成功，回應:', response);

      if (response && response.data && response.data.orderId) {
        const { orderId, merchantTradeNo, expiresAt } = response.data;
        ElMessage.success(`訂單資料已儲存 (ID: ${orderId})！正在前往付款設定頁面...`);

        // 清理購物車中已提交的商品 (這部分邏輯可以保留)
        const successfullySubmittedItemUuids = cartStore.selectedItems.map(i => i.id);
        if (successfullySubmittedItemUuids.length > 0) {
            cartStore.removeItemsByIds(successfullySubmittedItemUuids);
        }

        // 導向到新的付款頁面，並傳遞必要參數
        router.push({
          name: 'OrderPayment',
          query: {
            orderId: orderId,
            mtn: merchantTradeNo, // MerchantTradeNo
            exp: expiresAt, // 過期時間 (ISO String)
            ordererEmail: orderDetailsPayload.ordererInfo.Email
          }
        });

      } else {
        console.error('初步訂單建立失敗 - API 回應無效:', response);
        submitError.value = response?.data?.message || response?.message || '儲存訂單資料失敗，請稍後再試。';
        ElMessage.error(submitError.value);
      }
    } catch (err) {
        console.error("訂單提交過程中發生錯誤:", err);
      if (err.response) {
          submitError.value = err.response.data?.message || err.response.data?.title || '訂單提交失敗，伺服器返回錯誤。';
      } else if (err.request) {
          submitError.value = '無法連接到伺服器，請檢查您的網路連線。';
      } else {
          submitError.value = err.message || '提交訂單時發生未知錯誤。';
      }
      ElMessage.error(`訂單提交失敗: ${submitError.value}`);
    } finally {
      isSubmitting.value = false;
    }
};

// 在組件更新之前清理 ItemParticipantForm 的 refs
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