<template>
  
  
  <div class="max-w-7xl mx-auto p-4">
  <BigBanner class="mb-6 bg-slate-600"/>
  <p class="text-2xl/9 m-6">熱門行程</p>
  <div class="columns-4">
    <TripCard />
  </div>
  <p class="text-2xl/9 m-6">地區篩選器</p>
  <filterCard class="mb-6"/>



    <div class="bg-white rounded-xl p-4 text-center text-gray-700 shadow">
      搜尋結果
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
</script>
