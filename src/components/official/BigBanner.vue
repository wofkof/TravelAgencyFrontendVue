<template>
  <el-carousel
    height="950px"
    style="margin-top: 155px"
    class="mb-6 bg-slate-600"
  >
    <el-carousel-item v-for="image in BigBannerimages" :key="image">
      <img
        :src="image.src"
        :alt="image.alt"
        style="width: 100%; height: 100%; object-fit: cover"
      />
    </el-carousel-item>
  </el-carousel>
</template>

<script setup>
const BigBannerimages = [
  { src: "/src/assets/images/BigBanner1.jpg" },
  { src: "/src/assets/images/BigBanner2.jpg" },
  { src: "/src/assets/images/BigBanner3.jpg" },
  { src: "/src/assets/images/BigBanner4.jpg" },
];
</script>
