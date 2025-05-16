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
              <p>行程</p>
              <p>可賣：   席次：</p>
              <p>去程：</p>
              <p>回程：</p>
          </div>
          
          
          <normalButton class="absolute bottom-5 right-8 shadow"/>
        </div>
  
        <div class="w-1/2 bg-green-100 rounded-lg p-4">
          <!-- 資訊 03：出團日期表格 -->
          <GroupSchedule />
        </div>
      </div>
  
    </div>
  
    <div class="bg-white rounded-xl p-4 shadow mb-6 text-xl font-medium">
    {{ detail.description }}
  </div>
  
  <!-- 行程手風琴區塊 -->
  <div class="bg-white rounded-xl p-4 shadow mb-6">
    <div class="demo-collapse">
        <el-collapse v-model="activeNames" @change="handleChange">
          <el-collapse-item name="1">
            <template #title="{ isActive }">
              <div :class="['title-wrapper']" class="text-xl font-medium">
                第 1 天：台北 → 東京
              </div>
          </template>
            <div class="text-lg text-gray-900 leading-relaxed">
              搭乘早班機前往東京，抵達後前往淺草寺、晴空塔周邊自由活動，晚上入住新宿飯店。
            </div>
          </el-collapse-item>

          <el-collapse-item title="第 1 天：台北 → 東京" name="2">
            <div class="text-lg text-gray-900 leading-relaxed">
              搭乘早班機前往東京，抵達後前往淺草寺、晴空塔周邊自由活動，晚上入住新宿飯店。
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
    import axios from 'axios';

    import GroupSchedule from "@/components/official/GroupSchedule.vue";
    import normalButton from "@/components/official/normalButton.vue";


    const detail = ref({
      projectId: 0,
      title: '',
      description: '',
      cover: '',
    });

const route = useRoute();

onMounted(async () => {
  const id = route.params.id;

  try {
    const res = await axios.get(`https://localhost:7265/detail/${id}`);
    detail.value = res.data;
  } catch (err) {
    console.error("取得行程詳情失敗", err);
  }
});
  </script>