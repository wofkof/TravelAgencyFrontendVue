<template>
  <div class="common-layout" style="height: 3800px;">
    <el-container>
      <el-aside width="500px" style="background-color: #EEDACB;height: 3800px">
        <VisaCarousel />
      </el-aside>
      <el-container>
        <el-header style="height: 30px; background-color: #EEDACB;">
          <VisaBreadcrumb />
        </el-header>
        <el-main style="background-color: #EEDACB;">
          <VisainDetail />
          <VisaOrderInformation />

          <VisaQuantityDeparture />
          <VisaPassengerInformation />
          <VisaOrderContact />
          <VisaPickupMethod />
          <VisaReceiptInformation />

          <VisaTotalAmount /> <el-button type="primary"
            style="width: 200px; margin-top: 30px; margin-left: 50%; transform: translateX(-50%);"
            @click="submitOrderForm">
            確認訂單並送出
          </el-button>

        </el-main>
        <el-footer style="height: 190px; background-color: #EEDACB;">
          <VisaBackTop />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'; // Import onMounted for lifecycle hook
import api from '@/utils/api'; // Your API utility
import { ElMessage } from 'element-plus'; // For message prompts
import { useOrderFormStore } from '@/stores/orderForm'; // Your order form Pinia store
import { useAuthStore } from '@/stores/authStore'; // Your authentication Pinia store

// Import all your form components
import VisaCarousel from '@/components/Visa/VisaCarousel.vue';
import VisaBreadcrumb from '@/components/Visa/VisaBreadcrumb.vue';
import VisaOrderInformation from '@/components/Visa/VisaOrderInformation.vue';
import VisaQuantityDeparture from '@/components/Visa/VisaQuantityDeparture.vue';
import VisainDetail from '@/components/Visa/VisainDetail.vue';
import VisaBackTop from '@/components/Visa/VisaBackTop.vue';
import VisaPassengerInformation from '@/components/Visa/VisaPassengerInformation.vue';
import VisaOrderContact from '@/components/Visa/VisaOrderContact.vue';
import VisaPickupMethod from '@/components/Visa/VisaPickupMethod.vue';
import VisaReceiptInformation from '@/components/Visa/VisaReceiptInformation.vue';
import VisaTotalAmount from '@/components/Visa/VisaTotalAmount.vue';

// Initialize your Pinia stores
const orderFormStore = useOrderFormStore();
const authStore = useAuthStore();

// --- Lifecycle Hook to Initialize Data ---
onMounted(() => {
  // Load authentication status from storage first
  authStore.loadFromStorage();

  // If the user is logged in, synchronize their MemberId to the order form
  if (authStore.isLoggedIn && authStore.memberId) {
    orderFormStore.updateField('MemberId', authStore.memberId);
    console.log('✅ MemberId synchronized from AuthStore to OrderFormStore:', orderFormStore.data.MemberId);
  } else {
    console.warn('❌ User is not logged in or MemberId is missing in AuthStore. MemberId in OrderFormStore will remain null.');
    // Optionally, you might want to show a message or redirect if login is mandatory
    // ElMessage.info('Please log in to proceed with the order.');
  }

  // Set default values for other critical fields if they haven't been set by sub-components yet
  // Ensure DocumentMenuId is set if it's supposed to be pre-selected or comes from the route
  if (orderFormStore.data.DocumentMenuId === null) {
      // This is a placeholder. You need to ensure VisainDetail or VisaOrderInformation
      // properly sets the DocumentMenuId when a product is selected or loaded.
      // For testing, you might temporarily set a dummy ID here:
      // orderFormStore.updateField('DocumentMenuId', 123);
      console.warn('⚠️ DocumentMenuId is still null. Please ensure a visa product is selected.');
  }

  // Initialize PickupMethodOption if it's null (e.g., default to store pickup or mail)
  if (orderFormStore.data.PickupMethodOption === null || orderFormStore.data.PickupMethodOption === '') {
      orderFormStore.updateField('PickupMethodOption', 0); // Assuming 0 is default (e.g., mail)
  }

  // Initialize TaxIdOption if it's null
  if (orderFormStore.data.TaxIdOption === null || orderFormStore.data.TaxIdOption === '') {
      orderFormStore.updateField('TaxIdOption', 0); // Assuming 0 is default (no tax ID needed)
  }
});

