<template>
  <VisaOrder>
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
  </VisaOrder>
</template>

<script>
import VisaOrder from '@/components/Visa/VisaOrder.vue';


// export default {
//   components: {
//     VisaOrderdetails,
//   },
// };
</script>