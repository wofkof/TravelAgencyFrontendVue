<template>
  <div class="awaiting-order-actions">
    <div v-if="!isEffectivelyExpired && orderStatusAllowsPayment" class="countdown text-sm mb-2">
      付款剩餘：<span :class="{'text-red-500': isUrgent}">{{ formattedTime }}</span>
    </div>
    <div v-else-if="isEffectivelyExpired && orderStatusAllowsPayment" class="countdown text-sm text-red-600 mb-2">
      已逾期
    </div>
    <div v-else-if="!orderStatusAllowsPayment && order.status !== 'Awaiting'" class="countdown text-sm text-gray-500 mb-2">
      狀態：{{ order.status }}
    </div>

    <el-button
      v-if="orderStatusAllowsPayment && !isEffectivelyExpired"
      type="primary"
      size="small"
      @click="goToPayment"
      :disabled="isEffectivelyExpired"
    >
      前往付款
    </el-button>
    <el-button
      v-else-if="orderStatusAllowsPayment && isEffectivelyExpired"
      type="info"
      size="small"
      disabled
    >
      已逾期
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { useHesitationStore } from '@/stores/hesitationStore'; // 引入 store

const props = defineProps({
  order: {
    type: Object,
    required: true,
    // default: () => ({
    //   orderId: null,
    //   expiresAt: null, // 這個仍然是訂單原始的、可能變動的到期時間
    //   merchantTradeNo: null,
    //   status: '',
    // })
  }
});

const router = useRouter();
const hesitationStore = useHesitationStore(); // 使用 store

const now = ref(dayjs());
const timerId = ref(null);

const emit = defineEmits(['order-visually-expired']); // 1. 定義事件

// **修改點**: 決定倒數計時器應該使用的到期時間
const effectiveExpiresAt = computed(() => {
  if (!props.order || !props.order.orderId) return null;
  // 如果 store 中有此訂單的記錄，則使用 store 中的固定到期時間
  const storeExpiry = hesitationStore.getEffectiveExpiresAt(props.order.orderId);
  if (storeExpiry) {
    return storeExpiry;
  }
  // 否則，如果猶豫期尚未正式啟動，我們暫時使用 props 傳入的 expiresAt (主要用於顯示，但不一定是倒數的依據)
  // 或者，如果業務邏輯是在猶豫期未啟動前不顯示倒數，這裡可以返回 null
  return props.order.expiresAt;
});

const timeRemaining = computed(() => {
  // **修改點**: 基於 effectiveExpiresAt 計算
  if (!effectiveExpiresAt.value) return 0;
  const expiryDate = dayjs(effectiveExpiresAt.value);
  const diff = expiryDate.diff(now.value, 'second');
  return Math.max(0, diff);
});

// **新增**: 根據 effectiveExpiresAt 判斷是否真的過期
const isEffectivelyExpired = computed(() => {
    // 只有當 hesitationStore 記錄了此訂單的啟動，且時間到了，才算真的過期
    // 或者如果 effectiveExpiresAt.value 為 null (意味著猶豫期根本沒開始或沒提供時間)，也視為某種 "不可用" 狀態
    if (!hesitationStore.getEffectiveExpiresAt(props.order.orderId)) {
        // 如果猶豫期從未在 store 中被啟動，根據需求判斷是否顯示為逾期
        // 若希望在猶豫期未啟動前不顯示倒數，則 isEffectivelyExpired 可以為 true 或 false，取決於UI想如何呈現
        // 這裡假設如果 store 沒有記錄，就看 props.order.expiresAt 是否已過期 (但這可能不是最終想要的行為)
        // 更安全的做法是，如果 store 沒記錄，就不啟動強制的 "已逾期" 狀態，除非 props.order.expiresAt 本身就過期了
        if (!props.order.expiresAt) return true; // 沒有任何到期時間，視為逾期
        return dayjs(props.order.expiresAt).isBefore(dayjs());
    }
    return timeRemaining.value <= 0;
});


