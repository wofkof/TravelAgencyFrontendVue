<template>

  <div class="max-w-7xl mx-auto p-4">
    <!-- 最外層容器 -->
    <!-- 最後加上skeleton -->
    <div class="bg-white rounded-xl p-4 shadow-lg mb-6">
      <!-- 行程資訊大矩形 -->

      <!-- 標題區塊 -->
      <div class="rounded-lg p-4 mb-4 text-gray-800 font-semibold text-left text-2xl">
        {{ mainInfo.title }}
      </div>

      <div class="flex h-96 bg-gray-100 rounded-lg">
        <!-- 二等分區塊 -->
        

        <div class="w-1/2 flex gap-2 p-4 text-left relative">
          <div class="w-1/2 rounded-md">
            <img :src="mainInfo.cover" alt="" class="h-56 w-full object-cover rounded"  >
          </div>
          <div class="text-lg font-bold my-2">
              <p>行程 {{mainInfo.number}}</p>
              <p>可賣： {{mainInfo.availableSeats}} 席次：{{ mainInfo.totalSeats }}</p>
              <p>去程：{{ formattedDepartureDate }}</p>
              <p>回程：{{ formattedReturnDate }}</p>
              <p>{{mainInfo.country}}/{{ mainInfo.region }}</p>
              <p>{{ mainInfo.adultPrice }}</p>
          </div>
          <cartButton 
            class="absolute bottom-5 right-8 shadow" 
            :availableSeats="selectedGroup?.availableSeats || mainInfo.availableSeats" 
            :isSpecial="selectedGroup?.groupStatus === '特殊'"
            @click="handleAddToCart"
          />
          
        </div>

        <div class="w-1/2 rounded-lg p-4">
          <!-- 資訊 03：出團日期表格 -->
          <!-- <div class="mb-2 p-2 border border-solid rounded-md border-gray-400">
                <p class="mb-4">選擇行程</p>
                <div class="grid grid-cols-5 gap-x-2">
                    <button type="button" class="border border-solid rounded-md border-blue-300 bg-blue-200">全部</button>
                    <button type="button" class="border border-solid rounded-md border-blue-300 bg-blue-200">行程1</button>
                </div>
            </div> -->
              <div class="mb-2">
                  <el-table
                    :data="groupList"
                    height="100%"
                    style="width: 100%;"
                    @row-click="handleGroupClick"
                  >
                    <el-table-column prop="departure" label="出發日期" width="120" >
                      <template #default="{ row }">
                        {{ formatDateTime(row.departure, { type: 'date' }) }}
                      </template>
                    </el-table-column>

                    <el-table-column prop="number" label="行程" width="60" />
                    <el-table-column prop="availableSeats" label="可賣" width="80" />
                    <el-table-column prop="totalSeats" label="席次" width="80" />
                    <el-table-column prop="groupStatus" label="成行狀態" width="90" />
                    <el-table-column prop="price" label="價格">
                      <template #default="{ row }">
                        {{ row.price }} 元
                      </template>
                    </el-table-column>
                    <el-table-column  width="60">
                      <el-button :icon="Check" circle />
                    </el-table-column>
                  </el-table>
              </div>
        </div>
      </div>

    </div>

<div class="bg-white rounded-xl p-4 shadow mb-6 text-xl font-medium">
{{ mainInfo.description }}

  </div>

  <!-- 行程手風琴區塊 -->

  <div class="bg-white rounded-xl p-4 shadow mb-6">
    <div class="demo-collapse">
        <el-collapse >
          <el-collapse-item v-for="s in scheduleList" :key="s.scheduleId">
            <template #title="{ isActive }">
              <div :class="['title-wrapper']" class="text-xl font-bold">
                第{{s.day}}天
              </div>
            </template>
            <div class="text-lg text-gray-900 leading-relaxed">
              <p class="text-xl">{{ s.description }}</p>
              <p>早餐: {{ s.breakfast }}</p>
              <p>午餐: {{ s.lunch }}</p>
              <p>晚餐: {{ s.dinner }}</p>
              <p>{{ s.hotel }}</p>
              <div v-for="(a, index) in s.attractions" :key="a.attractionId" class="text-blue-800">

                <!-- 使用唯一 map ID -->
                <el-popover
                  :width="300"
                  trigger="hover"
                  placement="top"
                >
                  <template #reference>
                    <el-button type="primary" plain size="small">{{ a.name }}</el-button>
                  </template>

                  <template #default>
                    <div>
                      <p class="font-bold text-base mb-1">{{ a.name }}</p>
                      <p class="text-sm text-gray-700 mb-2">{{ a.description }}</p>
                      <div :id="`map-popover-${s.scheduleId}-${a.attractionId}`" class="w-full h-40 rounded" ></div>
                    </div>
                  </template>
                </el-popover>
              </div>
            </div>
          </el-collapse-item>
    </el-collapse>
