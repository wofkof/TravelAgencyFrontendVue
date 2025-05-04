<template>
  <div class="flex flex-wrap gap-2 justify-center md:justify-start">
    <button
      v-for="tag in tags"
      :key="tag"
      :class="[
        'px-4 py-2 rounded-full border text-sm transition',
        selectedTag === tag
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100',
      ]"
      @click="selectTag(tag)"
    >
      {{ tag }}
    </button>
  </div>
  <!-- 加上輪播箭頭 -->
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
</script>
