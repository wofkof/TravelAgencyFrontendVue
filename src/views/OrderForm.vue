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
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'; // Vue Router
import { useCartStore } from '@/stores/ShoppingCart'; // Pinia Store
import { initiateOrder, getMemberDetailsForOrder, getOrderDetails, updateOrderAPI } from '@/utils/orderapi'; // API Service
import { useAuthStore } from '@/stores/authStore'; // 會員認證 Store
import { useHesitationStore } from '@/stores/hesitationStore';
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
const route = useRoute(); // 當前路由 (用於獲取 query 參數)
const cartStore = useCartStore(); // Pinia 購物車 Store
const orderFormRef = ref(null); // 原生 form 元素的引用 (如果需要直接操作原生 form)
const isLoading = ref(true); // 載入狀態
const error = ref(null); // 載入錯誤訊息
const isSubmitting = ref(false); // 提交狀態
const submitError = ref(null); // 提交錯誤訊息
const selectedOrderItems = ref([]); // 從購物車 Store 加載的選中商品列表
const authStore = useAuthStore();
const hesitationStore = useHesitationStore();

// 子組件表單的引用
const ordererFormRef = ref(null); // ParticipantForm 實例引用
const itemTravelerFormRefs = ref({}); // ItemParticipantForm 實例引用物件 (key: item.id, value: ItemParticipantForm 實例)

// ItemParticipantForm 的驗證狀態集合 (key: item.id, value: boolean)
const itemTravelerValidity = reactive({});


// --- Accordion (手風琴) 狀態管理 ---
// 控制哪些 AccordionSection 區塊是展開的
const activeCollapseNames = ref(['items', 'ordererInfo']); // 預設展開 商品、訂購人區塊

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

const currentOrderContextForHesitation = ref({
  orderId: null,
  expiresAt: null,
  // 如果 OrderForm 頁面本身需要 merchantTradeNo 來傳遞給 hesitationStore (雖然 store 目前沒用)
  merchantTradeNo: null 
});

function splitName(fullName) {
    if (!fullName || typeof fullName !== 'string' || fullName.length === 0) return { lastName: '', firstName: '' };
    // 假設姓氏為第一個字，其餘為名。
    return { lastName: fullName.substring(0, 1), firstName: fullName.substring(1) };
}

function mapBackendGenderToFrontend(backendGender) {
    if (typeof backendGender === 'string') {
        const lowerGender = backendGender.toLowerCase();
        if (lowerGender === 'male') return 'male';
        if (lowerGender === 'female') return 'female';
        if (lowerGender === 'other') return 'other';
    } else if (typeof backendGender === 'number') { // 保留對數字的處理
        if (backendGender === 0) return 'male';
        if (backendGender === 1) return 'female';
        if (backendGender === 2) return 'other';
    }
    console.warn(`mapBackendGenderToFrontend: 未知的 backendGender 值: ${backendGender}`);
    return null; // 或一個安全的預設值
}

function mapBackendDocTypeToFrontend(backendDocType) {
    // 假設後端 DocumentType 是枚舉值
    // 需要與你 ItemParticipantForm/ParticipantForm 中的 documentTypes 選項的 value 匹配
    if (backendDocType === 0) return 'ID_CARD_TW';
    if (backendDocType === 1) return 'PASSPORT';
    if (backendDocType === 2) return 'ARC';
    if (backendDocType === 3) return 'ENTRY_PERMIT';
    return 'ID_CARD_TW'; // 預設
}

