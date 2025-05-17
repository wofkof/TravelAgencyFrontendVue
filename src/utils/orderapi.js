// src/utils/orderapi.js

import axios from "axios";

// 建立一個專門用於訂單 API 的 Axios 實例
// 這樣可以為訂單相關的請求設定特定的 baseURL 或攔截器 (如果需要)
const orderApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // 從 .env 檔案讀取 API 基礎路徑
  withCredentials: true, // 如果您的 API 需要 cookie 進行身份驗證
});

/**
 * 創建訂單的 API 請求函式
 * @param {object} orderPayload - 包含訂單所有資訊的物件 (需符合後端 API 的 DTO 結構)
 * @returns {Promise} - Axios 的 Promise 物件，解析後為 API 的回應
 */
const createOrder = (orderPayload) => {
  // 假設您的後端創建訂單的 API 端點是 '/Orders' (相對於 baseURL)
  // 請將 '/Orders' 替換成您後端實際處理訂單創建的端點路徑
  // 例如：'/api/Order/Create', '/v1/orders' 等
  // 確保 HTTP 方法是 POST (或其他後端要求的方法)
  console.log("在 orderApi.js 中準備提交到 /Orders 的 Payload:", orderPayload);
  return orderApiClient.post('/Order', orderPayload);
};

// 您也可以在這裡加入其他訂單相關的 API 函式，例如：
// const getOrderById = (orderId) => {
//   return orderApiClient.get(`/Orders/${orderId}`);
// };

// const cancelOrder = (orderId) => {
//   return orderApiClient.post(`/Orders/${orderId}/cancel`);
// };

// 導出您定義的 API 函式
// 這樣在其他地方可以 import { createOrder } from '@/utils/orderApi';
export {
  createOrder,
  // getOrderById, // 如果您加入了其他函式
  // cancelOrder,
};

// 或者，如果您偏好預設導出一個包含所有方法的物件：
// const orderApi = {
//   createOrder,
//   // getOrderById,
//   // cancelOrder,
// };
// export default orderApi;