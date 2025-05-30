<template>
  <div class="max-w-7xl mx-auto p-4 mb-5 border">
    <h1 class="mb-4 text-2xl font-bold">行程清單</h1>
    <div class="grid grid-cols-3 gap-6">
      <!-- 圖片區塊 -->
      <div>
        <div class="border rounded-lg bg-blue-300 w-full h-80 flex items-center justify-center">
          <img v-if="hoverImage" :src="currentImage" class="object-cover w-full h-full rounded-lg" />
          <img v-else src="/src/assets/images/newlogo.png" class="object-cover"/>
        </div>
      </div>

      <!-- 表格區塊 -->
      <div class="col-span-2">
        <table class="table-fixed w-full">
          <tbody>
            <tr
              v-for="(trip, index) in trips"
              :key="index"
              class="border-b-2 cursor-pointer hover:bg-gray-100"
              @mouseenter="currentImage = trip.cover"
              @mouseover="hoverImage = trip.cover"
              @mouseleave="hoverImage = null"
            >
              <router-link
                v-for="trip in trips"
                :key="trip.projectId"
                :to="{ name: 'DetailPage', params: { projectId: trip.projectId,detailId: trip.detailId,groupId: trip.groupId} }"
              >
                <td>{{ trip.title }}</td>
                <td class="text-right">{{ trip.country }} {{ trip.region }}</td>
                <td class="text-right text-sm text-gray-500">{{ trip.departureDate?.split('T')[0] }}</td>
              </router-link>
              
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "@/utils/api";

// Props from parent
const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    default: "全部",
  },
});

// 狀態定義
const trips = ref([]);
const hoverImage = ref(null);
const currentImage = ref("");

// 抓 API 資料
const fetchTrips = async () => {
  try {
    const response = await api.get(`/OfficialIndex/getlistInfo/${encodeURIComponent(props.category)}/${props.keyword}`);
    trips.value = response.data;
    if (trips.value.length > 0) {
      currentImage.value = trips.value[0].cover;
    }
  } catch (error) {
    console.error("取得行程失敗：", error);
  }
};

// 載入與監聽 keyword 或 category 變更
onMounted(fetchTrips);
watch(() => [encodeURIComponent(props.category), props.keyword], fetchTrips);
</script>
