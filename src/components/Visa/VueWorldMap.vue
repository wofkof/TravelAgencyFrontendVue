<!-- google地圖-->
<template>
  <l-map ref="map" :zoom="zoom" :center="center" style="height: 500px; width: 100%;" @click="onMapClick">
    <l-tile-layer :url="tileUrl"></l-tile-layer>
    <l-marker :lat-lng="markerLatLng"></l-marker>
    <l-popup :lat-lng="markerLatLng" v-if="showPopup">{{ countryName }}</l-popup>
  </l-map>
</template>

<script setup>
import { ref } from 'vue';
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 解決 Leaflet marker icon 路徑問題 (Vue 3 寫法)
import marker from 'leaflet/dist/images/marker-icon.png';
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: markerShadow,
});

const map = ref(null);
const zoom = ref(5);
const center = ref([23.6978, 120.9605]); // 台灣中心
const tileUrl = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
const markerLatLng = ref([0, 0]);
const countryName = ref('');
const showPopup = ref(false);

const onMapClick = (event) => {
  markerLatLng.value = [event.latlng.lat, event.latlng.lng];
  // 在這裡你需要實作獲取國家名稱的邏輯
  // 這通常需要使用地理編碼服務或包含國家邊界資訊的 GeoJSON 資料
  // 並判斷點擊位置是否在某個國家的邊界內
  countryName.value = '點擊位置的國家名稱 (需要額外實作)';
  showPopup.value = true;
};

const addMarker = (latlng) => {
  markerLatLng.value = latlng;
  showPopup.value = false; // 點擊新增標記時，可以先隱藏之前的 popup
};
</script>

<style scoped>
.leaflet-container {
  width: 100%;
  height: 500px;
}
</style>