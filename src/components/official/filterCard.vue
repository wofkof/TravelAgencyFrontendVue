<template>
  <div class="grid grid-cols-12 m-3">
    <div class="col-start-1 col-span-1 px-3 flex justify-end">
      <div class="relative flex justify-center">
        <span class="invisible absolute top-0 left-0">向左</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width: 10px;" @click="scrollLeft"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
      </div>
      
    </div>
    <div
  ref="carousel"
  class="col-start-2 col-span-10 gap-2 justify-center md:justify-start content-center py-1 overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hidden"
>
<div class="flex justify-center">

    <button
      v-for="tag in tags"
      :key="tag"
      class="inline-block px-4 py-2 mx-1 rounded-full border text-sm transition "
      :class="selectedTag === tag
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'"
      @click="selectTag(tag)"
    >
      {{ tag }}
    </button>
</div>
  
</div>
  <div class="col-start-12 col-span-1 px-3 flex justify-start">
    <div class="relative flex justify-center">
      <span class="invisible absolute top-0 right-0">向右</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width: 10px;" @click="scrollRight">
        <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
      </svg>
    </div>
      
        
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from "vue";
const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
const selectedTag = ref(props.modelValue);

const selectTag = (tag) => {
  selectedTag.value = tag;
  emit("update:modelValue", tag);
};

const carousel = ref(null);

const scrollLeft = () => {
  carousel.value?.scrollBy({ left: -200, behavior: "smooth" });
};

const scrollRight = () => {
  carousel.value?.scrollBy({ left: 200, behavior: "smooth" });
};
</script>

<style scoped>
.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}
</style>
<!-- 未處理scrollbar -->