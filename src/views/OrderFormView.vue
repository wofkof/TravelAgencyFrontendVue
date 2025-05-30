<!-- 我是填寫訂單第二頁 -->
<template>
  <div class="common-layout" style="height: 3800px;"><!-- 設定容器高度 -->
     <el-container> <!-- Element Plus 的容器元件，用於佈局 -->
      <el-aside width="500px" style="background-color:  #EEDACB;height: 3800px">
         <!-- Aside -->
         <!-- 側邊欄元件，設定寬度為 400 像素,高度1000像素，背景顏色為 #e6a23c (橘色) -->
          <VisaCarousel />
      </el-aside>
         <el-container>
             <el-header style="height: 30px; background-color:  #EEDACB;">
               <!-- Header -->
               <!-- 頁首元件，設定高度為 60 像素，背景顏色為 #409eff (藍色) -->
                <VisaBreadcrumb />
             </el-header>
             <el-main style="background-color:  #EEDACB;">
               <!-- Main -->
               <!-- 主要內容元件，背景顏色為 #f9fafc (淺灰色) -->
                <VisainDetail />
                <VisaOrderInformation />

                <VisaQuantityDeparture />
                <VisaPassengerInformation />
                <VisaOrderContact />
                <VisaPickupMethod />
                <VisaReceiptInformation />

                <VisaTotalAmount />

                <el-button type="primary" style="width: 200px; margin-top: 30px; margin-left: 50%; transform: translateX(-50%);" @click="submitOrderForm">
                確認訂單並送出
                </el-button>

             </el-main>
             <el-footer style="height: 190px; background-color:  #EEDACB;">
                <!-- Footer -->
                <!-- 頁尾元件，設定高度為 40 像素，背景顏色為 #67c23a (綠色) -->
                <VisaBackTop />
             </el-footer>
         </el-container>
     </el-container>
  </div>
</template>

<!-- 我將要引入的component有哪些,檔案位置 -->
<script setup>
import api from '@/utils/api';
import { ElMessage } from 'element-plus';
import { useOrderFormStore } from '@/stores/orderForm'; // 引入 Pinia Store
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

// === 提交整個訂單的函式 ===
const submitOrderForm = async () => {
  // 1. 前端最終驗證所有必填欄位
  // 這裡的驗證可以直接使用 orderFormStore.data 中的值
  if (!orderFormStore.data.MemberId) {
    ElMessage.warning('請先登入');
    return;
  }
  if (!orderFormStore.data.DocumentMenuId) {
    ElMessage.warning('請選擇簽證產品');
    return;
  }

  try {
    // 直接使用 store 中儲存的完整 OrderFormDto 資料來發送請求
    const response = await api.post('/Order/CreateOrderForm', orderFormStore.data);

    ElMessage.success('訂單已成功建立！');
    console.log('訂單建立成功:', response.data);

    orderFormStore.resetForm(); 
    // 提交成功後重置 store
    // 成功後可以導航到訂單確認頁面
    // router.push({ name: 'OrderConfirmation', params: { orderId: response.data.orderId } });

  } catch (error) {
    console.error('提交訂單失敗:', error);
    ElMessage.error('提交訂單失敗，請檢查網路或輸入內容。');

    const resErrors = error.response?.data?.errors || error.response?.data?.title || error.response?.data;
    if (resErrors) {
      console.log('後端返回的詳細錯誤:', resErrors);
      // 在這裡處理並顯示後端返回的具體錯誤訊息
    }
  }
};
</script>