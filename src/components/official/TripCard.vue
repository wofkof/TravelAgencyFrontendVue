<template>
  <div class="grid grid-cols-4 gap-4">
    <div class="w-auto grid grid-rows-5 bg-slate-300 h-96 p-0 rounded-md">
      <img src="/src/assets/images/logo.png" alt="" class="row-span-4 row-start-1">
      <div class="relative bg-slate-100 rounded-b-md">
        <p class="absolute left-0 m-2">標題</p>
        <div class="absolute bottom-2 right-2 ">
          <FavoriteIcon class="m-1" />
          <span>收藏</span>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import FavoriteIcon from "@/components/tools/FavoriteIcon.vue";

</script>