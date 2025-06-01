<template>

  <div class="max-w-7xl mx-auto p-4">
    <!-- 最外層容器 -->
    <!-- 最後加上skeleton -->
    <div class="bg-gray-50 rounded-xl p-4 shadow-lg mb-6">
      <!-- 行程資訊大矩形 -->

      <!-- 標題區塊 -->
      <div class="rounded-lg p-4 mb-4 text-gray-800 font-semibold text-left text-2xl">
        {{ mainInfo.title }}
      </div>

      <div class="flex h-96 rounded-lg">
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
              <div class="mb-2 shadow-md">
              <el-scrollbar height="22em">
              <el-table
                    :data="groupList"
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
              </el-scrollbar>
                  
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
              <p class="text-xl mb-2">{{ s.description }}</p>
              <p class="mb-2">早餐: {{ s.breakfast }}</p>
              <p class="mb-2">午餐: {{ s.lunch }}</p>
              <p class="mb-2">晚餐: {{ s.dinner }}</p>
              <p class="mb-4">{{ s.hotel }}</p>
              <p class="mb-2">今日景點</p>
              <div class="grid grid-cols-2">
                <div v-for="(a, index) in s.attractions" :key="a.attractionId" class="mb-5">
                  <!-- 使用唯一 map ID -->
                  <el-popover
                    :width="300"
                    trigger="hover"
                    placement="top"

                  >
                    <template #reference>
                        <el-button plain round size="large" class="mb-3 shadow">{{ a.name }}
                        </el-button>
                    </template>

                    <template #default>
                      <div>
                        <p class="font-bold text-lg mb-3">{{ a.name }}</p>
                        <p class="text-base text-gray-700 mb-2">{{ a.description }}</p>
                        <div :id="`map-popover-${s.scheduleId}-${a.attractionId}`" class="w-full h-40 rounded" ></div>
                      </div>
                    </template>
                  </el-popover>
                  <p class="">{{ a.description }}</p>
                </div>
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

  const selectedAdults = ref(1); // 預設至少1位成人
  const selectedChildren = ref(0);
  const selectedBabies = ref(0);

  // const handleAddToCart = () => {

  //   if (!selectedGroup.value) {
  //     ElMessage({
  //       message: '請先選擇一個出團日期！',
  //       type: 'warning',
  //     });
  //     return;
  //   }
  //   try
  //   {
  //     const cartItem = {
  //       id: uuidv4(), // 確保每筆都唯一
  //       projectId: mainInfo.value.projectId,
  //       title: mainInfo.value.title,
  //       cover: mainInfo.value.cover,
  //       description: mainInfo.value.description,
  //       departure: mainInfo.value.departure,
  //       return: mainInfo.value.return,
  //       number: mainInfo.value.number, // 內部行程編號
  //       adultPrice: mainInfo.value.adultPrice,
  //       childPrice: mainInfo.value.childPrice,
  //       babyPrice: mainInfo.value.babyPrice,
  //       selected: true,
  //     };

  //     cartStore.addItem(cartItem);
  //     ElMessage({
  //       message: '已成功加入購物車！',
  //       type: 'success',
  //     });
  //     console.log("目前購物車：", cartStore.items);
      
  //   }
  //   catch
  //   {
  //     ElMessage({
  //       message: '加入購物車失敗，請稍後再試。',
  //       type: 'error',
  //     });
  //   }
    
  // };
        
  const handleAddToCart = () => {
  if (!selectedGroup.value) {
    ElMessage({
      message: '請先選擇一個出團日期！',
      type: 'warning',
    });
    return;
  }

  const adultQuantity = selectedAdults.value || 0; 
  const childQuantity = selectedChildren.value || 0;
  const babyQuantity = selectedBabies.value || 0;

  if (adultQuantity === 0 && childQuantity === 0 && babyQuantity === 0) {
      ElMessage({
          message: '請至少選擇一位旅客的數量！',
          type: 'warning',
      });
      return;
  }

  const totalSelectedPeople = adultQuantity + childQuantity + babyQuantity;
  const availableSeatsForSelectedGroup = selectedGroup.value?.availableSeats || mainInfo.value.availableSeats || 0;
  if (totalSelectedPeople > availableSeatsForSelectedGroup) {
    ElMessage({
        message: `選擇的總人數 (${totalSelectedPeople}) 超過可賣名額 (${availableSeatsForSelectedGroup})！`,
        type: 'error',
    });
    return;
  }

  const adultPrice = selectedGroup.value.price || 0; // 確保有值
  const childPrice = mainInfo.value.childPrice || 0;
  const babyPrice = mainInfo.value.babyPrice || 0;

  // 準備要傳遞給 Pinia store 的 productToAdd 物件
  const productToAdd = {
    productId: selectedGroup.value.groupId, // 官方行程的 ID
    productType: 'GroupTravel',                 // 標識為官方團體旅遊

    name: mainInfo.value.title,
    details: mainInfo.value.description,        // 考慮是否需要更具體的團描述
    imageUrl: mainInfo.value.cover,
    destinationCountryCode: mainInfo.value.country, // 假設 mainInfo.value 有此資訊

    // 日期和天數應基於選中的團 (selectedGroup.value)
    startDate: formatDateTime(selectedGroup.value.departure, { type: 'date' }),
    endDate: formatDateTime(selectedGroup.value.return, { type: 'date' }),
    // startDayOfWeek, endDayOfWeek 如果需要，應在此計算
    totalDays: selectedGroup.value.departure && selectedGroup.value.return ? 
               Math.ceil((new Date(selectedGroup.value.return) - new Date(selectedGroup.value.departure)) / (1000 * 60 * 60 * 24)) + 1 
               : mainInfo.value.days || 0, // 簡化天數計算或從 mainInfo 獲取
    departureDate: formatDateTime(selectedGroup.value.departure, { type: 'date' }), // 用於過期判斷

    flights: null, // 如果您的 mainInfo 或 selectedGroup 包含航班資訊，請填充
    accommodation: { description: '行程所示飯店或同級' }, // 或從 mainInfo/selectedGroup 獲取

    options: [],
    category: mainInfo.value.category || '官方旅遊', // 假設 mainInfo.value 有 category
    selected: true,
    isFavorite: false,
    productSpecificData: {
      internalCode: selectedGroup.value.number, // 使用選中團的團號 (行程編號)
      groupStatus: selectedGroup.value.groupStatus,
      availableSeats: selectedGroup.value.availableSeats,
    }
  };

  if (adultQuantity > 0) {
      productToAdd.options.push({ type: '成人', quantity: adultQuantity, price: adultPrice, unitLabel: '佔床' });
  }
  if (childQuantity > 0) {
      productToAdd.options.push({ type: '兒童', quantity: childQuantity, price: childPrice, unitLabel: '佔床' });
  }
  if (babyQuantity > 0) {
      productToAdd.options.push({ type: '嬰兒', quantity: babyQuantity, price: babyPrice, unitLabel: '不佔床' });
  }
  try {
    cartStore.addItem(productToAdd); // 將構造好的 productToAdd 物件傳給 store
    ElMessage({
      message: '已成功加入購物車！',
      type: 'success',
    });
    console.log("加入購物車的官方行程:", JSON.parse(JSON.stringify(productToAdd)));
    console.log("目前購物車所有商品：", cartStore.items);
  } catch (err) { // 更通用的錯誤捕獲
    ElMessage({
      message: '加入購物車失敗，請稍後再試。',
      type: 'error',
    });
    console.error("加入購物車失敗:", err);
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
