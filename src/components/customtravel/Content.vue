<template>
  <div class="backview">
    <div style="margin-top: 155px"></div>
    <div class="container">
      <ConfirmDialog ref="confirmDialog" />
      <Dialog ref="dialogRef" :onAdd="addContent" :onEdit="updateContent" />
      <h1>{{ form.title }}</h1>
      <div class="header">
        <el-date-picker
          v-model="form.daterange"
          type="daterange"
          start-placeholder="Start Date"
          end-placeholder="End Date"
          readonly
          style="max-width: 300px"
        />
        <el-button color="#74cc6c" @click="openCreateDialog" plain round
          >新增項目</el-button
        >
        <el-button color="#62b9ff" @click="goBack" plain round>返回</el-button>
      </div>

      <el-tabs v-model="activeDay" type="border-card" class="tabs">
        <el-tab-pane
          v-for="day in Number(form.days)"
          :key="day"
          :label="`Day ${day}`"
          :name="day.toString()"
        >
          <div class="scroll-wrapper">
            <el-timeline style="width: 100%">
              <el-timeline-item
                placement="top"
                v-for="activity in sortedActivities(day)"
                :key="activity.originalIndex"
                :timestamp="`${activity.item.time} ${CategoryName(
                  activity.item.category
                )}`"
                :icon="LocationInformation"
              >
                <div class="activity-card">
                  <div class="info-area">
                    <div class="row">
                      <div class="item">
                        {{
                          ItemName(activity.item.category, activity.item.item)
                        }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="desc">{{ activity.item.desc }}</div>
                    </div>
                  </div>
                  <div class="actions">
                    <el-button
                      color="#90CAF9"
                      @click="editItem(day - 1, activity.originalIndex)"
                      :icon="Edit"
                      circle
                    ></el-button>
                    <el-button
                      color="#f8c1c9"
                      @click="removeItem(day - 1, activity.originalIndex)"
                      :icon="Delete"
                      circle
                    ></el-button>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="down">
        <div class="budget">
          <label>預算總金額</label>
          <el-input
            v-model="form.budget"
            placeholder="Money"
            style="width: 200px"
          />
        </div>
        <el-button color="#50b895" @click="saveToServe" plain round
          >送出審核</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LocationInformation, Edit, Delete } from "@element-plus/icons-vue";
import Dialog from "@/components/customtravel/ContentDialog.vue";
import ConfirmDialog from "@/components/customtravel/ConfirmDialog.vue";
import api from "@/utils/api";
import { useTravelStore } from "@/stores/customtravelStore";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const travelStore = useTravelStore();
const activeDay = ref("1");
const dialogRef = ref(null);
const confirmDialog = ref(null);
const dailyActivities = ref([]);
const city = ref([]);
const district = ref([]);
const attraction = ref([]);
const restaurant = ref([]);
const accommodation = ref([]);
const transport = ref([]);
const memberId = localStorage.getItem("memberId");

const form = reactive({
  title: "",
  daterange: [],
  days: "",
  budget: "",
});

onMounted(async () => {
  const id = route.params.id;
  const stored = JSON.parse(localStorage.getItem("list") || "[]");
  const current = stored.find((x) => x.id == id);

  if (!current) {
    router.push("/CustomtravelList");
    return;
  }

  try {
    const [
      cityRes,
      districtRes,
      attractionRes,
      restaurantRes,
      accommodationRes,
      transportRes,
    ] = await Promise.all([
      api.get("/City"),
      api.get("/District"),
      api.get("/Attraction"),
      api.get("/Restaurant"),
      api.get("/Accommodation"),
      api.get("/Transport"),
    ]);

    city.value = cityRes.data;
    district.value = districtRes.data;
    attraction.value = attractionRes.data;
    restaurant.value = restaurantRes.data;
    accommodation.value = accommodationRes.data;
    transport.value = transportRes.data;
  } catch (err) {
    console.error("API 錯誤:", err);
  }

  travelStore.loadFromLocal();
  form.title = travelStore.travelForm.title;
  form.daterange = travelStore.travelForm.daterange;
  form.days = travelStore.travelForm.days;
  form.budget = travelStore.travelForm.budget;
  dailyActivities.value = travelStore.dailyActivities;

  const dayCount = parseInt(form.days);
  if (
    !Array.isArray(dailyActivities.value) ||
    dailyActivities.value.length !== dayCount
  ) {
    dailyActivities.value = Array.from({ length: dayCount }, () => []);
  }
});

const goBack = () => router.push("/CustomtravelList");

const sortedActivities = (day) => {
  return dailyActivities.value[day - 1]
    .map((item, index) => ({ item, originalIndex: index }))
    .sort((a, b) => a.item.time.localeCompare(b.item.time));
};

const CategoryName = (id) => {
  switch (id) {
    case 0:
      return "🏡住宿";
    case 1:
      return "🗺景點";
    case 2:
      return "🍽餐廳";
    case 3:
      return "🚘交通";
    default:
      return "❓未知";
  }
};

const ItemName = (category, itemId) => {
  switch (category) {
    case 0:
      return (
        accommodation.value.find((a) => a.accommodationId === itemId)
          ?.accommodationName || "未知"
      );
    case 1:
      return (
        attraction.value.find((a) => a.attractionId === itemId)
          ?.attractionName || "未知"
      );
    case 2:
      return (
        restaurant.value.find((r) => r.restaurantId === itemId)
          ?.restaurantName || "未知"
      );
    case 3:
      return (
        transport.value.find((t) => t.transportId === itemId)
          ?.transportMethod || "未知"
      );
    default:
      return "未知";
  }
};

const removeItem = async (dayIndex, itemIndex) => {
  const raw = dailyActivities.value[dayIndex]?.[itemIndex];
  if (!raw) {
    console.warn("找不到指定資料！", dayIndex, itemIndex);
    return;
  }
  try {
    await confirmDialog.value.open({
      title: "確認刪除",
      message: "確定要刪除這筆行程內容嗎?",
    });
    dailyActivities.value[dayIndex].splice(itemIndex, 1);
    travelStore.setDailyActivities(dailyActivities.value);

    ElMessage.success("刪除成功");
  } catch {
    ElMessage.info("取消刪除");
  }
};

const addContent = (item) => {
  const dayIndex = parseInt(activeDay.value) - 1;
  dailyActivities.value[dayIndex].push({ ...item });
  travelStore.setDailyActivities(dailyActivities.value);
};

const updateContent = ({ dayIndex, itemIndex, ...updated }) => {
  dailyActivities.value[dayIndex][itemIndex] = updated;
  travelStore.setDailyActivities(dailyActivities.value);
};

const editItem = (dayIndex, itemIndex) => {
  const raw = dailyActivities.value[dayIndex]?.[itemIndex];
  if (!raw) {
    console.warn("找不到指定資料！", dayIndex, itemIndex);
    return;
  }
  const data = {
    category: raw.category,
    item: raw.item,
    city: raw.city,
    district: raw.district,
    time: raw.time,
    desc: raw.desc,
  };
  dialogRef.value?.openEdit({ data, dayIndex, itemIndex });
};

const openCreateDialog = () => {
  dialogRef.value?.openCreate();
};

watch(
  dailyActivities,
  (newVal) => {
    localStorage.setItem(
      `activities_${route.params.id}`,
      JSON.stringify(newVal)
    );
  },
  { deep: true }
);

const saveToServe = async () => {
  try {
    await confirmDialog.value.open({
      title: "確認送出",
      message: "確定要將這筆行程送出審核嗎?",
    });

    if (!memberId) {
      ElMessage.warning("請先登入會員，才可送出審核!");
      return;
    }
    const payload = {
      memberId: memberId,
      note: form.title,
      departureDate: form.daterange[0],
      endDate: form.daterange[1],
      days: Number(form.days),
      totalAmount: Number(form.budget),
      people: Number(travelStore.travelForm.people),
      contents: dailyActivities.value.flatMap((dayList, dayIndex) =>
        dayList.map((item) => ({
          day: dayIndex + 1,
          time: item.time,
          itemId: item.item,
          category: item.category,
          accommodationName: item.desc,
        }))
      ),
    };

    try {
      await api.post("/Content/Create", payload);

      const list = JSON.parse(localStorage.getItem("list") || "[]");
      const id = route.params.id;
      const updatedList = list.filter((item) => item.id != id);
      localStorage.setItem("list", JSON.stringify(updatedList));

      localStorage.removeItem("travelForm");
      localStorage.removeItem("dailyActivities");
      localStorage.removeItem(`activities_${route.params.id}`);
      travelStore.clearAll();

      ElMessage.success("送出成功，訂單已送出審核");
      router.push("/member/customtravel-status");
    } catch (err) {
      ElMessage.error("發送失敗");
      console.error(err);
    }
  } catch {
    ElMessage.info("取消送出");
  }
};
</script>

<style scoped>
.backview {
  background: url("@/assets/images/scenery4.png") no-repeat center center;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  padding: 20px 20px;
  box-sizing: border-box;
  margin-top: -155px;
}
.container {
  background-color: rgba(255, 255, 255, 0.329);
  border-radius: 20px;
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
}

.header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.tabs {
  background-color: rgba(255, 255, 255, 0.664);
  border-radius: 10px;
  height: 720px;
}

.scroll-wrapper {
  max-height: 700px;
  overflow-y: auto;
  padding-right: 10px;
}

.activity-card {
  width: 100%;
  max-width: 700px;
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 5px;
  color: #263238;
  display: flex;
  align-items: stretch;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.233);
}

.info-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions .el-button {
  margin: 0;
  padding: 4px 8px;
}

.actions {
  width: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 0;
}

.down {
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.item {
  font-size: 20px;
  font-weight: bold;
}

.desc {
  font-size: 16px;
  color: #333;
}

.el-button {
  font-size: 18px;
  height: 36px;
  padding: 6px 12px;
}

::v-deep(.el-timeline-item__timestamp) {
  font-size: 17px;
  color: #616161;
}
::v-deep(.el-timeline-item__icon) {
  font-size: 16px;
  color: #274106;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
}
</style>
