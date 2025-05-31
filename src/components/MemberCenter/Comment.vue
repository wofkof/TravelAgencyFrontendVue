<template>
  <div>
    <h2 class="text-lg font-bold mb-4">評論管理</h2>

    <el-tabs v-model="activeTab" type="card">
      <!-- 待評論 Tab -->
      <el-tab-pane label="待評論" name="pending">
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
          <el-button type="primary" class="mt-3" @click="submitComment(order)">
            送出評論
          </el-button>
        </div>
      </el-tab-pane>

      <!-- 已評論 Tab -->
      <el-tab-pane label="已評論" name="completed">
        <div
          v-if="commentedOrders.length === 0"
          class="text-sm text-gray-500 italic"
        >
          尚未有評論紀錄。
        </div>
        <div
          v-for="order in commentedOrders"
          :key="order.orderId"
          class="border rounded p-4 mb-4 bg-gray-50"
        >
          <div class="font-bold mb-2">
            {{ order.description }}（結束日：{{ formatDate(order.endDate) }}）
          </div>
          <div class="text-sm text-gray-700">
            <span class="mr-2">評分：</span>
            <el-rate
              :model-value="commentMap[order.orderDetailId]?.rating || 0"
              disabled
            />
          </div>
          <div class="text-sm text-gray-700 mt-2">
            評論內容：{{ commentMap[order.orderDetailId]?.content || "無內容" }}
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/authStore";
import api from "@/utils/api";

const authStore = useAuthStore();

const allOrders = ref([]);
const activeTab = ref("pending");
const commentMap = ref({});

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

const commentedOrders = computed(() =>
  allOrders.value.filter((order) => {
    const isCompleted = order.status === "Completed";
    const endDate = new Date(order.endDate);
    const isValidDate = !isNaN(endDate.getTime());
    const isEnded = endDate < new Date();
    const isCommented = order.isCommented;
    return isCompleted && isValidDate && isEnded && isCommented;
  })
);

onMounted(async () => {
  if (!authStore.memberId) return;
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

    const commentRes = await api.get(`/comments/member/${authStore.memberId}`);
    const rawComments = commentRes.data || [];
    commentMap.value = Object.fromEntries(
      rawComments.map((c) => [
        c.orderDetailId,
        { rating: c.rating, content: c.content },
      ])
    );
  } catch (err) {
    console.warn("取得訂單失敗", err);
  }
});

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
    ElMessage.success(
      res.data.message || `「${order.description}」評論送出成功`
    );
    activeTab.value = "completed";
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
