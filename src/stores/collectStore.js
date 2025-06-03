import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/utils/api";

export const useCollectStore = defineStore("collect", () => {
  const collectedIds = ref(new Set());

  const setCollectedIds = (ids) => {
    collectedIds.value = new Set(ids);
  };

  const toggle = (travelId) => {
    if (collectedIds.value.has(travelId)) {
      collectedIds.value.delete(travelId);
    } else {
      collectedIds.value.add(travelId);
    }
  };

  const isCollected = (travelId) => {
    return collectedIds.value.has(travelId);
  };

  const loadCollections = async (memberId) => {
    try {
      const res = await api.post("/CollectAndComment/getMyCollections", null, {
        params: { memberId },
      });

      const ids = res.data
        .filter((c) => c.travelType === 0)
        .map((c) => c.travelId);

      collectedIds.value = new Set(ids);
    } catch (err) {
      console.warn("載入收藏失敗", err);
      collectedIds.value = new Set();
    }
  };

  return {
    collectedIds,
    setCollectedIds,
    toggle,
    isCollected,
    loadCollections,
  };
});
