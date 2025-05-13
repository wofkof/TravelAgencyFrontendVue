<template>
  <GoogleMap
    :center="{ lat: 20, lng: 0 }"
    :zoom="2"
    style="width: 100%; height: 500px"
    :load="{ key: 'AIzaSyD1zwhTgntAdshvTojqPkfdxScOW9jf-1Y' }"  
  >
  </GoogleMap>
</template>

<script setup>
import { GoogleMap } from 'vue3-google-map';
</script> 