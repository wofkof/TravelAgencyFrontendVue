<template>
  <div class="max-w-7xl mx-auto p-4 mb-5 border">
    <h1 class="mb-4 text-2xl font-bold">標題</h1>
    <div class="grid grid-cols-3 gap-6">
      <!-- 圖片區塊 -->
      <div>
        <div class="border rounded-lg bg-blue-300 w-full h-80 flex items-center justify-center">
          <img v-if="hoverImage" :src="hoverImage" class="object-cover w-full h-full rounded-lg" />
          <span v-else>封面</span>
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
              @mouseover="hoverImage = trip.image"
              @mouseleave="hoverImage = null"
            >
              <td>{{ trip.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模擬行程資料
const trips = ref([
  { name: '行程 1：東京五日遊', image: 'https://source.unsplash.com/400x400/?tokyo' },
  { name: '行程 2：首爾自由行', image: 'https://source.unsplash.com/400x400/?seoul' },
  { name: '行程 3：曼谷之旅', image: 'https://source.unsplash.com/400x400/?bangkok' }
])

// 儲存當前 hover 的圖片
const hoverImage = ref(null)
</script>


