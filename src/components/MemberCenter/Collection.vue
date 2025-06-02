<template>
  <div>
    <h2 class="text-xl font-bold mb-4">我的收藏</h2>
    <div v-if="loading">載入中...</div>
    <div v-else-if="collections.length === 0">目前沒有收藏行程</div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <el-card
        v-for="item in collections"
        :key="item.collectId"
        class="relative flex flex-col"
      >
        <template #header>
          <div
            class="font-semibold text-sm leading-snug"
            style="min-height: 48px"
          >
            {{ item.title }}
          </div>
        </template>

        <img
          :src="item.coverPath || logoImage"
          alt="travel cover"
          class="w-full mb-3 object-cover rounded"
          style="height: 230px"
        />

        <div class="flex-1 overflow-auto pr-1">
          <p class="text-xs text-gray-500 mb-1">
            行程類型：{{ getTravelTypeName(item.travelType) }}
          </p>
          <transition name="fade">
            <p
              v-if="expanded[item.collectId]"
              class="text-gray-600 text-sm line-clamp-5"
              style="overflow: auto; max-height: 80px"
            >
              {{ item.description || "（此為客製化行程，無說明）" }}
            </p>
          </transition>
        </div>
        <!-- ✅ 下方按鈕同側靠右 -->
        <div class="flex justify-end gap-2 mt-auto pt-2">
          <el-button
            type="primary"
            plain
            size="small"
            @click="toggleDetails(item.collectId)"
          >
            {{ expanded[item.collectId] ? "收合資訊" : "詳細資訊" }}
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

const authStore = useAuthStore();
const collections = ref([]);
const loading = ref(true);
const expanded = ref({}); // 控制每個 collectId 是否展開

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
    // 初始化展開狀態為 false
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

<style></style>
