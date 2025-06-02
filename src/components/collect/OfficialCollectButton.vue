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
import { computed } from "vue";
import api from "@/utils/api";
import FavoriteIcon from "@/components/tools/FavoriteIcon.vue";
import { useAuthStore } from "@/stores/authStore";
import { useCollectStore } from "@/stores/collectStore";

const props = defineProps({
  travelId: {
    type: Number,
    required: true,
  },
});

const authStore = useAuthStore();
const collectStore = useCollectStore();
const memberId = authStore.memberId || 0;
const collected = computed(() => collectStore.isCollected(props.travelId));

const toggleCollect = async () => {
  if (!memberId) return alert("請先登入");
  try {
    await api.post("/CollectAndComment/toggleCollection", {
      memberId,
      travelId: props.travelId,
      travelType: 0,
    });
    collectStore.toggle(props.travelId);
  } catch (err) {
    console.warn("收藏切換失敗", err);
  }
};
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
