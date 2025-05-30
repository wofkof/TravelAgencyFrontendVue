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

export const activateOrderShortExpiration = (orderId, memberId) => {
  if (!orderId || !memberId) {
    return Promise.reject(new Error('activateOrderShortExpiration 需要 orderId 和 memberId'));
  }
  // memberId 是作為查詢參數傳遞的
  return api.post(`/Order/${orderId}/activate-short-expiration?memberId=${memberId}`);
};

export const getMemberOrders = (memberId, params = {}) => {
  if (!memberId) {
    return Promise.reject(new Error('getMemberOrders 需要 memberId'));
  }
  return api.get(`/Order/member-orders`, { params: { memberId, ...params } });
};

export const getMemberDetailsForOrder = async (memberId) => {
  if (!memberId && memberId !== 0) { // 允許 memberId 為 0 (如果適用)
    return Promise.reject(new Error('獲取會員詳細資料需要 memberId'));
  }

  // API 端點 (Endpoint) - 根據後端 AccountSettingController.cs
  const endpoint = '/AccountSetting/profile';

  // 請求方式 (Request Method)
  const method = 'GET';

  try {
    const response = await api({
      url: endpoint,
      method: method,
      params: { // 將 memberId 作為查詢參數傳遞
        memberId: memberId
      }
    });

    // 處理回應
    // 後端 GetProfile 方法成功時直接返回 AccountSettingDto (被 Ok() 包裹)
    // axios 通常會將 Ok() 中的物件放在 response.data
    if (response && response.data) {
      // 檢查 response.data 是否為我們期望的物件結構
      // 後端直接返回 dto，所以 response.data 就是那個 AccountSettingDto
      if (typeof response.data === 'object' && response.data !== null) {
        // 你可以選擇在這裡直接返回 response.data，或者如果後端有固定的 { success: true, data: dto } 結構，則按那個結構取用
        // 從你的 C# 代碼來看，是 return Ok(dto); 所以 response.data 就是 dto 本身
        return response.data;
      } else {
        // 這種情況可能表示後端返回了非預期的成功回應
        console.warn('從後端獲取會員資料格式不符，但請求成功:', response.data);
        throw new Error('獲取到的會員資料格式不正確');
      }
    } else {
      throw new Error('從後端獲取會員資料時收到無效的回應');
    }
  } catch (error) {
    let errorMessage = '獲取會員資料時發生網路或伺服器錯誤';
    if (error.response) {
      // 後端返回了錯誤訊息 (例如 NotFound)
      // error.response.data 可能包含後端傳來的錯誤訊息字串或物件
      errorMessage = (typeof error.response.data === 'string' ? error.response.data : error.response.data?.message) || `伺服器錯誤 (狀態碼: ${error.response.status})`;
      console.error(`調用 ${method} ${endpoint} 失敗 (狀態碼: ${error.response.status}):`, error.response.data);
    } else if (error.request) {
      // 請求已發出，但沒有收到回應
      errorMessage = '無法連接到伺服器，請檢查您的網路連線。';
      console.error(`調用 ${method} ${endpoint} 時沒有收到回應:`, error.request);
    } else {
      // 發生了其他錯誤 (例如請求設置錯誤)
      errorMessage = error.message || errorMessage;
      console.error(`調用 ${method} ${endpoint} 時發生錯誤:`, error.message);
    }
    throw new Error(errorMessage);
  }
};

export const getFavoriteTravelersAPI = async (memberId) => {
  if (!memberId && memberId !== 0) { 
    return Promise.reject(new Error('獲取常用旅客列表需要 memberId'));
  }
  const endpoint = `/FavoriteTraveler/${memberId}`; // 對應後端 FavoriteTravelerController
  try {
    const response = await api.get(endpoint); // 'api' 是你的 axios 實例
    // 後端 GetByMemberId 直接返回 Ok(travelers)，所以 response.data 就是旅客陣列
    if (response && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn(`從 API (${endpoint}) 獲取常用旅客列表的資料格式不符或為空:`, response.data);
      return []; // 資料格式不對或為空時，返回空陣列
    }
  } catch (error) {
    // ... (錯誤處理邏輯，類似 getMemberDetailsForOrder 中的) ...
    let errorMessage = '獲取常用旅客列表時發生錯誤';
    if (error.response) {
      errorMessage = (typeof error.response.data === 'string' ? error.response.data : error.response.data?.message) || `伺服器錯誤 (狀態碼: ${error.response.status})`;
    } else if (error.request) {
      errorMessage = '無法連接到伺服器，請檢查您的網路連線。';
    } else {
      errorMessage = error.message || errorMessage;
    }
    console.error(`調用 GET ${endpoint} 獲取常用旅客失敗:`, errorMessage, error);
    throw new Error(errorMessage);
  }
};

export async function updateOrderAPI(orderId, data) {
  console.log(`API: Calling update order for ID: ${orderId} with payload:`, data);
  return api.put(`/Order/${orderId}`, data);

}