<template>
  <div class="max-w-7xl mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">我的收藏</h2>

    <div v-if="loading" class="text-gray-500 text-center">載入中...</div>

    <div v-else-if="collections.length === 0" class="text-gray-500 text-center">
      目前沒有收藏行程
    </div>

    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <el-card
        v-for="item in collections"
        :key="item.collectId"
        class="relative flex flex-col shadow-md hover:shadow-lg transition-shadow duration-200"
        body-style="display: flex; flex-direction: column; height: 100%; padding: 16px"
      >
        <!-- 卡片標題 -->
        <template #header>
          <div
            class="font-semibold text-base text-gray-800 leading-snug truncate"
            :title="item.title"
          >
            {{ item.title }}
          </div>
        </template>

        <!-- 封面圖 -->
        <img
          :src="item.coverPath || logoImage"
          alt="travel cover"
          class="w-full rounded-md mb-4 object-cover"
          style="height: 200px"
        />

        <!-- 行程資訊 -->
        <div class="flex-1 overflow-auto text-sm text-gray-600 mb-3">
          <p class="text-gray-500 mb-2">
            行程類型：{{ getTravelTypeName(item.travelType) }}
          </p>
          <transition name="fade">
            <p
              v-if="expanded[item.collectId]"
              class="line-clamp-5 leading-relaxed"
              style="overflow: auto; max-height: 80px"
            >
              {{ item.description || "（此為客製化行程，無說明）" }}
            </p>
          </transition>
        </div>

        <!-- 按鈕區塊 -->
        <div class="flex justify-between mt-auto pt-3 border-t border-gray-200">
          <el-button
            type="primary"
            plain
            size="small"
            @click="toggleDetails(item.collectId)"
          >
            {{ expanded[item.collectId] ? "收合資訊" : "詳細資訊" }}
          </el-button>

          <el-button
            type="success"
            plain
            size="small"
            @click="goToDetail(item)"
          >
            查看行程
          </el-button>

          <el-button
            type="danger"
            plain
            size="small"
            @click="handleDelete(item.collectId)"
          >
            取消收藏
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/utils/api";
import { useAuthStore } from "@/stores/authStore";
import { ElMessageBox, ElMessage } from "element-plus";
import logoImage from "@/assets/images/newlogo.png";
import { useRouter } from "vue-router";
const router = useRouter();

const goToDetail = (item) => {
  router.push({
    name: "DetailPage",
    params: {
      projectId: item.projectId,
      detailId: item.detailId,
      groupId: item.groupId,
    },
  });
};

const authStore = useAuthStore();
const collections = ref([]);
const loading = ref(true);
const expanded = ref({});

const getTravelTypeName = (type) => {
  return type === 0 ? "客製化行程" : "官方行程";
};

const toggleDetails = (id) => {
  expanded.value[id] = !expanded.value[id];
};

const loadCollections = async () => {
  loading.value = true;
  try {
    const res = await api.post("/CollectAndComment/getMyCollections", null, {
      params: { memberId: authStore.memberId },
    });
    collections.value = res.data;
    res.data.forEach((item) => {
      expanded.value[item.collectId] = false;
    });
  } catch (err) {
    console.error("讀取收藏失敗", err);
    collections.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (collectId) => {
  try {
    await ElMessageBox.confirm("確定要取消這筆收藏嗎？", "提示", {
      type: "warning",
      confirmButtonText: "確認",
      cancelButtonText: "取消",
    });
    await api.delete("/CollectAndComment/deleteCollection", {
      params: { collectId },
    });
    ElMessage.success("已取消收藏");
    const removed = collections.value.find((c) => c.collectId === collectId);
    if (removed) {
      const { travelId } = removed;
      const { useCollectStore } = await import("@/stores/collectStore");
      const collectStore = useCollectStore();
      collectStore.toggle(travelId);
    }
    await loadCollections();
  } catch (err) {
    if (err !== "cancel") {
      console.error("取消收藏失敗", err);
      ElMessage.error("取消收藏失敗");
    }
  }
};

onMounted(() => {
  if (authStore.isLoggedIn && authStore.memberId) {
    loadCollections();
  } else {
    ElMessage.warning("請先登入以查看收藏");
    authStore.triggerLoginModal();
  }
});
</script>

<style scoped>
/* 卡片動態效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
