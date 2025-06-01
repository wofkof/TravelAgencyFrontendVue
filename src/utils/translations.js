// src/utils/translations.js (或你喜歡的路徑)

export const orderStatusChineseMap = {
  Awaiting: '待付款',
  Completed: '付款完成',
  Cancelled: '已取消',
  InvoiceFailed: '付款成功，發票失敗',
  Expired: '已逾期',
};
export const getOrderStatusInChinese = (englishStatus) => {
  return orderStatusChineseMap[englishStatus] || englishStatus;
};

export const paymentStatusChineseMap = {
  Awaiting: '待付款',
  Completed: '付款完成',
  Cancelled: '已取消',
  InvoiceFailed: '付款成功，發票失敗',
  Expired: '已逾期',
};
export const getPaymentStatusInChinese = (englishStatus) => {
    return paymentStatusChineseMap[englishStatus] || englishStatus;
};

export const invoiceStatusChineseMap = {
  Pending: '未開立發票',
  Opened: '已開立發票',
  Voided: '已作廢發票',
};
export const getInvoiceStatusInChinese = (englishStatus) => {
  return invoiceStatusChineseMap[englishStatus] || englishStatus;
}