</div>


  </div>

  </div>

  </template>

  <script setup>
    import { onMounted, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import api from '@/utils/api';
    import { formatDateTime } from '@/utils/formatDateTime';
    import { useCartStore } from '@/stores/ShoppingCart';
    import { v4 as uuidv4 } from 'uuid';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import cartButton from '@/components/official/cartButton.vue';
    import { Check } from '@element-plus/icons-vue';
    import { ElMessage } from 'element-plus';
    

    const mainInfo = ref(
    {
      "projectId": 0,
      "title": "",
      "departure": "",
      "return": "",
      "description": "",
      "cover": "",
      "number": 0,
      "adultPrice": 0,
      "childPrice": 0,
      "babyPrice": 0,
      "country": "",
      "region": "",
      "totalSeats": 0,
      "availableSeats": 0
    }
  );
    const groupList = ref(
      [
        {
          "groupId": 0,
          "detailId":0,
          "departure": "",
          "return": "",
          "totalSeats": 0,
          "availableSeats": 0,
          "groupStatus": "",
          "price": 0,
          "number": 0
        },
      ]
    );

    const scheduleList = ref(
      [
        {
          "scheduleId": 0,
          "day": 0,
          "description": "",
          "breakfast": "",
          "lunch": "",
          "dinner": "",
          "hotel": "",
          "attraction1": 0,
          "attraction2": 0,
          "attraction3": 0,
          "attraction4": 0,
          "attraction5": 0,
          "attractions": []
        }
      ]
    );

  const selectedGroup = ref(null);

  const formattedDepartureDate = computed(() =>
    formatDateTime(mainInfo.value.departure, { type: 'date' })
  );
  const formattedReturnDate = computed(() =>
    formatDateTime(mainInfo.value.return, { type: 'date' })
  );

  const cartStore = useCartStore();
  const route = useRoute();

  const handleAddToCart = () => {

    if (!selectedGroup.value) {
      ElMessage({
        message: '請先選擇一個出團日期！',
        type: 'warning',
      });
      return;
    }
    try
    {
      const cartItem = {
        id: uuidv4(), // 確保每筆都唯一
        projectId: mainInfo.value.projectId,
        title: mainInfo.value.title,
        cover: mainInfo.value.cover,
        description: mainInfo.value.description,
        departure: mainInfo.value.departure,
        return: mainInfo.value.return,
        number: mainInfo.value.number, // 內部行程編號
        adultPrice: mainInfo.value.adultPrice,
        childPrice: mainInfo.value.childPrice,
        babyPrice: mainInfo.value.babyPrice,
        selected: true,
      };

      cartStore.addItem(cartItem);
      ElMessage({
        message: '已成功加入購物車！',
        type: 'success',
      });
      console.log("目前購物車：", cartStore.items);
      
    }
    catch
    {
      ElMessage({
        message: '加入購物車失敗，請稍後再試。',
        type: 'error',
      });
    }
    
  };
        
  const handleGroupClick = async (row) => {
    
    selectedGroup.value = row;

    mainInfo.value.departure = row.departure;
    mainInfo.value.return = row.return;
    mainInfo.value.number = row.number;
    mainInfo.value.adultPrice = row.price;
    mainInfo.value.totalSeats = row.totalSeats;
    mainInfo.value.availableSeats = row.availableSeats;
    ElMessage({
          message: `已選擇${formatDateTime(mainInfo.value.departure, { type: 'date' })}出發的行程`,
          type: 'success',
        });
    try {
      const detailId = row.detailId;

      const slist = await api.get(`/OfficialSearch/getSchedulelist/${detailId}`);
      scheduleList.value = slist.data;

      for (const schedule of scheduleList.value) {
        const ids = [
          schedule.attraction1,
          schedule.attraction2,
          schedule.attraction3,
          schedule.attraction4,
          schedule.attraction5
        ];

        schedule.attractions = [];

        for (const id of ids) {
          const attr = await getAttractionById(id);
          if (attr) schedule.attractions.push(attr);
        }
      }

      setTimeout(() => {
        for (const s of scheduleList.value) {
          for (const a of s.attractions) {
            const popoverMapId = `map-popover-${s.scheduleId}-${a.attractionId}`;
            const popoverEl = document.getElementById(popoverMapId);
            if (popoverEl) {
              const popoverMap = L.map(popoverMapId).setView([a.latitude, a.longitude], 13);
              L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(popoverMap);
              L.marker([a.latitude, a.longitude]).addTo(popoverMap)
                .bindPopup(`<b>${a.name}</b><br>${a.description}`);
            }
          }
        }
      }, 500);

    } catch (err) {
      console.error("點擊行程後取得日程失敗", err);
    }
  };


const getAttractionById = async (attractionId) => {
      if (!attractionId || attractionId === 0) return null;

      try {
        const attrlist = await api.get(`/OfficialSearch/getAttraction/${attractionId}`);
        return attrlist.data;
      } catch (err) {
        console.error("取得景點失敗", err);
      }
    };

onMounted(async () => {
  const projectId = route.params.projectId;
  const detailId = route.params.detailId;
  const groupId = route.params.groupId;
  
  try {
    const res = await api.get(`/OfficialSearch/getMainInfo/${projectId}/${detailId}/${groupId}`);
    mainInfo.value = res.data;
  } catch (err) {
    console.error("取得行程mainInfo失敗", err);
  }

  try {
    const glist = await api.get(`/OfficialSearch/getGrouplist/${projectId}`);
    groupList.value = glist.data;
  } catch (err) {
    console.error("取得行程groupList失敗", err);
  }

  try {
    const slist = await api.get(`/OfficialSearch/getSchedulelist/${detailId}`);
    scheduleList.value = slist.data;
    console.log(slist.data)
    for (const schedule of scheduleList.value) {
    const ids = [
      schedule.attraction1,
      schedule.attraction2,
      schedule.attraction3,
      schedule.attraction4,
      schedule.attraction5
    ];

    schedule.attractions = [];

    for (const id of ids) {
      const attr = await getAttractionById(id);
      if (attr) schedule.attractions.push(attr);
      console.log(attr);
    }
  }
    setTimeout(() => {
      for (const s of scheduleList.value) {
        for (const a of s.attractions) {
          // 行程明細區域地圖
          const mapId = `map-${s.scheduleId}-${a.attractionId}`;
          const el = document.getElementById(mapId);
          if (el) {
            const map = L.map(mapId).setView([a.latitude, a.longitude], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
            L.marker([a.latitude, a.longitude]).addTo(map)
              .bindPopup(`<b>${a.name}</b><br>${a.description}`).openPopup();
          }

          // popover 內部地圖
          const popoverMapId = `map-popover-${s.scheduleId}-${a.attractionId}`;
          const popoverEl = document.getElementById(popoverMapId);
          if (popoverEl) {
            const popoverMap = L.map(popoverMapId).setView([a.latitude, a.longitude], 13);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(popoverMap);
            L.marker([a.latitude, a.longitude]).addTo(popoverMap)
              .bindPopup(`<b>${a.name}</b><br>${a.description}`);
          }
        }
      }
    }, 500);

  } catch (err) {
    console.error("取得行程scheduleList失敗", err);
  }

});

  
  </script>
