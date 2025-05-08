<template>
  <div style="margin-top: -155px">
  <BigBanner />
  <p class="text-2xl/9 m-6">熱門行程</p>
  <div class="columns-4 mb-5">
    <TripCard />
  </div>
  <div class="bg-slate-100 rounded-md pb-5 pt-3 mb-5">
    <p class="text-2xl/9 m-6">地區篩選器</p>
  <filterCard :tags="['全部', '北部', '中部', '南部', '東部','離島']"
  v-model="currentRegion"class="mb-6"/>
  </div>
  
  <SearchResultBlock class="mb-5"/>
  
  </div>
  

</template>

<script setup>
import BigBanner from "@/components/official/BigBanner.vue";
import filterCard from "@/components/official/filterCard.vue";
import TripCard from "@/components/official/TripCard.vue";
import SearchResultBlock from "@/components/official/SearchResultBlock.vue";
import { ref } from "vue";

const currentRegion = ref("全部"); // 用來過濾行程的依據
</script>
