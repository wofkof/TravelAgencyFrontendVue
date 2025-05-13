<template>
  <div v-if="results.length > 0">
    <router-link
      v-for="item in results"
      :key="item.id"
      to="/Trip"
      class="block"
    >
      <div class="bg-blue-100 rounded-lg p-4 mb-4 grid grid-cols-3 gap-4 h-auto">
        <div class="bg-blue-200 w-full h-52">img</div>
        <div class="col-span-2 bg-slate-300 w-full relative p-4">
          <div class="text-start">
            {{ item.title }}
            <p>{{ item.description }}</p>
          </div>
          <div class="absolute bottom-4 right-7 w-20 bg-white">
            {{ item.price }}
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
