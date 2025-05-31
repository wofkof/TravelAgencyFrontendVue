<template>
  <section class="testimonial">
    <h2 class="testimonial__hdl">旅行者的評論</h2>

    <div class="testimonial__carousel carousel">
      <transition name="fade" mode="out-in">
        <div class="carousel-inner" :key="currentPage">
          <div
            v-for="(review, index) in pagedReviews"
            :key="`${currentPage}-${index}`"
            class="carousel-item"
          >
            <img
              :src="review.avatar"
              alt="Avatar"
              class="carousel-item__avatar"
            />
            <p class="carousel-item__review">{{ review.content }}</p>
            <el-rate
              :model-value="review.rating"
              disabled
              text-color="#ff9900"
              class="big-stars"
            />
            <div class="carousel-item__name">{{ review.name }}</div>
            <div class="carousel-item__title">{{ review.title }}</div>
          </div>
        </div>
      </transition>
    </div>

    <nav class="carousel-nav">
      <div class="carousel-nav__left left-btn" @click="prev">
        <img
          src="/images/wide_arrow.svg"
          alt="Left arrow"
          class="left-btn__img"
        />
      </div>
      <div class="carousel-nav__right right-btn" @click="next">
        <img
          src="/images/wide_arrow.svg"
          alt="Right arrow"
          class="right-btn__img"
        />
      </div>
    </nav>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/utils/api";

const reviews = ref([]);
const currentPage = ref(0);
const itemsPerPage = ref(3); // 根據螢幕寬度調整顯示數

const pagedReviews = computed(() => {
  const start = currentPage.value * itemsPerPage.value;
  return reviews.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(reviews.value.length / itemsPerPage.value)
);

const next = () => {
  if (totalPages.value === 0) return;
  currentPage.value = (currentPage.value + 1) % totalPages.value;
};

const prev = () => {
  if (totalPages.value === 0) return;
  currentPage.value =
    (currentPage.value - 1 + totalPages.value) % totalPages.value;
};

const updateItemsPerPage = () => {
  const width = window.innerWidth;
  if (width < 640) {
    itemsPerPage.value = 1;
  } else if (width < 1024) {
    itemsPerPage.value = 2;
  } else {
    itemsPerPage.value = 3;
  }
};

onMounted(async () => {
  updateItemsPerPage();
  window.addEventListener("resize", updateItemsPerPage);

  const categoryMap = {
    GroupTravel: "團體旅遊",
    CustomTravel: "客製旅遊",
  };

  try {
    const res = await api.get("/comments/latest?count=9");
    reviews.value = res.data.map((c) => ({
      avatar: c.avatar,
      name: c.name,
      title: categoryMap[c.title] ?? "未知分類",
      content: c.content,
      rating: Number(c.rating),
    }));
  } catch (err) {
    console.warn("取得首頁評論失敗", err);
  }
});
</script>

<style scoped>
::v-deep(.big-stars .el-rate__icon) {
  width: 32px;
  height: 32px;
}

::v-deep(.big-stars .el-rate__icon svg) {
  width: 100%;
  height: 100%;
}

.carousel-inner {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

/* 卡片整體 */
.carousel-item {
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  flex: 1;
  max-width: 500px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* 頭像 */
.carousel-item__avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

/* 評論文字 */
.carousel-item__review {
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #333;
  font-style: italic;

  /* 解決過長問題 */
  word-wrap: break-word;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 可選：設定最大高度並加 scroll 或截斷 */
  display: -webkit-box;
  -webkit-line-clamp: 5; /* 顯示最多 5 行 */
  -webkit-box-orient: vertical;
}

/* 星等 */
.el-rate {
  margin-bottom: 1rem;
}

/* 姓名與職稱 */
.carousel-item__name {
  font-weight: 600;
  font-size: 1rem;
}
.carousel-item__title {
  font-size: 0.875rem;
  color: #777;
  margin-top: 0.25rem;
}

/* 淡入動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
