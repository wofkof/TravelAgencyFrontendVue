// src/components/tools/useConfirmation.js
import { ElMessageBox } from 'element-plus';

export function useConfirmation() {
  /**
   * 顯示 Element Plus 確認對話框
   * @param {object} options - 配置選項
   * @param {string} options.title - 對話框標題 (預設: '提示')
   * @param {string} options.message - 確認訊息 (預設: '確定要執行此操作嗎？')
   * @param {string} [options.confirmButtonText='確認'] - 確認按鈕文字
   * @param {string} [options.cancelButtonText='取消'] - 取消按鈕文字
   * @param {'success'|'warning'|'info'|'error'} [options.type='warning'] - 圖標類型
   * @returns {Promise<boolean>} - Resolve true 表示確認, Resolve false 表示取消
   */
  const showConfirmDialog = async ({
    title = '提示',
    message = '確定要執行此操作嗎？',
    confirmButtonText = '確認',
    cancelButtonText = '取消',
    type = 'warning', // 刪除操作通常用 'warning'
  } = {}) => { // 使用解構賦值和預設值
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        type: type,
        // center: true, // 如果需要居中樣式可以取消註解
      });
      return true; // 使用者點擊了確認
    } catch (action) {
      // 使用者點擊了取消或關閉按鈕 (action === 'cancel' or 'close')
      console.log('Confirmation cancelled:', action);
      return false; // 使用者取消了操作
    }
  };

  // 匯出該方法
  return { showConfirmDialog };
}