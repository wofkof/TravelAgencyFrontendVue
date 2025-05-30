<!-- components/OrderDetail.vue -->
<template>
  <div v-if="detail" class="space-y-6 leading-6">
    <div>
      <h3 class="text-base font-semibold text-gray-800 mb-2">📌 行程相關資訊</h3>
      <p><strong>行程名稱：</strong>{{ detail.description }}</p>
      <p><strong>出發日期：</strong>{{ formatDate(detail.startDate) }}</p>
      <p><strong>結束日期：</strong>{{ formatDate(detail.endDate) }}</p>
      <p><strong>人數：</strong>{{ detail.totalPeople }} 人（成人：{{ detail.adultCount }}、兒童：{{ detail.childCount }}）</p>
    </div>

    <div>
      <h3 class="text-base font-semibold text-gray-800 mb-2">👤 訂購人與旅客資訊</h3>
      <p><strong>訂購人：</strong>{{ detail.ordererName }}（{{ detail.ordererPhone }} / {{ detail.ordererEmail }}）</p>
      <p><strong>備註：</strong>{{ detail.note || '無' }}</p>
      <ul class="list-disc pl-6">
        <li v-for="(t, index) in detail.participants" :key="index">
          {{ t.name }}（{{ formatDate(t.birthDate) }}）
        </li>
      </ul>
    </div>

    <div>
      <h3 class="text-base font-semibold text-gray-800 mb-2">💳 付款與發票資訊</h3>
      <p><strong>付款方式：</strong>{{ detail.paymentMethod }}</p>
      <p><strong>付款狀態：</strong>{{ detail.status }}</p>
      <p><strong>付款時間：</strong>{{ formatDate(detail.createdAt) }}</p>
      <p><strong>總金額：</strong>{{ detail.totalAmount }} 元</p>
      <p v-if="detail.invoice">
        <strong>發票號碼：</strong>{{ detail.invoice.invoiceNumber }}<br />
        <strong>發票狀態：</strong>{{ detail.invoice.invoiceStatus }}<br />
        <strong>發票類型：</strong>{{ detail.invoice.invoiceType }}<br />
        <strong>買受人：</strong>{{ detail.invoice.buyerName }}（{{ detail.invoice.buyerUniformNumber || '無統編' }}）<br />
        <strong>發票金額：</strong>{{ detail.invoice.totalAmount }} 元<br />
        <strong>開立時間：</strong>{{ formatDate(detail.invoice.createdAt) }}<br />
      </p>
      <p v-else><strong>發票號碼：</strong>未開立</p>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'

defineProps({
  detail: Object
})

const formatDate = (dateStr) =>
  dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '—'
</script>
