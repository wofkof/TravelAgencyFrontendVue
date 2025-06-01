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
              :to="{ name: 'DetailPage', params: { projectId: trip.projectId, detailId: trip.detailId, groupId: trip.groupId } }"
            >
              <div class="rounded p-2 shadow">
                <p class="font-semibold">{{ trip.title }}</p>
              </div>
            </router-link>
          </td>
          <td v-if="group.length === 1" class="p-4 w-1/2"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import api from '@/utils/api';

const props = defineProps<{ category: string }>()

const allTrips = ref<any[]>([])       // 存全部
const displayTrips = ref<any[]>([])   // 存目前顯示的 10 筆
const loading = ref(true)

let intervalId: ReturnType<typeof setInterval> | null = null

// 隨機挑 10 筆
function pickRandomTrips() {
  const shuffled = [...allTrips.value].sort(() => Math.random() - 0.5)
  displayTrips.value = shuffled.slice(0, 10)
}

// 每 2 筆一列
const groupedTrips = computed(() => {
  const groups = []
  for (let i = 0; i < displayTrips.value.length; i += 2) {
    groups.push(displayTrips.value.slice(i, i + 2))
  }
  return groups
})

onMounted(async () => {
  loading.value = true
  try {
    const response = await api.get(`/OfficialIndex/getcard/${encodeURIComponent(props.category)}`);
    allTrips.value = response.data;
    pickRandomTrips()
    intervalId = setInterval(pickRandomTrips, 30000) // 每 30 秒重選
  } catch (error) {
    console.error('API 錯誤:', error)
    allTrips.value = []
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