function mapApiOrderDetailsToSelectedItems(apiOrderDetails) {
    if (!apiOrderDetails || !Array.isArray(apiOrderDetails)) return [];
    return apiOrderDetails.map(detail => {
        // detail 結構應基於後端 OrderDetailItemDto
        // 確保你的 OrderDetailItemDto 包含以下或等效的欄位
        let destinationCode = 'TW'; // 預設
        // 你可能需要從 detail.product (如果有的話) 或 detail 本身獲取 destinationCountryCode
        // if (detail.product && detail.product.destinationCountryCode) {
        //     destinationCode = detail.product.destinationCountryCode;
        // } else if (detail.destinationCountryCode) {
        //     destinationCode = detail.destinationCountryCode;
        // }

        return {
            id: String(detail.orderDetailId), // **關鍵：使用 OrderDetailId 作為唯一 ID**
            productId: String(detail.itemId), // 後端的 ItemId (即 ProductId)
            name: detail.productName || detail.description, // 使用 productName 或 description
            productType: detail.productType, // 後端已是字串 "GroupTravel" 或 "CustomTravel"
            price: detail.price,
            // quantity: detail.quantity, // 如果 item 本身有 quantity (非 options)
            options: detail.optionType ? [{ // 從 API 的 optionType 和 quantity 構造 options
                type: detail.optionType,
                price: detail.price, // 假設選項價格就是此 orderDetail 的價格
                quantity: detail.quantity
            }] : [], // 如果 API 沒有返回 options 陣列，但有單一 optionType
            destinationCountryCode: destinationCode, // 需要確保API有返回或可以推斷
            participantRequired: detail.participantRequired !== undefined ? detail.participantRequired : true,
            // ... 其他 selectedOrderItems 需要的欄位，例如 startDate, endDate
            startDate: detail.startDate, // 假設 API 返回 startDate
            endDate: detail.endDate,   // 假設 API 返回 endDate
        };
    });
}

function mapApiOrdererToFormData(apiOrdererInfo) {
    if (!apiOrdererInfo || Object.keys(apiOrdererInfo).length === 0) {
      console.warn("mapApiOrdererToFormData: 傳入的 apiOrdererInfo 為空或無效。");
      // 返回一個空的預設結構，或基於現有 formData.ordererInfo 避免完全清空
      return {
        firstName: formData.ordererInfo.firstName || '',
        lastName: formData.ordererInfo.lastName || '',
        country: formData.ordererInfo.country || 'TW',
        countryCode: formData.ordererInfo.countryCode || '+886',
        phoneNumber: formData.ordererInfo.phoneNumber || '',
        email: formData.ordererInfo.email || '',
        documentType: formData.ordererInfo.documentType || 'ID_CARD_TW',
        documentNumber: formData.ordererInfo.documentNumber || '',
        updateProfile: formData.ordererInfo.updateProfile || false,
      };
    }
console.log("mapApiOrdererToFormData - 接收到的 apiOrdererInfo:", JSON.parse(JSON.stringify(apiOrdererInfo)));
    const nameParts = splitName(apiOrdererInfo.name);
    // 解析電話號碼 (這是一個簡化版本，你可能需要更健壯的庫或邏輯)
    let countryCode = '+886';
    let phoneNumber = ''; 
    let rawPhoneNumberFromApi = apiOrdererInfo.mobilePhone || '';

    if (rawPhoneNumberFromApi) {
        if (rawPhoneNumberFromApi.startsWith('+')) {
            // 處理帶 '+' 的國際格式，例如 "+886925806525"
            const match = rawPhoneNumberFromApi.match(/^(\+\d+)(\d+)$/);
            if (match) {
                countryCode = match[1]; // 例如 "+886"
                phoneNumber = match[2]; // 例如 "925806525"
                // 如果國碼是 +886 且號碼是 9 開頭，可以考慮補 0 (如果前端驗證需要)
                if (countryCode === '+886' && phoneNumber.startsWith('9') && phoneNumber.length === 9) {
                    phoneNumber = '0' + phoneNumber; // 變成 "0925806525"
                }
            } else {
                // 無法解析帶 '+' 的格式，將 '+' 後的內容視為號碼
                phoneNumber = rawPhoneNumberFromApi.substring(1);
            }
        } else if (apiOrdererInfo.nationality === 'TW' && rawPhoneNumberFromApi.startsWith('886')) {
            // 處理資料庫中類似 "886925806525" 的格式 (台灣)
            countryCode = '+886';
            let numberPart = rawPhoneNumberFromApi.substring(3); // 移除 "886"，得到 "925806525"
            if (numberPart.startsWith('9') && numberPart.length === 9) {
                phoneNumber = '0' + numberPart; // 補 '0'，變成 "0925806525"
            } else {
                phoneNumber = numberPart; // 其他情況直接使用
            }
        } else if (apiOrdererInfo.nationality === 'TW' && rawPhoneNumberFromApi.startsWith('09') && rawPhoneNumberFromApi.length === 10) {
            // 如果資料庫存的就是 "0925806525"
            countryCode = '+886';
            phoneNumber = rawPhoneNumberFromApi;
        }
        else {
            phoneNumber = rawPhoneNumberFromApi;
            // 此處可以根據 apiOrdererInfo.nationality 來嘗試設定不同的預設 countryCode
        }
    }

        // 再次確認 phoneNumber 是否符合前端期望的 "09..." 或 "9..." 格式 (針對台灣)
    if (countryCode === '+886' && phoneNumber.startsWith('886')) {
        // 避免重複的 886，例如後端存 "886886..." 的異常情況
        let tempNumber = phoneNumber.substring(3);
        if (tempNumber.startsWith('9') && tempNumber.length === 9) {
            phoneNumber = '0' + tempNumber;
        } else {
            phoneNumber = tempNumber;
        }
    } else if (countryCode === '+886' && phoneNumber.length === 9 && phoneNumber.startsWith('9')) {
        // 如果是 9 開頭的9碼，補0
        phoneNumber = '0' + phoneNumber;
    }

    console.log(`mapApiOrdererToFormData - 解析後: countryCode='${countryCode}', phoneNumber='${phoneNumber}'`);

    return {
        lastName: nameParts.lastName,
        firstName: nameParts.firstName,
        country: apiOrdererInfo.nationality || 'TW', // 假設API有 nationality
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        email: apiOrdererInfo.email || '',
        // 假設API返回的 documentType 是後端枚舉值或已轉換的字串
        documentType: typeof apiOrdererInfo.documentType === 'number' 
        ? mapBackendDocTypeToFrontend(apiOrdererInfo.documentType)
        : (apiOrdererInfo.documentType || 'ID_CARD_TW'),
        documentNumber: apiOrdererInfo.documentNumber || '', 
        updateProfile: false, // 從API恢復時，通常不預設勾選更新會員資料
    };
}

