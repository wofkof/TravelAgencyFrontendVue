<!-- 選擇件數與出發日 -->
<template>
   <el-card class="order-detail-card">
     <h2 class="title">選擇件數與出發日</h2>
     <el-form label-width="80px">
       <!-- <form @submit.prevent="submitDummy"> -->
         <el-form-item label="出發日期">
           <el-date-picker
             v-model="orderFormStore.data.DepartureDate" type="date"
             placeholder="請選擇日期"
             style="width: 100%;"
             value-format="YYYY-MM-DD"
             @change="handleDateChange"
            />
           </el-form-item>

         <el-form-item label="選擇件數">
           <el-input-number
           v-model="orderFormStore.data.ProcessingQuantity" :min="1"
           @change="handleQuantityChange"
          />
         </el-form-item>
         <!-- <Button type="submit" class="w-full mt-4">提交出發日期與件數</Button> -->
       <!-- </form> -->

         <el-form-item>
           <el-checkbox v-model="agreement">
             我已完整閱讀並同意本服務<a href="#">訂購須知</a> (包含退貨說  明)，並接受所有規定事項
           </el-checkbox>
         </el-form-item>
         <!-- <el-form-item> -->
           <!-- <el-button type="primary" :disabled="!agreement">會員購買</el-button> -->
           <!-- <el-button type="primary" @click="visaRouter.PaymentView">購買</el-button> -->
         <!-- </el-form-item> -->
     </el-form>
   </el-card>
</template>

<!-- 套件來源 -->
<script setup>
import { ref } from 'vue'
import { useOrderFormStore } from '@/stores/orderForm'; // 引入 Pinia Store
import { ElMessage } from 'element-plus'; // ElMessage 可以在需要時用於組件內部驗證提示

import useVisaRouter from "@/utils/visaRouterHelp";
import api from '@/utils/api' // 假設你的 API 工具程式碼已正確引入
import { defineProps, defineEmits } from 'vue'; // 引入 defineProps 和 defineEmits

const orderFormStore = useOrderFormStore();
const agreement = ref(false);
const visaRouter = useVisaRouter();
// const departureDate = ref(null) // 初始化為 null 或一個預設日期，已直接綁定到 store，不需要本地 ref
// const quantity = ref(1) // 初始化預設件數，例如 1，已直接綁定到 store，不需要本地 ref


// 由於提交由父組件控制，這個組件不再有 submitDocument 函式
// 如果你需要做組件內部的即時驗證，可以保留 ElMessage 
// 定義組件會發出的事件


// const emit = defineEmits(['update:departureDate', 'update:quantity']); 因為直接綁定到 store，也不需要發送事件給父組件

// 定義組件接收的 props，因為直接綁定到 store，也不需要從父組件接收這些 props
// const props = defineProps({
//   departureDate: {
//     type: String, // 假設父組件傳遞 YYYY-MM-DD 字串
//     default: null
//   },
//   quantity: {
//     type: Number,
//     default: 1
//   }
// });


// 由於提交邏輯已移至父組件和 Pinia Store，此組件不再需要 submitDocument 函式
// 以下是提交出發日期和件數的函式
// const submitDocument = async () => {
//   // 基本的資料驗證 (你可以根據需求增加更嚴謹的驗證)
//   if (!departureDate.value) {
//     ElMessage.warning('請選擇出發日期')
//     return
//   }
//   if (quantity.value < 1) {
//     ElMessage.warning('件數必須至少為 1')
//     return
//   }
//   try {
//     // 根據你之前提供的資訊，API 路徑為 '/DocumentMenu'
//     await api.post('/OrderForm', {
//       departureDate: departureDate.value.toISOString().split('T')[0], // 將日期格式化為 YYYY-MM-DD 字串
//       quantity: quantity.value
//     })

//     ElMessage.success('出發日期與件數已成功提交！')
//     // 提交成功後，可以選擇清空欄位或進行頁面跳轉
//     // departureDate.value = null;
//     // quantity.value = 1;

//   } catch (error) {
//     console.error('提交失敗:', error)
//     ElMessage.error('提交出發日期與件數失敗')
//     // 如果後端有返回特定的錯誤訊息，你可以在這裡處理並顯示給使用者
//     const resErrors = error.response?.data?.errors || {};
//     // 例如：errors.value = resErrors; 並在模板中顯示
//   }
// }



// 當日期選擇器值改變時觸發，確保數據被正確更新到 Store
const handleDateChange = (value) => {
  // v-model 已經處理了綁定，這裡只是為了明確性或未來可能的額外邏輯
  // value-format="YYYY-MM-DD" 確保了 v-model 拿到的是正確格式的字串
  console.log('出發日期已更新:', orderFormStore.data.DepartureDate);
};

// 當件數輸入框值改變時觸發
const handleQuantityChange = (value) => {
  // v-model 已經處理了綁定
  console.log('辦理件數已更新:', orderFormStore.data.ProcessingQuantity);
};
</script>


<style scoped>
.order-detail-card {
  max-width: 1400px;/* 區塊的最大寬度 */
  margin: 0 auto;/* 頁面中水平置中 */
  padding: 20px;/* 這個區塊的內邊距 */
   border-radius: 8px; /* Element Plus card 通常會有圓角 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* Element Plus card 的陰影效果 */
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133; /* 常用字體顏色 */
  border-bottom: 1px solid #EBEEF5; /* 輕微分隔線 */
  padding-bottom: 15px;
}

/* 確保 Element Plus 的 form-item 樣式正確應用 */
.el-form-item {
  margin-bottom: 22px;
}

/* 調整 input number 的寬度以適應佈局 */
.el-input-number {
    width: 100%; /* 讓它與日期選擇器對齊 */
}

</style>