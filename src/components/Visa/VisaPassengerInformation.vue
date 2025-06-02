<!-- 填寫旅客資訊 -->
<template>
  <el-row  style="justify-content: center;">
    <el-col :span="18">
      <el-card class="passenger-info">
         <h2 class="title">填寫旅客資訊</h2>
         <el-form label-width="80px">
          <el-form-item label="旅客 1">
            <el-row :gutter="10">
              <el-col :span="6">
                <el-form-item label="中文姓名" :label-width="70">
                   <el-input placeholder="姓" v-model="orderFormStore.data.ChineseSurname"></el-input>
                   <el-input placeholder="名" v-model="orderFormStore.data.ChineseName"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="性別":label-width="40">
                   <el-select placeholder="請選擇" v-model="genderProxy">
                    <el-option label="男" value="male"></el-option>
                    <el-option label="女" value="female"></el-option>
                   </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="英文姓名":label-width="70">
                   <el-input placeholder="姓 (例) LEE" v-model="orderFormStore.data.EnglishSurname"></el-input>
                   <el-input placeholder="名 (例) DATUNG" v-model="orderFormStore.data.EnglishName"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <div class="passport-note">
              同護照拼音，無須符號或空格
              <el-link type="primary" underline="never">護照範例</el-link>
            </div>
          </el-form-item>

          <el-form-item label="出生日期">
            <el-row :gutter="10">
              <el-col :span="15">
                 <el-select placeholder="西元年" v-model="birthYearProxy"> 
                 <el-option v-for="year in years" :key="year" :label="year" :value="year"></el-option>
                   </el-select>
              </el-col>
              <el-col :span="15">
                 <el-select placeholder="月" v-model="birthMonthProxy"> 
                 <el-option v-for="month in months" :key="month" :label="month" :value="month"></el-option>
                 </el-select>
              </el-col>
              <el-col :span="15">
                 <el-select placeholder="日" v-model="birthDayProxy"> 
                 <el-option v-for="day_val in days" :key="day_val" :label="day_val" :value="day_val"></el-option>
                 </el-select>
              </el-col>
            </el-row>
           </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderFormStore } from '@/stores/orderForm';
import useVisaRouter from "@/utils/visaRouterHelp";


// const year = ref('');已由 proxy 取代
// const month = ref('');已由 proxy 取代
// const day = ref('');已由 proxy 取代
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);// 從今年開始往前100年
const months = Array.from({ length: 12 }, (_, index) => index + 1);// 1-12月
const orderFormStore = useOrderFormStore();
const visaRouter = useVisaRouter();



// const days = computed(() => {
//   const selectedYear = parseInt(year.value);
//   const selectedMonth = parseInt(month.value);
//   if (selectedYear && selectedMonth) {
//     return Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, index) => index + 1);
//   }
//   return [];
// });

// 因為 store 裡 BirthDate 是單一字串，但表單是年/月/日分開的
// 所以需要 computed 屬性來作為代理，讀取和寫入 store 的 BirthDate
const birthYearProxy = computed({
    get: () => {
        if (orderFormStore.data.BirthDate) {
            // return new Date(orderFormStore.data.BirthDate).getFullYear().toString();
             return new Date(orderFormStore.data.BirthDate).getFullYear();
        }
        // return '';
        return null; // 返回 null 讓 Element Plus 顯示 placeholder
    },
    set: (value) => {
        // const date = new Date(orderFormStore.data.BirthDate || '2000-01-01'); // 預設一個日期
        // date.setFullYear(parseInt(value));
        // orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
         const year = parseInt(value);
         const month = parseInt(birthMonthProxy.value) || 1; // 預設 1 月
         const day = parseInt(birthDayProxy.value) || 1;     // 預設 1 日
         updateBirthDateInStore(year, month, day);
       }
});

const birthMonthProxy = computed({
    get: () => {
        if (orderFormStore.data.BirthDate) {
            // return (new Date(orderFormStore.data.BirthDate).getMonth() + 1).toString();
            return new Date(orderFormStore.data.BirthDate).getMonth() + 1;
        }
        // return '';
         return null;
    },
    set: (value) => {
        // const date = new Date(orderFormStore.data.BirthDate || '2000-01-01');
        // date.setMonth(parseInt(value) - 1);
        // orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
        const year = parseInt(birthYearProxy.value) || new Date().getFullYear(); // 預設當前年
        const month = parseInt(value);
        const day = parseInt(birthDayProxy.value) || 1;
        updateBirthDateInStore(year, month, day);
      }
});

