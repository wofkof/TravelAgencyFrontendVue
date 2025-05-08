<template>
  <div style="margin-top: -155px">
  <BigBanner />
  <p class="text-2xl/9 m-6">熱門行程</p>
  <div class="columns-4">
    <TripCard />
  </div>
  <p class="text-2xl/9 m-6">地區篩選器</p>
  <filterCard :tags="['全部', '北部', '中部', '南部', '東部','離島']"
  v-model="currentRegion"class="mb-6"/>



    <div class="bg-white rounded-xl p-4 text-center text-gray-700 shadow">
      搜尋結果(未元件化)
      <router-link to="/Trip">
        <div class="bg-blue-100 rounded-lg p-4 mb-4">
        內容 01
        </div>
      </router-link>
        

        <div class="bg-blue-100 rounded-lg p-4 mb-4">
        內容 02
        </div>

        <div class="bg-blue-100 rounded-lg p-4 mb-4">
        內容 03
        </div>

        <div class="bg-blue-100 rounded-lg p-4">
        內容 04
        </div>
    </div>
  </div>
  

</template>

<script setup>
import BigBanner from "@/components/official/BigBanner.vue";
import filterCard from "@/components/official/filterCard.vue";
import TripCard from "@/components/official/TripCard.vue";
import { ref } from "vue";

const currentRegion = ref("全部"); // 用來過濾行程的依據
</script>
