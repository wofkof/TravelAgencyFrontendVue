<template>
  <div class="container">
    <h1>建立自訂行程</h1>
    <div class="form">
      <el-form
        :model="form"
        ref="formRef"
        :rules="rules"
        label-position="top"
        label-width="80px"
        style="max-width: 600px"
        :hide-required-asterisk="true"
      >
        <el-form-item label="行程名稱" prop="title">
          <el-input v-model="form.title" />
          </el-form-item>
        <el-form-item label="日期" prop="daterange">
          <el-date-picker
            v-model="form.daterange"
            type="daterange"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledBefore"
            @change="DateChange"
          />
          </el-form-item>
        <el-form-item label="天數">
          <el-input v-model="form.days" readonly />
          </el-form-item>
        <el-form-item label="人數" prop="people">
          <el-input
            v-model="form.people"
            @input="NumberInput"
            placeholder="請輸入人數(1-50)"
          />
          </el-form-item>
        <el-form-item>
          <el-button color="#74cc6c" class="btn" @click="onSubmit" plain  round>
            新增行程
            </el-button>
        </el-form-item>
        <el-form-item>
          <el-button color="#62b9ff" class="btn" @click="goBack" plain  round>
            返回
          </el-button>
          </el-form-item>
      </el-form>
    </div>
  </div>
  <div style="display:flex; align-items: center; justify-content: center; margin:0 ; ">
    <RecommendedTrips />
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useTravelStore } from "@/stores/customtravelStore";
import RecommendedTrips from "@/components/tools/RecommendedTrips.vue";

const router = useRouter();
const travelStore = useTravelStore();
const formRef = ref(null);

const form = reactive({
  title: "",
  daterange: [],
  days: "",
  people: "",
});

function disabledBefore(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 清除時間部分
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  return date < tomorrow;
}

function DateChange([starts, ends]) {
  if (!starts || !ends) {
    form.days = 0;
  } else {
    const start = new Date(starts);
    const end = new Date(ends);
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    form.days = diff;
  }
}

function NumberInput(val) {
  const cleanVal = val.replace(/\D/g, ""); // 移除所有非數字
  const num = parseInt(cleanVal, 10);

  if (!cleanVal) {
    form.people = "";
  } else if (num < 1) {
    form.people = "1";
  } else if (num > 50) {
    form.people = "50";
  } else {
    form.people = cleanVal;
  }
}

const rules = {
  title: [{ required: true, message: "請輸入行程名稱", trigger: "blur" }],
  daterange: [
    {
      type: "array",
      required: true,
      message: "請選擇日期區間",
      trigger: "change",
    },
  ],
  people: [
    { required: true, message: "請輸入人數", trigger: "blur" },
    {
      validator: (_, value, callback) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 1 || num > 50) {
          callback(new Error("人數需為 1 到 50 之間的數字"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const onSubmit = () => {
  formRef.value.validate((valid) => {
    if (!valid) return;

    const id = Date.now();
    const newTravel = {
      id,
      title: form.title,
      daterange: form.daterange,
      days: form.days,
      people: form.people,
    };

    const existing = JSON.parse(localStorage.getItem("list") || "[]");
    existing.push(newTravel);
    localStorage.setItem("list", JSON.stringify(existing));

    travelStore.setTravelForm(newTravel);
    travelStore.setDailyActivities(
      Array.from({ length: newTravel.days }, () => [])
    );

    router.push({ name: "CustomtravelContent", params: { id } });
  });
};

const goBack = () => {
  router.push("/CustomtravelList");
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  max-width: 100vw;
}

h1 {
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 20px;
}

.form {
  /* background-color: #F9FAFB;
  box-shadow: 2px 2px 8px #ccc; */
   background-color: rgba(255, 255, 255, 0.644); /* ✅ 半透明白色 */
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  padding: 40px 50px;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
}

.btn {  
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
  margin-top: 20px;
  font-size: 20px;
  height: 36px;
}

::v-deep(.el-form-item__label) {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}

</style>
