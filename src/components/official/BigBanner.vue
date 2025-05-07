<template>
  <div style="margin-top: 155px;">
    <el-carousel height="780px">
      <el-carousel-item v-for="(image, index) in BigBannerimages" :key="index">
        <img
          :src="image.src"
          :alt="image.alt"
          style="width: 100%; height: 100%; object-fit: cover"
        />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup>
const BigBannerimages = [
  { src: "/src/assets/images/BigBanner1.jpg" },
  { src: "/src/assets/images/BigBanner2.jpg" },
  { src: "/src/assets/images/BigBanner3.jpg" },
  { src: "/src/assets/images/BigBanner4.jpg" },
];
</script>
