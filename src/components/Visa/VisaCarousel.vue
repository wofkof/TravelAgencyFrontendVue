<!-- Carousel 走馬燈 -->
<template>

  <div class="block text-center" style="height: 1000px">
    <!-- 建立一個區塊元素，並置中內容，高度設定為 1000px -->

    <el-carousel height="auto" autoplay>
      <!-- 建立一個 Element Plus 的輪播元件，高度設為自動，啟用自動播放 -->

      <el-carousel-item style="height: 1000px">
        <!-- 第一個輪播項目，高度設定為 1000px -->
      </el-carousel-item>

      <el-carousel-item style="height: 1000px">
        <!-- 第二個輪播項目，高度設定為 1000px -->
      </el-carousel-item>

      <el-carousel-item style="height: 1000px">
        <!-- 第三個輪播項目，高度設定為 1000px -->
      </el-carousel-item>

    </el-carousel>

  </div>

</template>

<style scoped>

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>

<script setup>

</script>