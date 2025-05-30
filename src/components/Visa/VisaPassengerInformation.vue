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
                <el-form-item label="中文姓名">
                   <el-input placeholder="姓" v-model="orderFormStore.data.ChineseSurname"></el-input>

                   <el-input placeholder="名" v-model="orderFormStore.data.ChineseName"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="4">
                <el-form-item label="性別">
                   <el-select placeholder="請選擇"
                     v-model="orderFormStore.data.Gender">
                    <el-option label="男" value="male"></el-option>
                    <el-option label="女" value="female"></el-option>
                   </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="英文姓名">
                   <el-input placeholder="姓 (例) LEE" v-model="orderFormStore.data.EnglishSurname"></el-input>
                   <el-input placeholder="名 (例) DATUNG" v-model="orderFormStore.data.EnglishName"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <div class="passport-note">
              同護照拼音，無須符號或空格 <el-link type="primary" :underline="false">護照範例</el-link>
            </div>
          </el-form-item>

          <el-form-item label="出生日期">
            <el-row :gutter="10">
              <el-col :span="6">
                 <el-select placeholder="西元年" v-model="birthYearProxy">          <el-option v-for="year in years" :key="year" :label="year" :value="year"></el-option>
                   </el-select>
              </el-col>
              <el-col :span="4">
                 <el-select placeholder="月" v-model="birthMonthProxy"> <el-option v-for="month in months" :key="month" :label="month" :value="month"></el-option>
                 </el-select>
              </el-col>
              <el-col :span="4">
                 <el-select placeholder="日" v-model="birthDayProxy"> <el-option v-for="day in days" :key="day" :label="day" :value="day"></el-option>
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
import useVisaRouter from "@/utils/visaRouterHelp";
import { ref, computed } from 'vue';
import { useOrderFormStore } from '@/stores/orderForm';

const year = ref('');
const month = ref('');
const day = ref('');
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_, index) => index + 1);
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
            return new Date(orderFormStore.data.BirthDate).getFullYear().toString();
        }
        return '';
    },
    set: (value) => {
        const date = new Date(orderFormStore.data.BirthDate || '2000-01-01'); // 預設一個日期
        date.setFullYear(parseInt(value));
        orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
    }
});

const birthMonthProxy = computed({
    get: () => {
        if (orderFormStore.data.BirthDate) {
            return (new Date(orderFormStore.data.BirthDate).getMonth() + 1).toString();
        }
        return '';
    },
    set: (value) => {
        const date = new Date(orderFormStore.data.BirthDate || '2000-01-01');
        date.setMonth(parseInt(value) - 1);
        orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
    }
});

const birthDayProxy = computed({
    get: () => {
        if (orderFormStore.data.BirthDate) {
            return new Date(orderFormStore.data.BirthDate).getDate().toString();
        }
        return '';
    },
    set: (value) => {
        const date = new Date(orderFormStore.data.BirthDate || '2000-01-01');
        date.setDate(parseInt(value));
        orderFormStore.data.BirthDate = date.toISOString().split('T')[0];
    }
});

const days = computed(() => {
  // 從 proxy 中獲取年和月
  const selectedYear = parseInt(birthYearProxy.value);
  const selectedMonth = parseInt(birthMonthProxy.value);
  if (selectedYear && selectedMonth) {
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
</script>

<style scoped>
.passenger-info {
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

.passport-note {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
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