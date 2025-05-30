<template>
  <div>
    <h2 class="text-lg font-bold mb-4">我要評論</h2>
    <div
      v-if="commentableOrders.length === 0"
      class="text-sm text-gray-500 italic"
    >
      沒有符合評論條件的訂單。
    </div>
    <div
      v-for="order in commentableOrders"
      :key="order.orderId"
      class="border rounded p-4 mb-4 shadow"
    >
      <div class="font-bold mb-2">
        {{ order.description }}（結束日：{{ formatDate(order.endDate) }}）
      </div>
      <el-rate v-model="order.form.rating" :max="5" />
      <el-input
        type="textarea"
        v-model="order.form.content"
        placeholder="請輸入評論內容"
        :rows="4"
        class="mt-3"
      />
      <el-button type="primary" class="mt-3" @click="submitComment(order)"
        >送出評論</el-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/authStore";
import api from "@/utils/api";

const authStore = useAuthStore();

const allOrders = ref([]);

onMounted(async () => {
  try {
    const res = await api.get(
      `/orderhistory/list/${authStore.memberId}?statuses=Completed`
    );
    allOrders.value = res.data.map((o) => ({
      ...o,
      form: {
        rating: 5,
        content: "",
      },
    }));
  } catch (err) {
    console.warn("取得訂單失敗", err);
  }
});

const commentableOrders = computed(() =>
  allOrders.value.filter((order) => {
    const isCompleted = order.status === "Completed";
    const endDate = new Date(order.endDate);
    const isValidDate = !isNaN(endDate.getTime());
    const isEnded = endDate < new Date();
    const isNotCommented = !order.isCommented;
    return isCompleted && isValidDate && isEnded && isNotCommented;
  })
);

const submitComment = async (order) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning("請先登入才能發表評論");
    return;
  }

  try {
    const payload = {
      memberId: authStore.memberId,
      orderDetailId: order.orderDetailId,
      category: order.category,
      rating: order.form.rating,
      content: order.form.content,
    };
    const res = await api.post("/comments", payload);
    ElMessage.success(`「${order.description}」評論送出成功`);
    allOrders.value = allOrders.value.filter(
      (o) => o.orderDetailId !== order.orderDetailId
    );
  } catch (err) {
    const msg = err?.response?.data?.message || "發送評論失敗";
    ElMessage.error(msg);
  }
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}
</script>
