<template>
  <div class="max-w-7xl mx-auto p-4 mb-5">
    <h1 class="mb-4 text-2xl font-bold">行程清單</h1>
    <el-empty
    v-if="trips.length === 0"
    description="暫無行程"
    image-size="120"
    />
    <div
      v-for="(chunk, index) in visibleChunks"
      :key="index"
      class="mb-6 border rounded-lg shadow-md"
      v-else
    >
      <!-- 區塊標題 -->
      <div class="bg-gray-100 p-3 font-semibold">
        {{ chunk[0].country }} | {{ formatMonth(chunk[0].departureDate) }} 出發
        <button
          class="float-right text-blue-500 hover:underline"
          @click="toggleExpand(index)"
        >
          {{ expandedIndexes.includes(index) ? "收合" : "展開" }}
        </button>
      </div>

      <div
        class="grid grid-cols-3 gap-6 p-4"
        v-if="expandedIndexes.includes(index)"
      >
        <!-- 圖片區塊 -->
        <div
          class="border rounded-lg bg-blue-200 w-full h-80 flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="hoverImage[index]"
            :src="hoverImage[index]"
            class="object-cover w-full h-full rounded-lg"
          />
          <img
            v-else
            :src="currentImageMap[index] || '/src/assets/images/newlogo.png'"
            class="object-cover w-full h-full rounded-lg"
          />
        </div>

        <!-- 表格區塊 -->
        <div class="col-span-2">
          <el-table
            :data="chunk"
            style="width: 100%"
            @row-click="goToDetail"
            highlight-current-row
            :row-class-name="handleRowClass"
            @cell-mouse-enter="(row) => handleCellEnter(row, index)"
            @cell-mouse-leave="() => handleCellLeave(index)"
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
                {{ row.departureDate?.split("T")[0] }}
              </template>
            </el-table-column>

            <el-table-column
              label="收藏"
              align="center"
              header-align="center"
              width="80"
            >
              <template #default="{ row }">
                <OfficialCollectIcon :travelId="row.projectId" />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 懶加載按鈕 -->
    <div class="text-center mt-6">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="loadMore"
        v-if="hasMore"
      >
        載入更多
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/utils/api";
import OfficialCollectIcon from "@/components/collect/OfficialCollectButton.vue";

const router = useRouter();
const props = defineProps({
  category: String,
  keyword: String,
});

const trips = ref([]);
const hoverImage = ref({});
const chunkSize = 5;
const chunkIndex = ref(1);
const expandedIndexes = ref([0]);
const currentImageMap = ref({});

watch(trips, () => {
  for (let i = 0; i < chunks.value.length; i++) {
    const chunk = chunks.value[i];
    if (chunk.length > 0) {
      currentImageMap.value[i] = chunk[0].cover;
    }
  }
});

const chunks = computed(() => {
  const list = [];
  for (let i = 0; i < trips.value.length; i += chunkSize) {
    list.push(trips.value.slice(i, i + chunkSize));
  }
  return list;
});

const visibleChunks = computed(() => chunks.value.slice(0, chunkIndex.value));
const hasMore = computed(() => chunkIndex.value < chunks.value.length);

function loadMore() {
  chunkIndex.value++;
  expandedIndexes.value.push(chunkIndex.value - 1);
}

function toggleExpand(index) {
  const i = expandedIndexes.value.indexOf(index);
  if (i > -1) expandedIndexes.value.splice(i, 1);
  else expandedIndexes.value.push(index);
}

function goToDetail(row) {
  router.push({
    name: "DetailPage",
    params: {
      projectId: row.projectId,
      detailId: row.detailId,
      groupId: row.groupId,
    },
  });
}

function handleCellEnter(row, index) {
  hoverImage.value[index] = row.cover;
}
function handleCellLeave(index) {
  hoverImage.value[index] = null;
}
function handleRowClass() {
  return "cursor-pointer hover:bg-gray-100";
}

function formatMonth(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`;
}

const fetchTrips = async () => {
  try {
    const res = await api.get(
      `/OfficialIndex/getlistInfo/${encodeURIComponent(props.category)}/${
        props.keyword
      }`
    );
    trips.value = res.data;
  } catch (err) {
    console.error("取得行程失敗：", err);
  }
};

onMounted(fetchTrips);
watch(() => [props.category, props.keyword], fetchTrips);
</script>

<style scoped>
button {
  transition: all 0.2s ease-in-out;
}
</style>
