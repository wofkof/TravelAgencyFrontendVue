<!-- View/VisaOrderInformation.vue -->

<template>
  <visa-orderdetails>
    <template #header>
      <h1>我的頁面標題</h1>
    </template>
    <template #main>
      <p>這是頁面的主要內容。</p>
      <other-component />
    </template>
    <template #footer>
      <p>&copy; 2023 我的應用程式</p>
    </template>
   </visa-orderdetails>
</template>

<script>
import  VisaOrderdetails from '@/components/Visa/VisaOrderdetails.vue';


export default {
  components: {
   VisaOrderdetails,
  },
};
</script> 