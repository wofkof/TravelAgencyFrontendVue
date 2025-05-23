<template>

  <div class="max-w-7xl mx-auto p-4">
    <!-- 最外層容器 -->

<div class="bg-white rounded-xl p-4 shadow-lg mb-6">
  <!-- 行程資訊大矩形 -->

  <!-- 標題區塊 -->
  <div class="bg-yellow-100 rounded-lg p-4 mb-4 text-gray-800 font-semibold text-left text-2xl">
    {{ mainInfo.title }}
  </div>

  <div class="flex h-96">
    <!-- 二等分區塊 -->
     

    <div class="w-1/2 flex gap-2 p-4 text-left relative">
      <div class="w-1/2 rounded-md">
        <img :src="mainInfo.cover" alt="" class="h-56 w-max" >
      </div>
      <div class="text-lg font-bold my-2">
          <p>行程 {{mainInfo.number}}</p>
          <p>可賣： {{mainInfo.availableSeats}} 席次：{{ mainInfo.totalSeats }}</p>
          <p>去程：{{ formattedDepartureDate }}</p>
          <p>回程：{{ formattedReturnDate }}</p>
          <p>{{mainInfo.country}}/{{ mainInfo.region }}</p>
          <p>{{ mainInfo.price }}</p>
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
                    <tr v-for="g in groupList" :key="groupList.groupId">
                      <td>{{ formatDateTime(g.departure, { type: 'date' })}}</td>
                      <td>{{g.number}}</td>
                      <td>{{g.availableSeats}}</td>
                      <td>{{g.totalSeats}}</td>
                      <td>{{g.groupStatus}}</td>
                      <td>{{g.price}} 元</td>
                    </tr>
                  </tbody>
                
              </table>
          </div>
    </div>
  </div>

</div>

<div class="bg-white rounded-xl p-4 shadow mb-6 text-xl font-medium">
{{ mainInfo.description }}

  </div>

  <!-- 行程手風琴區塊 -->

  <div class="bg-white rounded-xl p-4 shadow mb-6">
    <div class="demo-collapse">
        <el-collapse >
          <el-collapse-item v-for="s in scheduleList" :key="scheduleList.scheduleId">
            <template #title="{ isActive }">
              <div :class="['title-wrapper']" class="text-xl font-medium">
                第{{s.day}}天
              </div>
            </template>
            <div class="text-lg text-gray-900 leading-relaxed">
              <p>{{ s.description }}</p>
              <p>{{ s.breakfast }}  {{ s.lunch }}  {{ s.dinner }}</p>
              <p>{{ s.hotel }}</p>
              <p>{{ s.attraction1 }}</p>
              <p>{{ s.attraction2 }}</p>
              <p>{{ s.attraction3 }}</p>
              <p>{{ s.attraction4 }}</p>
              <p>{{ s.attraction5 }}</p>
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
    import { formatDateTime } from '@/utils/formatDateTime';
    import normalButton from "@/components/official/normalButton.vue";

    const mainInfo = ref(
    {
      "projectId": 0,
      "title": "",
      "departure": "",
      "return": "",
      "description": "",
      "cover": "",
      "number": 0,
      "price": 0,
      "country": "",
      "region": "",
      "totalSeats": "",
      "availableSeats": ""
    }
  );
    const groupList = ref(
      [
        {
          "groupId": 0,
          "detailId":0,
          "departure": "",
          "return": "",
          "totalSeats": 0,
          "availableSeats": 0,
          "groupStatus": "",
          "price": 0,
          "number": 0
        },
      ]
    );

    const scheduleList = ref(
      [
        {
          "scheduleId": 0,
          "day": 0,
          "description": "",
          "breakfast": "",
          "lunch": "",
          "dinner": "",
          "hotel": "",
          "attraction1": 0,
          "attraction2": 0,
          "attraction3": 0,
          "attraction4": 0,
          "attraction5": 0
        }
      ]
    )

  const formattedDepartureDate = computed(() =>
    formatDateTime(mainInfo.value.departure, { type: 'date' })
  );
  const formattedReturnDate = computed(() =>
    formatDateTime(mainInfo.value.return, { type: 'date' })
  );
const route = useRoute();


onMounted(async () => {
  const projectId = route.params.projectId;
  const detailId = route.params.detailId;
  const groupId = route.params.groupId;
  
  try {
    const res = await api.get(`/OfficialSearch/getMainInfo/${projectId}/${detailId}/${groupId}`);
    mainInfo.value = res.data;
  } catch (err) {
    console.error("取得行程mainInfo失敗", err);
  }

  try {
    const glist = await api.get(`/OfficialSearch/getGrouplist/${projectId}`);
    groupList.value = glist.data;
  } catch (err) {
    console.error("取得行程groupList失敗", err);
  }

  try {
    const slist = await api.get(`/OfficialSearch/getSchedulelist/${detailId}`);
    scheduleList.value = slist.data;
    console.log(slist.data)
  } catch (err) {
    console.error("取得行程scheduleList失敗", err);
  }

});
  </script>
