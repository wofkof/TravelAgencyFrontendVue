<template>

  <div class="max-w-7xl mx-auto p-4">
    <!-- 最外層容器 -->

<div class="bg-white rounded-xl p-4 shadow-lg mb-6">
  <!-- 行程資訊大矩形 -->

  <!-- 標題區塊 -->
  <div class="bg-yellow-100 rounded-lg p-4 mb-4 text-gray-800 font-semibold text-left text-2xl">
    {{ detail.title }}
  </div>

  <div class="flex h-96">
    <!-- 二等分區塊 -->
     

    <div class="w-1/2 flex gap-2 p-4 text-left relative">
      <div class="w-1/2 rounded-md">
        <img :src="detail.cover" alt="" class="h-56 w-max" >
      </div>
      <div class="text-lg font-bold my-2">
          <p>行程 {{detail.number}}</p>
          <p>可賣： {{ detail.availableSeats }}  席次：{{ detail.totalSeats }}</p>
          <p>去程：{{ formattedDepartureDate }}</p>
          <p>回程：{{ formattedReturnDate }}</p>
      </div>
      
      
      <normalButton class="absolute bottom-5 right-8 shadow"/>
    </div>

    <div class="w-1/2 bg-green-100 rounded-lg p-4">
      <!-- 資訊 03：出團日期表格 -->
       <!-- <div class="mb-2 p-2 border border-solid rounded-md border-gray-400">
            <p class="mb-4">選擇行程</p>
            <div class="grid grid-cols-5 gap-x-2">
                <button type="button" class="border border-solid rounded-md border-blue-300 bg-blue-200">全部</button>
                <button type="button" class="border border-solid rounded-md border-blue-300 bg-blue-200">行程1</button>
            </div>
        </div> -->
          <div class="mb-2 border border-solid rounded-md border-gray-400">
              <table class="w-full text-sm text-center border-separate border-spacing-y-2">
                  <thead>
                      <tr>
                          <th class="border-b pb-1">出發日期</th>
                          <th class="border-b pb-1">行程</th>
                          <th class="border-b pb-1">可賣</th>
                          <th class="border-b pb-1">席次</th>
                          <th class="border-b pb-1">成行狀態</th>
                          <th class="border-b pb-1">價格</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>1</td>
                          <td>2</td>
                          <td>3</td>
                          <td>4</td>
                          <td>5</td>
                          <td>6 元</td>
                      </tr>
                  </tbody>
                
              </table>
          </div>
    </div>
  </div>

</div>

<div class="bg-white rounded-xl p-4 shadow mb-6 text-xl font-medium">
{{ detail.description }}

  </div>

  <!-- 行程手風琴區塊 -->

  <div class="bg-white rounded-xl p-4 shadow mb-6">
    <div class="demo-collapse">
        <el-collapse v-for="s in detail.schedules" :key="s.day">
          <el-collapse-item name="1">
            <template #title="{ isActive }">
              <div :class="['title-wrapper']" class="text-xl font-medium">
                第{{s.day}}天
              </div>
          </template>
            <div class="text-lg text-gray-900 leading-relaxed">
              {{s.scheduleDescription}}
            </div>
          </el-collapse-item>
    </el-collapse>
</div>


  </div>

  </div>

  </template>

  <script setup>
    import { onMounted, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import api from '@/utils/api';
    import axios from 'axios';
    import { formatDateTime } from '@/utils/formatDateTime';
    import normalButton from "@/components/official/normalButton.vue";

    const detail = ref(
    {
      "projectId": 0,
      "detailId": 0,
      "title": "",
      "description": "",
      "cover": "",
      "number": 0,
      "adultPrice": 0,
      "groupTravelId": 0,
      "departureDate": "",
      "returnDate": "",
      "availableSeats": 0,
      "totalSeats": 0,
      "schedules": [
        {
          "scheduleId": 0,
          "day": 0,
          "scheduleDescription": "",
          "breakfast": "",
          "lunch": "",
          "dinner": "",
          "hotel": "",
          "attraction1": 0,
          "attraction2": 0,
          "attraction3": 0,
          "attraction4": 0,
          "attraction5": 0
        },
      ]
    },
  );

const formattedDepartureDate = computed(() =>
  formatDateTime(detail.value.departureDate, { type: 'date' })
);
const formattedReturnDate = computed(() =>
  formatDateTime(detail.value.returnDate, { type: 'date' })
);

const route = useRoute();


onMounted(async () => {
  const projectId = route.params.projectId;
  const detailId = route.params.detailId;
  const groupId = route.params.groupId;
  try {
    const res = await api.get(`/OfficialSearch/detail/${projectId}/${detailId}/${groupId}`);
    detail.value = Array.isArray(res.data) ? res.data[0] : res.data;
  } catch (err) {
    console.error("取得行程詳情失敗", err);
  }
});
  </script>