function mapApiParticipantsToFormData(apiParticipants, currentSelectedItems) {
    const participantsByItemMap = {};

    // 1. 先根據 currentSelectedItems 初始化 participantsByItemMap 的基本結構 (填入空殼)
    currentSelectedItems.forEach(item => {
        const count = getItemParticipantCount(item); // 你已有的輔助函數
        participantsByItemMap[item.id] = []; // item.id 此時是 String(orderDetailId)
        if (count > 0) {
            for (let i = 0; i < count; i++) {
                participantsByItemMap[item.id].push({
                    id: `pax-${item.id}-${i}-${Date.now()}`,
                    lastNameZh: '', firstNameZh: '', gender: null, birthDate: null,
                    country: formData.ordererInfo.country || 'TW', // 可預設為訂購人國籍
                    documentType: 'ID_CARD_TW', idNumber: '', documentNumber: '',
                    lastNameEn: '', firstNameEn: '', passportNumber: '', passportExpiryDate: null,
                    remarks: '', selectedFrequentTraveler: null, updateThisTravelerProfile: false,
                    isPlaceholder: true // 添加一個標記，表示這是個空殼
                });
            }
        }
    });

    if (!apiParticipants || !Array.isArray(apiParticipants) || apiParticipants.length === 0) {
        return participantsByItemMap; // 如果API沒有旅客資料，返回基於商品數量的空殼結構
    }
    console.log("mapApiParticipantsToFormData - API 旅客列表:", JSON.parse(JSON.stringify(apiParticipants)));
    console.log("mapApiParticipantsToFormData - 當前商品項 (用於匹配):", JSON.parse(JSON.stringify(currentSelectedItems.map(i => ({id: i.id, name: i.name})))));


    // 2. 將 API 返回的旅客數據填充到對應的 item 的旅客陣列的空殼中
    apiParticipants.forEach(apiPax => {
        const linkingIdFromApiPax = String(apiPax.orderDetailId); // **使用 API 返回的 orderDetailId**

        if (linkingIdFromApiPax && participantsByItemMap.hasOwnProperty(linkingIdFromApiPax)) {
            const targetItemPaxsList = participantsByItemMap[linkingIdFromApiPax];
            const namePartsZh = splitName(apiPax.name);

            const mappedParticipant = {
                id: apiPax.frontendParticipantId || `api-pax-${linkingIdFromApiPax}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                lastNameZh: namePartsZh.lastName,
                firstNameZh: namePartsZh.firstName,
                gender: mapBackendGenderToFrontend(apiPax.gender),
                country: apiPax.nationality || 'TW',
                birthDate: apiPax.birthDate ? new Date(apiPax.birthDate).toISOString().split('T')[0] : null, // 確保 YYYY-MM-DD
                documentType: mapBackendDocTypeToFrontend(apiPax.documentType),
                idNumber: mapBackendDocTypeToFrontend(apiPax.documentType) === 'ID_CARD_TW' ? (apiPax.idNumber || apiPax.documentNumber || '') : '',
                documentNumber: mapBackendDocTypeToFrontend(apiPax.documentType) !== 'ID_CARD_TW' ? (apiPax.documentNumber || apiPax.idNumber || '') : '',
                lastNameEn: apiPax.passportSurname || '',
                firstNameEn: apiPax.passportGivenName || '',
                // passportNumber: apiPax.passportNumber || '', // 根據你的 ItemParticipantForm 欄位，證件號碼可能已包含護照號
                passportExpiryDate: apiPax.passportExpireDate ? new Date(apiPax.passportExpireDate).toISOString().split('T')[0] : null,
                remarks: apiPax.note || '',
                selectedFrequentTraveler: apiPax.favoriteTravelerId || null,
                updateThisTravelerProfile: !!apiPax.favoriteTravelerId,
                isPlaceholder: false // 標記為已填充數據
            };
             // 如果 documentType 是 PASSPORT，且 ItemParticipantForm 的 passportNumber 是獨立欄位，則可能需要這樣賦值
            if (mappedParticipant.documentType === 'PASSPORT') {
                mappedParticipant.passportNumber = mappedParticipant.documentNumber;
            }


            // 找到第一個空殼 (isPlaceholder=true) 並替換它
            let replaced = false;
            for (let i = 0; i < targetItemPaxsList.length; i++) {
                if (targetItemPaxsList[i].isPlaceholder) {
                    targetItemPaxsList[i] = mappedParticipant;
                    replaced = true;
                    break;
                }
            }
            if (!replaced) {
                // 如果沒有空殼了（例如 API 返回的旅客比預期多），可以選擇 log 或 push (後者可能導致數量不符)
                console.warn(`Item ${linkingIdFromApiPax} 的旅客空殼已填滿，但仍有 API 旅客數據 ${apiPax.name} 未分配。`);
                // targetItemPaxsList.push(mappedParticipant); // 謹慎使用，可能導致數量超出預期
            }

        } else {
            console.error(`無法將 API 旅客 ${apiPax.name || JSON.stringify(apiPax)} (OrderDetailID: ${linkingIdFromApiPax}) 關聯到訂單項目。可用的 Item IDs (OrderDetailIDs):`, Object.keys(participantsByItemMap));
        }
    });

    // 移除 isPlaceholder 標記 (可選，如果後續邏輯不需要它)
    Object.values(participantsByItemMap).forEach(paxList => {
        paxList.forEach(pax => delete pax.isPlaceholder);
    });

    return participantsByItemMap;
}

// 封裝從 authStore 和 getMemberDetailsForOrder 初始化訂購人資料的邏輯
async function initializeOrdererInfoFromAuthStoreAndApi() {
    const authMemberId = authStore.memberId;
    const authMemberName = authStore.memberName;

    // 先用 authStore 的資料做初步填充
    if (authMemberName) {
        const nameParts = splitName(authMemberName);
        formData.ordererInfo.lastName = nameParts.lastName;
        formData.ordererInfo.firstName = nameParts.firstName;
    } else {
        formData.ordererInfo.lastName = '';
        formData.ordererInfo.firstName = '';
    }
    // 設定一些預設值，或從 formData.ordererInfo 現有值初始化（如果有的話）
    formData.ordererInfo.email = formData.ordererInfo.email || authStore.memberEmail || ''; // 使用 authStore 的 email
    formData.ordererInfo.phoneNumber = formData.ordererInfo.phoneNumber || '';
    formData.ordererInfo.country = formData.ordererInfo.country || 'TW';
    formData.ordererInfo.countryCode = formData.ordererInfo.countryCode || '+886';
    formData.ordererInfo.documentType = formData.ordererInfo.documentType || 'ID_CARD_TW';
    formData.ordererInfo.documentNumber = formData.ordererInfo.documentNumber || '';
    formData.ordererInfo.updateProfile = formData.ordererInfo.updateProfile || false;


    if (authMemberId) {
        try {
            console.log(`OrderForm: 準備從 API 獲取 Member ID: ${authMemberId} 的詳細資料 (for orderer)`);
            const memberDetails = await getMemberDetailsForOrder(authMemberId);
            console.log('OrderForm: API 返回的會員詳細資料 (for orderer):', memberDetails);

            if (memberDetails) {
                if (memberDetails.name && typeof memberDetails.name === 'string') {
                    const nameParts = splitName(memberDetails.name);
                    formData.ordererInfo.lastName = nameParts.lastName;
                    formData.ordererInfo.firstName = nameParts.firstName;
                }
                formData.ordererInfo.email = memberDetails.email || formData.ordererInfo.email;
                formData.ordererInfo.phoneNumber = memberDetails.phone || formData.ordererInfo.phoneNumber; // 後端是 Phone
                formData.ordererInfo.country = memberDetails.nationality || formData.ordererInfo.country;

                const frontendDocType = mapBackendDocTypeToFrontend(memberDetails.documentType); // memberDetails.documentType 是後端枚舉值
                formData.ordererInfo.documentType = frontendDocType;
                if (frontendDocType === 'ID_CARD_TW') {
                    formData.ordererInfo.documentNumber = memberDetails.idNumber || '';
                } else {
                    formData.ordererInfo.documentNumber = memberDetails.documentNumber || '';
                }
            }
        } catch (apiError) {
            console.error("OrderForm: 調用 getMemberDetailsForOrder API 失敗:", apiError.message);
        }
    } else {
        console.warn("OrderForm: 新訂單且未登入，訂購人資料需手動完整填寫。");
    }
}


// --- 生命週期鉤子 onMounted ---
onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    const routeOrderId = route.query.orderId; // 使用 route (從 useRoute() 獲取)
    const authMemberId = authStore.memberId;
    console.log(`OrderForm onMounted: routeOrderId = ${routeOrderId}, authMemberId = ${authMemberId}`);

    try {
        if (routeOrderId && authMemberId) {
            console.log("OrderForm: 偵測到 orderId，將從 API 載入訂單資料:", routeOrderId);
            console.log("OrderForm: 執行恢復訂單資料流程 (有 orderId)");
            const response = await getOrderDetails(routeOrderId, authMemberId);

            if (response && response.data) {
                const orderDataFromApi = response.data;
                console.log("OrderForm: getOrderDetails 完整 API 回應:", JSON.parse(JSON.stringify(orderDataFromApi)));

                // << 更新 hesitation context >>
                currentOrderContextForHesitation.value = {
                  orderId: String(orderDataFromApi.orderId), // 確保是字串
                  expiresAt: orderDataFromApi.expiresAt,
                  merchantTradeNo: orderDataFromApi.merchantTradeNo
                };

                // 1. 恢復 selectedOrderItems
                // 假設 orderDataFromApi.orderDetails 包含商品詳情列表
                selectedOrderItems.value = mapApiOrderDetailsToSelectedItems(orderDataFromApi.orderDetails || []);
                console.log("OrderForm: onMounted - selectedOrderItems.value 在 API 賦值後:", JSON.parse(JSON.stringify(selectedOrderItems.value)));
                
                // 2. 恢復 formData.ordererInfo
                if (orderDataFromApi.ordererInfo && Object.keys(orderDataFromApi.ordererInfo).length > 0) {
                    console.log("OrderForm: 從 API 恢復訂購人資料:", orderDataFromApi.ordererInfo);
                    Object.assign(formData.ordererInfo, mapApiOrdererToFormData(orderDataFromApi.ordererInfo));
                } else {
                    console.warn("OrderForm: API 未返回有效的 ordererInfo，嘗試從會員預設資料填充 (routeOrderId path)");
                    await initializeOrdererInfoFromAuthStoreAndApi();
                }

                // 3. 恢復 formData.participantsByItem
                // 確保在 watch(selectedOrderItems) 的 immediate 執行前，相關數據已準備好
                // 或者讓 watch 處理結構，這裡填充數據
                const mappedParticipants = mapApiParticipantsToFormData(orderDataFromApi.participants || [], selectedOrderItems.value);
                Object.keys(formData.participantsByItem).forEach(key => delete formData.participantsByItem[key]);
                Object.assign(formData.participantsByItem, mappedParticipants);


                // 4. 恢復 formData.note 和 formData.memberId
                formData.note = orderDataFromApi.note || ''; // API 應返回 orderNotes
                formData.memberId = orderDataFromApi.memberId || authMemberId || 0;

                console.log("OrderForm: 已從 API 恢復訂單表單資料。");
            } else {
                error.value = "無法載入您的訂單資料，API 未返回有效數據，請重試。";
                console.log("OrderForm: 執行新訂單流程 (無 orderId)"); 
                ElMessage.error(error.value);
                console.error("OrderForm: getOrderDetails API 未返回有效數據 (response.data is falsy)。");
                // 考慮是否回退到購物車或顯示更明確錯誤頁
            }
        } else {
            console.log("OrderForm: 新訂單流程，從購物車和會員資料初始化。");
            loadOrderItems(); // 從 cartStore 加載商品
            formData.memberId = authMemberId || 0;
            await initializeOrdererInfoFromAuthStoreAndApi(); // 初始化訂購人
        }

        // Accordion 展開邏輯 (可以放在 try 內部最後，或 finally 之前)
        if (selectedOrderItems.value.length > 0 && !routeOrderId) {
            const firstItemWithTravelers = selectedOrderItems.value.find(item => getItemParticipantCount(item) > 0);
            if (firstItemWithTravelers && !activeCollapseNames.value.includes(`travelers-${firstItemWithTravelers.id}`)) {
                activeCollapseNames.value.push(`travelers-${firstItemWithTravelers.id}`);
            }
        }

    } catch (e) {
        console.error("OrderForm onMounted 過程中發生嚴重錯誤:", e);
        error.value = "載入頁面資料時發生了錯誤：" + (e.message || "未知錯誤");
        ElMessage.error(error.value);
        // 如果是新訂單流程出錯，可以嘗試基礎加載
        if (!routeOrderId) {
             loadOrderItems();
             await initializeOrdererInfoFromAuthStoreAndApi();
        }
    } finally {
        isLoading.value = false;
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
  console.log("OrderForm: loadOrderItems() 被調用"); 
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
  console.log("OrderForm: loadOrderItems() 完成, selectedOrderItems.value =", JSON.parse(JSON.stringify(selectedOrderItems.value)));
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

    // 1. 準備訂購人資訊
    const preparedOrdererInfo = {
        Name: `${formData.ordererInfo.lastName || ''}${formData.ordererInfo.firstName || ''}`.trim(),
        MobilePhone: `${formData.ordererInfo.countryCode || ''}${formData.ordererInfo.phoneNumber || ''}`.replace(/\s/g, ''),
        Email: formData.ordererInfo.email || null,
        Nationality: formData.ordererInfo.country,
        DocumentType: formData.ordererInfo.documentType,
        DocumentNumber: formData.ordererInfo.documentNumber,
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
            Note: paxData.remarks || '',
            FavoriteTravelerId: paxData.selectedFrequentTraveler,
        };
    });

    // --- 準備 API Payload (這部分邏輯應正確映射所有 formData 的數據) ---
    // --- 準備要傳給後端的購物車項目 ---
    const cartItemsForApi = [];
    (selectedOrderItems.value || []).forEach(item => { // 使用 selectedOrderItems.value
        if (item.options && item.options.length > 0) {
            item.options.forEach(option => {
                if (Number(option.quantity) > 0) {
                    cartItemsForApi.push({
                        productId: parseInt(item.productId),
                        productType: item.productType,
                        optionType: option.type,
                        quantity: Number(option.quantity),
                    });
                }
            });
        } else if (Number(item.quantity) > 0) {
            cartItemsForApi.push({
                productId: parseInt(item.productId),
                productType: item.productType,
                optionType: item.options && item.options.length > 0 ? item.options[0].type : "Standard", // 提供一個預設 optionType
                quantity: Number(item.quantity),
            });
        }
    });

    if (cartItemsForApi.length === 0) {
        ElMessage.error("購物車中沒有選擇任何有效的商品項目。");
        isSubmitting.value = false;
        return;
    }        

    // 最終的 Payload
    const apiPayload = {
        totalAmount: totalAmount.value,
        orderNotes: formData.note,
        ordererInfo: preparedOrdererInfo,
        participants: preparedParticipants,
        cartItems: cartItemsForApi,
    };

    const currentRouteOrderId = route.query.orderId;
    let finalApiPayload = { ...apiPayload };

    if (!currentRouteOrderId) { // 創建新訂單時，需要 MemberId
        finalApiPayload.memberId = formData.memberId || authStore.memberId || 0;
    }
    console.log("OrderForm: 最終發送到 API 的 Payload:", JSON.parse(JSON.stringify(finalApiPayload)));

    try {
        let response;
        let actionType = ""; // 用於日誌

        if (currentRouteOrderId) {
            // **** 更新現有訂單 ****
            actionType = "更新";
            console.log(`OrderForm: ${actionType}現有訂單 ID: ${currentRouteOrderId}`);
            // OrderUpdateDto 可能不需要 MemberId，後端應通過 orderId 和用戶身份驗證來確定
            // 你需要確保 updateOrderAPI 函數已在你的 API 工具庫中定義
            response = await updateOrderAPI(currentRouteOrderId, apiPayload);
        } else {
            // **** 創建新訂單 ****
            actionType = "創建";
            console.log("OrderForm: 準備創建新訂單");
            // 確保 OrderCreateDto 需要的 MemberId 被包含
            const createPayload = {
                ...apiPayload,
                memberId: formData.memberId || authStore.memberId || 0
            };
            response = await initiateOrder(createPayload);
        }

        console.log(`OrderForm: ${actionType}訂單 API 回應:`, response);

        if (response && response.data && response.data.orderId) {
            const { orderId, merchantTradeNo, expiresAt } = response.data;
            // 無論創建或更新，API 都應返回這些資訊
            currentOrderContextForHesitation.value = {
              orderId: String(orderId),
              expiresAt: expiresAt,
              merchantTradeNo: merchantTradeNo
            };

            ElMessage.success(`訂單資料已成功${actionType} (ID: ${orderId})！正在前往付款設定頁面...`);

            router.push({
                name: 'OrderPayment',
                query: {
                    orderId: orderId, // 使用API返回的 orderId (無論是新的還是更新後的)
                    mtn: merchantTradeNo,
                    exp: expiresAt,
                    ordererEmail: apiPayload.ordererInfo.Email
                }
            });
        } else {
            const defaultMessage = currentRouteOrderId ? `更新訂單資料失敗` : `儲存訂單資料失敗`;
            submitError.value = response?.data?.message || response?.message || defaultMessage + '，請稍後再試。';
            ElMessage.error(submitError.value);
        }
    } catch (err) {
        console.error(`OrderForm: 訂單${currentRouteOrderId ? '更新' : '提交'}過程中發生錯誤:`, err);
        let detailedErrorMessage = "操作失敗，請稍後重試。";
        if (err.response) {
            detailedErrorMessage = err.response.data?.message || err.response.data?.title || `訂單${currentRouteOrderId ? '更新' : '提交'}失敗，伺服器返回錯誤。`;
            if (err.response.data?.errors) {
                console.error("後端模型驗證錯誤:", err.response.data.errors);
                let errorMessages = [];
                for (const key in err.response.data.errors) {
                    if (err.response.data.errors[key].length > 0) {
                        errorMessages.push(`${key}: ${err.response.data.errors[key].join(', ')}`);
                    }
                }
                detailedErrorMessage = "表單資料有誤，請檢查：\n" + errorMessages.join("\n");
            }
        } else if (err.request) {
            detailedErrorMessage = '無法連接到伺服器，請檢查您的網路連線。';
        } else {
            detailedErrorMessage = err.message || detailedErrorMessage;
        }
        submitError.value = detailedErrorMessage;
        ElMessage.error(submitError.value);
    } finally {
        isSubmitting.value = false;
    }

};

// << 新增: onBeforeRouteLeave 鉤子 >>
onBeforeRouteLeave((to, from) => {
  const orderId = currentOrderContextForHesitation.value.orderId;
  const currentExpiresAt = currentOrderContextForHesitation.value.expiresAt;

  // 只有當 orderId 和 currentExpiresAt 都存在時才操作
  if (orderId && currentExpiresAt) {
    const relevantOrderPages = ['OrderForm', 'OrderPayment']; // 您的訂單和付款頁面的路由名稱

    // 如果是從 OrderForm 離開，且目標頁面不是 OrderForm 或 OrderPayment
    if (relevantOrderPages.includes(from.name) && !relevantOrderPages.includes(to.name)) {
      // 並且猶豫期尚未被 store 記錄為已啟動 (這一層判斷 hesitationStore 內部會做，但這裡也可以加)
      if (!hesitationStore.getEffectiveExpiresAt(orderId)) {
        console.log(`[OrderForm onBeforeRouteLeave] Calling startHesitationCountdown for order ${orderId}`);
        hesitationStore.startHesitationCountdown(orderId, currentExpiresAt);
      }
    }
  } else {
    console.log("[OrderForm onBeforeRouteLeave] No valid orderId or expiresAt in context, skipping hesitation start.");
  }
});

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