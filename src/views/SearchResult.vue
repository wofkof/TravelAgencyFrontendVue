<template>
  <div class="max-w-7xl mx-auto p-4">

    <div class="flex gap-4">
      <!-- 左邊篩選器區塊 -->
      <div class="w-1/4 bg-gray-100 rounded-xl p-4 text-center text-gray-700">
        <div class="text-left p-4 text-lg">
          <h1 class="text-xl font-semibold">類型</h1>
          <label><input type="checkbox" :value="0" v-model="selectedTypes" /> 國內旅遊</label><br>
          <label><input type="checkbox" :value="1" v-model="selectedTypes" /> 國外旅遊</label><br>
          <label><input type="checkbox" :value="2" v-model="selectedTypes" /> 郵輪</label>
          <hr class="my-2" />
          <h1 class="text-xl font-semibold">預算</h1>
          <div class="slider-demo-block">
            <el-slider v-model="value" range :format-tooltip="formatTooltip" />
          </div>
          <hr class="my-2"/>
          <h1 class="text-xl font-semibold">旅遊天數</h1>
          <input type="checkbox" value="1-4" v-model="selectedDays"> 1-4<br>
          <input type="checkbox" value="5-9" v-model="selectedDays"> 5-9<br>
          <input type="checkbox" value="10-14" v-model="selectedDays"> 10-14<br>
          <input type="checkbox" value="其他" v-model="selectedDays"> 其他
          <hr class="my-2"/>
        </div>
      </div>

      <!-- 右邊結果區塊 -->
      <div class="w-3/4">
        <div class="pb-4 mb-5 text-center">
          <div v-if="filteredResults.length > 0">
            <router-link
              v-for="item in filteredResults"
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
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, watch,computed,reactive,onMounted } from 'vue';
import { useSearchResultStore } from '@/stores/useSearchResultStore';

import type { CSSProperties } from 'vue';

const searchResultStore = useSearchResultStore();
const results = computed(() => searchResultStore.searchResult);

;

onMounted(() => {
  console.log('取得搜尋結果：', results.value);
});

interface Mark {
  style: CSSProperties
  label: string
}

type Marks = Record<number, Mark | string>

const value = ref([0, 30])
const formatTooltip = (val: number) => {
  return val*3000 + 3000;
}

const selectedTypes = ref<number[]>([]); // 類型
const selectedDays = ref<string[]>([]);  // 天數

const filteredResults = computed(() => {
  const [rawMin, rawMax] = value.value;
  const min = rawMin * 3000 + 3000;
  const max = rawMax * 3000 + 3000;

  return searchResultStore.searchResult.filter(item => {
    // 價格篩選
    const priceOk = item.price >= min && item.price <= max;

    // 類別篩選（如果有選才比對）
    const typeOk = selectedTypes.value.length === 0 || selectedTypes.value.includes(item.category);

    // 天數篩選
    let dayOk = true;
    if (selectedDays.value.length > 0 && item.days != null) {
      // 預期 item.days 是一個數字
      const day = item.days;
      dayOk = selectedDays.value.some(range => {
        if (range === '1-4') return day >= 1 && day <= 4;
        if (range === '5-9') return day >= 5 && day <= 9;
        if (range === '10-14') return day >= 10 && day <= 14;
        if (range === '其他') return day < 1 || day > 14;
        return false;
      });
    }

    return priceOk && typeOk && dayOk;
  });
});




</script>

<style scoped>
  .slider-demo-block {
    max-width: 600px;
    display: flex;
    align-items: center;
  }
  .slider-demo-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
  }
</style>