const formattedTime = computed(() => {
  if (timeRemaining.value <= 0) {
    return '00:00';
  }
  const minutes = Math.floor(timeRemaining.value / 60);
  const seconds = timeRemaining.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

const isUrgent = computed(() => timeRemaining.value > 0 && timeRemaining.value <= 5 * 60);

const orderStatusAllowsPayment = computed(() => {
  return props.order.status === 'Awaiting';
});

const updateTimer = () => {
  now.value = dayjs();
  // isEffectivelyExpired 會自動根據 timeRemaining 更新
  // 所以這裡主要是檢查 timeRemaining <= 0 時停止計時器
  if (timeRemaining.value <= 0) {
    if (timerId.value) {
      clearInterval(timerId.value);
      timerId.value = null;
      console.log(`[AOA Cell - updateTimer] Timer stopped for Order ID ${props.order.orderId} as time is up.`);
    }
    // 2. 發出事件，並傳遞訂單 ID
    // 確保 props.order.orderId 是有效的
    if (props.order && props.order.orderId) {
      emit('order-visually-expired', props.order.orderId);
    }
  }
};

const goToPayment = () => {
  // goToPayment 的邏輯通常不變，但傳遞的 exp 可以考慮是否要傳遞 effectiveExpiresAt
  if (props.order.orderId && props.order.merchantTradeNo && props.order.expiresAt) {
    router.push({
      name: 'OrderPayment',
      query: {
        orderId: props.order.orderId,
        mtn: props.order.merchantTradeNo,
        // 這裡傳遞 props.order.expiresAt 還是 effectiveExpiresAt.value 取決於付款頁面期望接收哪個
        // 通常是 props.order.expiresAt，因為付款頁面本身可能有自己的邏輯
        exp: props.order.expiresAt,
      }
    });
  } else {
    console.error('缺少訂單詳細資訊，無法導向付款頁面:', props.order);
  }
};

// **修改點**: watch 的目標和邏輯
// 我們現在主要觀察 effectiveExpiresAt 的變化 (它來自 store 或 props)
// 以及 orderId 的變化 (因為 props.order 可能整個被替換)
watch([() => props.order.orderId, effectiveExpiresAt], ([newOrderId, newEffectiveExpiresAt], [oldOrderId, oldEffectiveExpiresAt]) => {
  console.log(`[AOA Cell - Watch] Order ID: ${newOrderId}, EffectiveExpiresAt: ${newEffectiveExpiresAt}`);

  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = null;
    console.log(`[AOA Cell - Watch] Cleared existing timer for Order ID ${oldOrderId || newOrderId}.`);
  }

  // 只有當 store 記錄了此訂單的猶豫期已啟動時，我們才真正啟動倒數計時器
  // 並且 newEffectiveExpiresAt (來自 store) 必須存在
  if (newOrderId && hesitationStore.getEffectiveExpiresAt(newOrderId) && newEffectiveExpiresAt) {
    now.value = dayjs(); // 重置當前時間
    const expiryDate = dayjs(newEffectiveExpiresAt);
    const diffSeconds = expiryDate.diff(now.value, 'second');

    console.log(`[AOA Cell - Watch] Details for Order ID ${newOrderId}:`);
    console.log(`  - Effective Expiry (from store or prop): ${expiryDate.toISOString()}`);
    console.log(`  - Now: ${now.value.toISOString()}`);
    console.log(`  - Diff Seconds: ${diffSeconds}`);

    if (diffSeconds > 0) {
      updateTimer(); // 立即更新一次時間顯示
      timerId.value = setInterval(updateTimer, 1000);
      console.log(`[AOA Cell - Watch] Timer started for Order ID ${newOrderId} using effective expiry.`);
    } else {
      console.log(`[AOA Cell - Watch] Order ID ${newOrderId} is already effectively expired. Timer not started.`);
    }
  } else if (newOrderId && !hesitationStore.getEffectiveExpiresAt(newOrderId)) {
      // 猶豫期尚未在 store 中被正式啟動
      // 在此情況下，此組件不應該自行啟動強制性的倒數計時器。
      // 它可以顯示基於 props.order.expiresAt 的剩餘時間 (如果UI需要)，但那個時間不具有 "猶豫期已啟動" 的約束力。
      // 或者，如果設計是在猶豫期未激活前不顯示倒數，那麼這裡什麼都不做。
      // 當前的 timeRemaining 和 formattedTime 會基於 props.order.expiresAt（通過 effectiveExpiresAt 的 fallback）
      // 這意味著它會顯示一個 "潛在" 的倒數時間，但這個時間會在用戶真正離開時被 store 中的時間覆蓋並鎖定。
      console.log(`[AOA Cell - Watch] Hesitation not yet activated in store for Order ID ${newOrderId}. Displaying time based on props if available, but timer not formally started.`);
      // 如果 props.order.expiresAt 存在且未過期，timeRemaining 和 formattedTime 會顯示一些東西
      // 但 isEffectivelyExpired 的邏輯會更依賴 store
      // 手動觸發一次更新，以確保基於 props 的時間顯示（如果需要）
        now.value = dayjs();
        updateTimer();
  } else {
    console.log(`[AOA Cell - Watch] No Order ID or no effectiveExpiresAt. Order ID: ${newOrderId}. Timer not started.`);
  }
}, { immediate: true, deep: true }); // deep: true 因為 hesitationStore.activatedHesitations 是對象

onMounted(() => {
  // onMounted 中的邏輯大部分會被 watch immediate: true 處理
  // 但可以保留一個檢查，確保如果 watch 由於某些原因沒有正確初始化，這裡能補救
  // 主要依賴 watch 中的邏輯
  console.log(`[AOA Cell - onMounted] Component mounted for Order ID: ${props.order.orderId}. EffectiveExpiresAt: ${effectiveExpiresAt.value}`);
  // 如果 watch (immediate: true) 已經運行，這裡的 timer 啟動邏輯可能多餘
  // 但為了保險，可以檢查一下
  if (props.order.orderId && hesitationStore.getEffectiveExpiresAt(props.order.orderId) && effectiveExpiresAt.value && !timerId.value && timeRemaining.value > 0) {
      now.value = dayjs();
      updateTimer();
      timerId.value = setInterval(updateTimer, 1000);
      console.log(`[AOA Cell - onMounted] Backup timer start for Order ID ${props.order.orderId}.`);
  }
});

onUnmounted(() => {
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = null;
    console.log(`[AOA Cell - onUnmounted] Timer cleared for Order ID ${props.order.orderId}.`);
  }
});
</script>

<style scoped>
.awaiting-order-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.countdown span.text-red-500 {
  font-weight: bold;
}
</style>