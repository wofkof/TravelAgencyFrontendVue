<!-- Carousel 走馬燈 -->
<template>

  <div class="block text-center" style="height: 1000px">
    <!-- 建立一個區塊元素，並置中內容，高度設定為 1000px -->

    <!-- <span class="demonstration">each carousel-item has a different height</span>
    顯示一段文字說明，提示每個輪播項目的高度不同 -->

    <el-carousel height="auto" autoplay>
      <!-- 建立一個 Element Plus 的輪播元件，高度設為自動，啟用自動播放 -->

      <el-carousel-item style="height: 1000px">
        <!-- 第一個輪播項目，高度設定為 1000px -->

        <!-- <img src="img" alt="photo1" style="width: 100%; height: 100%; object-fit: cover;" /> -->


        <!-- <h3 class="small justify-center" text="2xl">height 100px</h3>
        顯示文字「height 100px」，使用自訂的 class 做對齊與字體大小設定 -->

      </el-carousel-item>

      <el-carousel-item style="height: 1000px">
        <!-- 第二個輪播項目，高度設定為 1000px -->

        <!-- <h3 class="small justify-center" text="2xl">height 200px</h3>
        顯示文字「height 200px」 -->

      </el-carousel-item>

      <el-carousel-item style="height: 1000px">
        <!-- 第三個輪播項目，高度設定為 1000px -->
        
        <!-- <h3 class="small justify-center" text="2xl">height 300px</h3>
        顯示文字「height 300px」 -->

      </el-carousel-item>

    </el-carousel>

  </div>

</template>

<style scoped>
.carousel-item {
  color: #475669;
  opacity: 0.75;
  margin: 0;
  text-align: center;
}

.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  display: flex;
  align-items: center;
  margin: 0;
  text-align: center;
  height: 100%;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>

<!-- <script setup>
const images = [
  new URL("../assets/images/visa1.jpg", import.meta.url).href,
  new URL("../assets/images/visa2.jpg", import.meta.url).href,
  new URL("../assets/images/visa3.jpg", import.meta.url).href,
  new URL("../assets/images/visa4.jpg", import.meta.url).href,
  new URL("../assets/images/visa5.jpg", import.meta.url).href,
  new URL("../assets/images/visa6.jpg", import.meta.url).href,
];
</script> -->