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
</script>