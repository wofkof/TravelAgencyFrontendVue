<template>
  <div class="" v-loading="loading">
    <div class="min-h-48 grid grid-cols-4 gap-4">
      <div
        v-for="trip in visibleTrips"
        :key="trip.projectId"
        class="relative bg-slate-300 h-72 p-0 rounded-md grid grid-rows-5"
      >
        <router-link
          :to="{
            name: 'DetailPage',
            params: {
              projectId: trip.projectId,
              detailId: trip.detailId,
              groupId: trip.groupId,
            },
          }"
          class="bg-slate-300 h-72 p-0 rounded-md grid grid-rows-5"
        >
          <img
            :src="trip.cover || '/src/assets/images/logo.png'"
            alt="封面"
            class="row-span-4 row-start-1 w-full h-64 object-cover rounded-md"
          />
          <div class="relative bg-slate-100 rounded-b-md h-full">
            <p class="absolute left-0 m-2 text-lg font-semibold">
              {{ trip.title }}
            </p>
          </div>
        </router-link>
        <!-- 聖凱新增 -->
        <div class="absolute bottom-1 right-1 p-1 z-10">
          <OfficialCollectIcon :travelId="trip.projectId" @click.stop />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import api from "@/utils/api";
import OfficialCollectIcon from "@/components/collect/OfficialCollectButton.vue";

const props = defineProps<{ category: string }>();

const trips = ref<any[]>([]);
const visibleTrips = ref<any[]>([]);
const loading = ref(true);
let intervalId: number | undefined = undefined;

function getRandomTrips(source: any[], count = 4) {
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

onMounted(async () => {
  loading.value = true;
  console.log("收到的 category：", props.category);
  try {
    const response = await api.get(
      `/OfficialIndex/getcard/${encodeURIComponent(props.category)}`
    );
    trips.value = response.data;
    visibleTrips.value = getRandomTrips(trips.value);
    loading.value = false;

    intervalId = window.setInterval(() => {
      visibleTrips.value = getRandomTrips(trips.value);
    }, 30000); // 每 30 秒換一次
  } catch (error) {
    console.error("API 錯誤:", error);
    trips.value = [];
  }
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