// --- Submit Order Form Function ---
const submitOrderForm = async () => {
  console.log('submitOrderForm function triggered!');
  console.log('Current OrderForm Data before validation:', JSON.parse(JSON.stringify(orderFormStore.data))); // Log a deep copy for debugging

  // 1. Frontend validation for all required fields
  // Check MemberId
  if (!orderFormStore.data.MemberId) {
    ElMessage.warning('請先登入');
    return;
  }
  // Check DocumentMenuId
  if (!orderFormStore.data.DocumentMenuId) {
    ElMessage.warning('請選擇簽證產品');
    return;
  }
  // Check DepartureDate and ProcessingQuantity
  if (!orderFormStore.data.DepartureDate) {
    ElMessage.warning('請選擇出發日期');
    return;
  }
  if (orderFormStore.data.ProcessingQuantity < 1) {
    ElMessage.warning('辦理件數必須至少為 1');
    return;
  }
  // Check Passenger Information
  if (!orderFormStore.data.ChineseSurname || !orderFormStore.data.ChineseName ||
      !orderFormStore.data.EnglishSurname || !orderFormStore.data.EnglishName ||
      orderFormStore.data.Gender === null || !orderFormStore.data.BirthDate) {
    ElMessage.warning('請填寫完整的旅客資訊 (中文姓名, 英文姓名, 性別, 出生日期)');
    return;
  }
  // Check Contact Person Information
  if (!orderFormStore.data.ContactPersonName || !orderFormStore.data.ContactPersonEmail || !orderFormStore.data.ContactPersonPhoneNumber) {
    ElMessage.warning('請填寫完整的聯絡人資訊 (姓名, Email, 手機)');
    return;
  }

  // Check Pickup Method Information
  if (orderFormStore.data.PickupMethodOption === null) {
      ElMessage.warning('請選擇取件方式');
      return;
  }
  if (orderFormStore.data.PickupMethodOption === 0) { // Assuming 0 is Mail
      if (!orderFormStore.data.MailingCity || !orderFormStore.data.MailingDetailAddress) {
          ElMessage.warning('請填寫完整的郵寄地址');
          return;
      }
  } else if (orderFormStore.data.PickupMethodOption === 1) { // Assuming 1 is Store Pickup
      if (!orderFormStore.data.StoreDetailAddress) {
          ElMessage.warning('請確認門市地址');
          return;
      }
  }

  // Check Receipt Information
  if (orderFormStore.data.TaxIdOption === null) {
      ElMessage.warning('請選擇收據選項');
      return;
  }
  if (orderFormStore.data.TaxIdOption === 1) { // Assuming 1 is "Needs Tax ID"
      if (!orderFormStore.data.CompanyName || !orderFormStore.data.TaxIdNumber) {
          ElMessage.warning('請填寫完整的公司抬頭與統一編號');
          return;
      }
  }

  try {
    // Directly use the complete OrderFormDto data stored in the store to send the request
    // IMPORTANT: Ensure your backend API path is correct.
    // If you explicitly saved '/DocumentMenu' for API call path, but you're using '/Order/CreateOrderForm' here,
    // ensure '/Order/CreateOrderForm' is the correct endpoint for creating orders.
    const response = await api.post('/OrderForm', orderFormStore.data);

    ElMessage.success('訂單已成功建立！');
    console.log('Order created successfully:', response.data);

    orderFormStore.resetForm(); // Reset the store after successful submission
    // Optionally, navigate to an order confirmation page
    // router.push({ name: 'OrderConfirmation', params: { orderId: response.data.orderId } });

  } catch (error) {
    console.error('Order submission failed:', error);
    ElMessage.error('提交訂單失敗，請檢查網路或輸入內容。');

    const resErrors = error.response?.data?.errors || error.response?.data?.title || error.response?.data;
    if (resErrors) {
      console.log('Detailed backend errors:', resErrors);
      // You can process and display specific backend error messages here
    }
  }
};
</script>