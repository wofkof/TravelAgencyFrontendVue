<template>
  <div>
    <h1>護照與簽證</h1>
    <div style="display: flex;">
      <div style="width: 300px; margin-right: 20px;">
        <PassportVisaNav />
      </div>

      <div style="flex: 1;">
        <WorldMap />
      </div>
    </div>
  </div>
  <!-- 這裡，我們使用了一個 div 搭配 display: flex 來實現左右並列的佈局。左邊的 div 放置 PassportVisaNav，並設定了一個固定的寬度和右邊的間距。右邊的 div 使用 flex: 1 來佔據剩餘的空間，並放置 WorldMap 組件。 -->

  <div>
    <h1>代辦簽證</h1>
    <PassportOptions />
    </div>
</template>

<script setup>
import PassportOptions from '@/components/Visa/PassportOptions.vue';
import PassportVisaNav from '@/components/Visa/PassportVisaNav.vue';
import WorldMap from '@/components/Visa/WorldMap.vue'; // 引入 WorldMap 組件

</script>

<style scoped>
/* 可以添加頁面整體的樣式 */
</style>