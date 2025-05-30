<!-- 選擇件數與出發日 -->
<template>
   <el-card class="order-detail-card">
     <h2 class="title">選擇件數與出發日</h2>
     <el-form label-width="80px">

       <form @submit.prevent="submitDummy">
         <el-form-item label="出發日期">
           <el-date-picker
             v-model="orderFormStore.data.DepartureDate" type="date"
             placeholder="請選擇日期"
             style="width: 100%;"
             value-format="YYYY-MM-DD" />
           </el-form-item>

         <el-form-item label="選擇件數">
           <el-input-number
           v-model="orderFormStore.data.ProcessingQuantity" :min="1"
           />
         </el-form-item>
         <!-- <Button type="submit" class="w-full mt-4">提交出發日期與件數</Button> -->
       </form>

         <el-form-item>
           <el-checkbox v-model="agreement">
             我已完整閱讀並同意本服務<a href="#">訂購須知</a> (包含退貨說  明)，並接受所有規定事項
           </el-checkbox>
         </el-form-item>
         <el-form-item>
           <!-- <el-button type="primary" :disabled="!agreement">會員購買</el-button> -->
           <!-- <el-button type="primary" @click="visaRouter.PaymentView">購買</el-button> -->
         </el-form-item>
     </el-form>
   </el-card>
</template>

<!-- 套件來源 -->
<script setup>
import { useOrderFormStore } from '@/stores/orderForm'; // 引入 Pinia Store
import { defineProps, defineEmits } from 'vue'; // 引入 defineProps 和 defineEmits
import { ElMessage } from 'element-plus'; // ElMessage 可以在需要時用於組件內部驗證提示
import useVisaRouter from "@/utils/visaRouterHelp";
import { ref } from 'vue'
import api from '@/utils/api' // 假設你的 API 工具程式碼已正確引入


const agreement = ref(false);
const visaRouter = useVisaRouter();
const departureDate = ref(null) // 初始化為 null 或一個預設日期
// const quantity = ref(1) // 初始化預設件數，例如 1
const orderFormStore = useOrderFormStore();

// 由於提交由父組件控制，這個組件不再有 submitDocument 函式
// 如果你需要做組件內部的即時驗證，可以保留 ElMessage 
// 定義組件會發出的事件
// const emit = defineEmits(['update:departureDate', 'update:quantity']);

// 定義組件接收的 props
const props = defineProps({
  departureDate: {
    type: String, // 假設父組件傳遞 YYYY-MM-DD 字串
    default: null
  },
  quantity: {
    type: Number,
    default: 1
  }
});

// 以下是提交出發日期和件數的函式
const submitDocument = async () => {
  // 基本的資料驗證 (你可以根據需求增加更嚴謹的驗證)
  if (!departureDate.value) {
    ElMessage.warning('請選擇出發日期')
    return
  }
  if (quantity.value < 1) {
    ElMessage.warning('件數必須至少為 1')
    return
  }
  try {
    // 根據你之前提供的資訊，API 路徑為 '/DocumentMenu'
    await api.post('/OrderForm', {
      departureDate: departureDate.value.toISOString().split('T')[0], // 將日期格式化為 YYYY-MM-DD 字串
      quantity: quantity.value
    })

    ElMessage.success('出發日期與件數已成功提交！')
    // 提交成功後，可以選擇清空欄位或進行頁面跳轉
    // departureDate.value = null;
    // quantity.value = 1;

  } catch (error) {
    console.error('提交失敗:', error)
    ElMessage.error('提交出發日期與件數失敗')
    // 如果後端有返回特定的錯誤訊息，你可以在這裡處理並顯示給使用者
    const resErrors = error.response?.data?.errors || {};
    // 例如：errors.value = resErrors; 並在模板中顯示
  }
}
</script>


<style scoped>
.order-detail-card {
  /* 區塊的最大寬度 */
  max-width: 1400px;
  /* 頁面中水平置中 */
  margin: 0 auto;
  /* 這個區塊的內邊距 */
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>