<template>
  <div v-if="results.length > 0">
    <router-link
      v-for="item in results"
      :key="item.projectId"
      :to="{ name: 'DetailPage', params: { projectId: item.projectId,detailId: item.detailId,groupId: item.groupId} }"
      class="block"
    >
      <div class="shadow-lg rounded-lg p-4 mb-4 grid grid-cols-3 gap-4 h-auto">
        <div class="shadow-lg w-full h-52">
          <img :src="item.cover" alt="" class="h-full object-cover">
        </div>
        <div class="col-span-2 w-full relative p-4">
          <div class="text-start">
            <p class="text-2xl font-bold">{{ item.title }}</p>
            <p>{{ item.description }}</p>
          </div>
          <div class="flex absolute bottom-4 right-0 w-32 text-center text-xl text-red-500">
           NT${{ item.price }}
          </div>
        </div>
      </div>
    </router-link>
  </div>
  <div v-else class="text-gray-400 p-4">查無資料</div>
</template>

<script setup>
import { useSearchResultStore } from '@/stores/useSearchResultStore';
import { computed,onMounted } from 'vue';


const searchResultStore = useSearchResultStore();
const results = computed(() => searchResultStore.searchResult);

onMounted(() => {
  console.log('SRList 取得結果：', results.value);
});
</script>
