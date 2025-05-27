// src/utils/orderapi.js

import api from './api'; // 你的 axios 實例

// 第一階段：建立初步訂單
export const initiateOrder = (orderData) => {
  // orderData 應只包含訂單明細、旅客資訊等，不含付款和發票
  return api.post('/Order/initiate', orderData);
};

// 第二階段：最終確認付款方式和發票資訊
export const finalizeOrderPayment = (orderId, paymentFinalizationData) => {
  // paymentFinalizationData 包含 selectedPaymentMethod 和 invoiceRequestInfo
  return api.put(`/Order/${orderId}/finalize-payment`, paymentFinalizationData);
};

// 獲取訂單詳情 (例如用於“返回訂單明細”或付款頁面載入時確認訂單)
export const getOrderDetails = (orderId, memberId) => {
  return api.get(`/Order/${orderId}`, { params: { memberId } });
};