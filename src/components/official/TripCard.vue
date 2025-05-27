<template>
  <div class="grid grid-cols-4 gap-4" v-loading="loading">
    <div class="min-h-48">
      <router-link
              v-for="trip in trips"
              :key="trip.projectId"
              :to="{ name: 'DetailPage', params: { projectId: trip.projectId,detailId: trip.detailId,groupId: trip.groupId} }"
              class="bg-slate-300 h-96 p-0 rounded-md grid grid-rows-5"
            ><img :src="trip.cover || '/src/assets/images/logo.png'" alt="封面" class="row-span-4 row-start-1 w-full h-64 object-cover">
            <div class="relative bg-slate-100 rounded-b-md h-full">
            <p class="absolute left-0 m-2 text-sm font-bold">{{ trip.title }}</p>
            <div class="absolute bottom-2 right-2 text-xs">
              收藏
            </div>
          </div>
        </router-link>
    </div>
   
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api';

// props 接收路由傳來的 category
const props = defineProps<{ category: string }>()

const trips = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  console.log('收到的 category：', props.category)
  try {
    const response = await api.get(`/OfficialIndex/getcard/${encodeURIComponent(props.category)}`)
    trips.value = response.data;
    loading.value = false;
  } catch (error) {
    console.error('API 錯誤:', error)
    trips.value = []
  } 
})
</script>