const birthDayProxy = computed({
    get: () => {
        if (orderFormStore.data.BirthDate) {
            // return new Date(orderFormStore.data.BirthDate).getDate().toString();
             return new Date(orderFormStore.data.BirthDate).getDate();
        }
        // return '';
         return null;
    },
    set: (value) => {
        // const date = new Date(orderFormStore.data.BirthDate || '2000-01-01');
        // date.setDate(parseInt(value));
        // orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
        const year = parseInt(birthYearProxy.value) || new Date().getFullYear();
        const month = parseInt(birthMonthProxy.value) || 1;
        const day = parseInt(value);
        updateBirthDateInStore(year, month, day);
    }
});

// 根據選擇的年和月動態計算日期的天數
  const days = computed(() => {
  const selectedYear = parseInt(birthYearProxy.value);
  const selectedMonth = parseInt(birthMonthProxy.value);
  if (selectedYear && selectedMonth) {
     // new Date(year, month, 0) 會得到上一個月的最後一天
    return Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, index) => index + 1);
  }
  return [];
});

// const days = computed(() => {
//   const selectedYear = parseInt(props.passengerInfo.birthYear);
//   const selectedMonth = parseInt(props.passengerInfo.birthMonth);
//   if (selectedYear && selectedMonth) {
//     return Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, index) => index + 1);
//   }
//   return [];
// });

// const props = defineProps({
//   // 將整個 orderFormData 物件傳入，讓子組件可以直接綁定其屬性
//   // 缺點是子組件直接修改 props 不太好，所以下面還是用 emit
//   passengerInfo: {
//     type: Object,
//     required: true
//   }
// });

// // 定義會發出的所有更新事件
// const emit = defineEmits([
//   'update:chineseSurname', 'update:chineseName', 'update:gender',
//   'update:englishSurname', 'update:englishName',
//   'update:birthYear', 'update:birthMonth', 'update:birthDay'
// ]);

// === 性別代理 (重要：將字串 'male'/'female' 轉換為後端期望的 0/1) ===
const genderProxy = computed({
  get: () => {
    // 從 store 讀取數值，轉換為 UI 顯示的字串
    if (orderFormStore.data.Gender === 0) return 'male'; // 對應 '男'
    if (orderFormStore.data.Gender === 1) return 'female'; // 對應 '女'
    return null; // 預設值或未選擇
  },
  set: (value) => {
    // 當 UI 選擇字串時，轉換為 store 儲存的數值 (0 for Male, 1 for Female)
    if (value === 'male') {
      orderFormStore.data.Gender = 0; // 將 'male' 轉換為數字 0
    } else if (value === 'female') {
      orderFormStore.data.Gender = 1; // 將 'female' 轉換為數字 1
    } else {
      orderFormStore.data.Gender = null; // 如果選擇了空值或其他意外值
    }
  }
});

// 輔助函式：更新 store 中的 BirthDate
const updateBirthDateInStore = (year, month, day) => {
  if (year && month && day) {
    const date = new Date(year, month - 1, day); // 月份在 Date 物件中是 0-11
    orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
  } else {
    orderFormStore.data.BirthDate = null; // 如果任何部分不完整，則設為 null
  }
};

// 在組件掛載時，初始化 Pinia Store 中的資料，避免空值導致 computed 代理出錯
onMounted(() => {
  // 給定一個預設的出生日期，例如 1990-01-01
  if (!orderFormStore.data.BirthDate) {
    orderFormStore.data.BirthDate = '1990-01-01';
  }
  // 如果性別未定義，給一個預設值（例如 null 或男 0）
  if (orderFormStore.data.Gender === null || orderFormStore.data.Gender === undefined) {
    orderFormStore.data.Gender = null; // 或者 0
  }
});
</script>

<style scoped>
.passenger-info {
  max-width: 1400px; /* 區塊的最大寬度 */
  margin: 0 auto; /* 頁面中水平置中 */
  padding: 20px; /* 這個區塊的內邊距 */
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 15px;
}

.el-form-item {
  margin-bottom: 22px;
}

.el-input {
  width: 100%; /* 確保輸入框佔滿可用寬度 */
}

/* 確保中文姓名和英文姓名的兩個輸入框正確排列 */
.el-col .el-form-item {
  margin-bottom: 0px; /* 移除內部 el-form-item 的額外底部間距 */
}

.el-col .el-input + .el-input { /* 兩個 el-input 之間的間距 */
  margin-top: 10px;
}

.passport-note {
  color: #909399; /* 淺灰色 */
  font-size: 12px;
  margin-top: 5px;
  text-align: right; /* 對齊到右邊 */
  padding-right: 10px; /* 一點內邊距 */
}

/* 調整 Element Plus select 的樣式 */
.el-select {
  width: 100%;
}

.order-summary .item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-summary .price {
  font-weight: bold;
}

.order-summary .total {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.order-summary .total-price {
  font-size: 1.5em;
  color: #f56c6c;
  font-weight: bold;
}
</style>