<template>
  <h1 class="mb-4 text-2xl font-bold">精選遊輪假期</h1>
  <div class="my-3">
    <div v-if="loading">載入中...</div>
    <table v-else class="table-fixed w-full">
      <tbody>
        <tr v-for="(group, index) in groupedTrips" :key="index" class="border-b-2">
          <td
            v-for="trip in group"
            :key="trip.projectId"
            class="p-4 w-1/2 align-top"
          >
            <router-link
              :to="{ name: 'DetailPage', params: { projectId: trip.projectId,detailId: trip.detailId,groupId: trip.groupId} }"
            >
              <div class="rounded p-2 shadow">
                <p class="font-semibold">{{ trip.title }}</p>
                <!-- 你可以加其他 trip 資訊 -->
              </div>
            </router-link>
            
          </td>
          <!-- 若此列只有一筆，補上空白欄對齊 -->
          <td v-if="group.length === 1" class="p-4 w-1/2"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/utils/api';

const props = defineProps<{ category: string }>()

const trips = ref<any[]>([])
const loading = ref(true)

// 分組為每兩筆一組
const groupedTrips = computed(() => {
  const groups = []
  for (let i = 0; i < trips.value.length; i += 2) {
    groups.push(trips.value.slice(i, i + 2))
  }
  return groups
})

onMounted(async () => {
  loading.value = true
  console.log('收到的 category：', props.category)
  try {
    const response = await api.get(`/OfficialIndex/getcard/${encodeURIComponent(props.category)}`);
    trips.value = response.data;
    loading.value = false;
  } catch (error) {
    console.error('API 錯誤:', error)
    trips.value = [];
  } 
})
</script>
