<template>
  <div style="margin-top: -155px">
    <BigBanner />
    <div class="max-w-7xl mx-auto p-4">
      <p class="text-2xl font-bold m-6">熱門行程</p>
      <TripCard :category="category" />
    </div>
    
    <div class="bg-slate-100 rounded-md pb-1 pt-3 m-5">
    <filterCard :tags="['全部', '日本', '北海道', '東北', '關東', '中國','四國', '中部', '近畿', '九州', '沖繩',  '櫻花', '文化', '雪']"
    v-model="currentRegion"class="mb-6"/>
    </div>
    
    <TripInfos :category="category" :keyword="currentRegion" />

  </div>
  

</template>

<script lang="ts" setup>
import BigBanner from "@/components/official/BigBanner.vue";
import filterCard from "@/components/official/filterCard.vue";
import TripCard from "@/components/official/TripCard.vue";
import SearchResultBlock from "@/components/official/SearchResultBlock.vue";
import TripInfos from "@/components/official/TripInfos.vue";
import { ref } from "vue";

const currentRegion = ref("全部"); // 用來過濾行程的依據

const props = defineProps<{ category: string }>();
</script>
