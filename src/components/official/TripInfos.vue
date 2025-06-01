<template>
  <div class="max-w-7xl mx-auto p-4 mb-5 border">
    <h1 class="mb-4 text-2xl font-bold">行程清單</h1>
    <div class="grid grid-cols-3 gap-6">
      <!-- 圖片區塊 -->
      <div>
        <div class="border rounded-lg bg-blue-200 w-full h-80 flex items-center justify-center">
          <img
            v-if="hoverImage"
            :src="currentImage"
            class="object-cover w-full h-full rounded-lg"
          />
          <img v-else src="/src/assets/images/newlogo.png" class="object-cover" />
        </div>
      </div>

      <!-- 表格區塊 -->
      <div class="col-span-2">
        <el-table
          :data="trips"
          style="width: 100%"
          @row-click="goToDetail"
          highlight-current-row
          :row-class-name="handleRowClass"
          @cell-mouse-enter="handleCellEnter"
          @cell-mouse-leave="handleCellLeave"
        >
          <el-table-column
            prop="title"
            label="標題"
            header-align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="地區"
            align="center"
            header-align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.country }} {{ row.region }}
            </template>
          </el-table-column>
          <el-table-column
            label="出發日期"
            align="center"
            header-align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.departureDate?.split('T')[0] }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'

const router = useRouter()

// Props from parent
const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  keyword: {
    type: String,
    default: '全部',
  },
})

// 狀態定義
const trips = ref([])
const hoverImage = ref(null)
const currentImage = ref('')

// 點擊跳轉
function goToDetail(row) {
  router.push({
    name: 'DetailPage',
    params: {
      projectId: row.projectId,
      detailId: row.detailId,
      groupId: row.groupId,
    },
  })
}

// Hover 換圖邏輯
function handleCellEnter(row) {
  hoverImage.value = row.cover
  currentImage.value = row.cover
}
function handleCellLeave() {
  hoverImage.value = null
}

// 表格樣式
function handleRowClass() {
  return 'cursor-pointer hover:bg-gray-100'
}

// 抓資料
const fetchTrips = async () => {
  try {
    const response = await api.get(
      `/OfficialIndex/getlistInfo/${encodeURIComponent(props.category)}/${props.keyword}`
    )
    trips.value = response.data
    if (trips.value.length > 0) {
      currentImage.value = trips.value[0].cover
    }
  } catch (error) {
    console.error('取得行程失敗：', error)
  }
}

onMounted(fetchTrips)
watch(() => [encodeURIComponent(props.category), props.keyword], fetchTrips)
</script>
