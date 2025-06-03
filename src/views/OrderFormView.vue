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
import { onMounted } from 'vue';
import api from '@/utils/api'; 
import { ElMessage } from 'element-plus';
import { useOrderFormStore } from '@/stores/orderForm'; 
import { useAuthStore } from '@/stores/authStore'; 
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

const orderFormStore = useOrderFormStore();
const authStore = useAuthStore();

onMounted(() => {
  authStore.loadFromStorage();

  if (authStore.isLoggedIn && authStore.memberId) {
    orderFormStore.updateField('MemberId', authStore.memberId);
    console.log('✅ MemberId synchronized from AuthStore to OrderFormStore:', orderFormStore.data.MemberId);
  } else {
    console.warn('❌ User is not logged in or MemberId is missing in AuthStore. MemberId in OrderFormStore will remain null.');
  }

  if (orderFormStore.data.DocumentMenuId === null) {
      console.warn('⚠️ DocumentMenuId is still null. Please ensure a visa product is selected.');
  }

  if (orderFormStore.data.PickupMethodOption === null || orderFormStore.data.PickupMethodOption === '') {
      orderFormStore.updateField('PickupMethodOption', 0);
  }

  if (orderFormStore.data.TaxIdOption === null || orderFormStore.data.TaxIdOption === '') {
      orderFormStore.updateField('TaxIdOption', 0);
  }
});

const submitOrderForm = async () => {
  console.log('submitOrderForm function triggered!');
  console.log('Current OrderForm Data before validation:', JSON.parse(JSON.stringify(orderFormStore.data)));

  if (!orderFormStore.data.MemberId) {
    ElMessage.warning('請先登入');
    return;
  }
  
  if (!orderFormStore.data.DocumentMenuId) {
    ElMessage.warning('請選擇簽證產品');
    return;
  }
  
  if (!orderFormStore.data.DepartureDate) {
    ElMessage.warning('請選擇出發日期');
    return;
  }

  if (orderFormStore.data.ProcessingQuantity < 1) {
    ElMessage.warning('辦理件數必須至少為 1');
    return;
  }

  if (!orderFormStore.data.ChineseSurname || !orderFormStore.data.ChineseName ||
      !orderFormStore.data.EnglishSurname || !orderFormStore.data.EnglishName ||
      orderFormStore.data.Gender === null || !orderFormStore.data.BirthDate) {
    ElMessage.warning('請填寫完整的旅客資訊 (中文姓名, 英文姓名, 性別, 出生日期)');
    return;
  }

  if (!orderFormStore.data.ContactPersonName || !orderFormStore.data.ContactPersonEmail || !orderFormStore.data.ContactPersonPhoneNumber) {
    ElMessage.warning('請填寫完整的聯絡人資訊 (姓名, Email, 手機)');
    return;
  }

  if (orderFormStore.data.PickupMethodOption === null) {
      ElMessage.warning('請選擇取件方式');
      return;
  }

  if (orderFormStore.data.PickupMethodOption === 0) {
      if (!orderFormStore.data.MailingCity || !orderFormStore.data.MailingDetailAddress) {
          ElMessage.warning('請填寫完整的郵寄地址');
          return;
      }
  } else if (orderFormStore.data.PickupMethodOption === 1) { 
      if (!orderFormStore.data.StoreDetailAddress) {
          ElMessage.warning('請確認門市地址');
          return;
      }
  }
  
  if (orderFormStore.data.TaxIdOption === null) {
      ElMessage.warning('請選擇收據選項');
      return;
  }

  if (orderFormStore.data.TaxIdOption === 1) { 
      if (!orderFormStore.data.CompanyName || !orderFormStore.data.TaxIdNumber) {
          ElMessage.warning('請填寫完整的公司抬頭與統一編號');
          return;
      }
  }

  try {
    const response = await api.post('/OrderForm', orderFormStore.data);
    ElMessage.success('訂單已成功建立！');
    console.log('Order created successfully:', response.data);
    orderFormStore.resetForm();
  } catch (error) {
    console.error('Order submission failed:', error);
    ElMessage.error('提交訂單失敗，請檢查網路或輸入內容。');
    const resErrors = error.response?.data?.errors || error.response?.data?.title || error.response?.data;
    if (resErrors) {
      console.log('Detailed backend errors:', resErrors);
    }
  }
};
</script>