<!-- 聖凱新增 -->
<template>
  <el-tooltip :content="collected ? '取消收藏' : '加入收藏'" placement="top">
    <span
      class="action-icon favorite-icon-action"
      role="button"
      tabindex="0"
      :aria-pressed="collected"
      :aria-label="collected ? '取消收藏' : '加入收藏'"
      @click.stop="toggleCollect"
    >
      <FavoriteIcon
        :is-favorite="collected"
        :size="18"
        :class="{ favorited: collected }"
      />
    </span>
  </el-tooltip>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/utils/api";
import FavoriteIcon from "@/components/tools/FavoriteIcon.vue";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  travelId: {
    type: Number,
    required: true,
  },
});

const authStore = useAuthStore();
const memberId = authStore.memberId || 0;
const collected = ref(false);

const fetchCollectStatus = async () => {
  try {
    const res = await api.post("/CollectAndComment/getMyCollections", null, {
      params: { memberId },
    });
    const found = res.data.find(
      (c) => c.travelId === props.travelId && c.travelType === 0
    );
    collected.value = !!found;
  } catch (err) {
    console.warn("讀取收藏失敗", err);
  }
};

const toggleCollect = async () => {
  if (!memberId) return alert("請先登入");
  try {
    const res = await api.post("/CollectAndComment/toggleCollection", {
      memberId,
      travelId: props.travelId,
      travelType: 0,
    });
    collected.value = res.data.collected;
  } catch (err) {
    console.warn("收藏切換失敗", err);
  }
};

onMounted(() => {
  if (!props.travelId) {
    console.warn("❗ travelId 為無效值：", props.travelId);
    return;
  }
  console.log("[❤️ mounted] travelId =", props.travelId);
  fetchCollectStatus();
});
</script>

<style scoped>
.favorite-icon-action {
  color: #ca0d1d;
}
.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.favorite-icon-wrapper {
  transition: transform 0.2s ease;
}

.favorite-icon-wrapper:hover {
  transform: scale(1.2);
}
</style>
