<template>

  <div class="common-layout" style="height: 1800px;">
    <!-- 設定容器高度 -->


     <el-container> 
    <!-- Element Plus 的容器元件，用於佈局 -->

      <el-aside width="400px" style="background-color: #e6a23c;height: 1000px">Aside
          <VisaCarousel />
      </el-aside>
      <!-- 側邊欄元件，設定寬度為 400 像素,高度1000像素，背景顏色為 #e6a23c (橘色) -->

         <el-container>


             <el-header style="height: 60px; background-color: #409eff;">Header
                <VisaBreadcrumb />
             </el-header>
             <!-- 頁首元件，設定高度為 60 像素，背景顏色為 #409eff (藍色) -->


             <el-main style="background-color: #f9fafc;">Main
             <VisaThankOrder />   
             </el-main>
             <!-- 主要內容元件，背景顏色為 #f9fafc (淺灰色) -->

             <el-footer style="height: 40px; background-color: #67c23a;">Footer
                
                <VisaBackTop />
             </el-footer>
            <!-- 頁尾元件，設定高度為 40 像素，背景顏色為 #67c23a (綠色) -->

            
         </el-container>

     </el-container>


  </div>

</template>

<!-- 我將要引入的component有哪些,檔案位置 -->
 <script setup>
 import VisaCarousel from '@/components/Visa/VisaCarousel.vue';
 import VisaBreadcrumb from '@/components/Visa/VisaBreadcrumb.vue';
 import VisaBackTop from '@/components/Visa/VisaBackTop.vue';
 import VisaThankOrder from '@/components/Visa/VisaThankOrder.vue';
 </script>