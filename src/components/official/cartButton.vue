<template>
  <button
    :disabled="isDisabled"
    class="w-24 text-center rounded-lg text-white m-0 p-1"
    :class="buttonClass"
  >
    {{ buttonLabel }}
  </button>
</template>

<script setup>
const props = defineProps({
  availableSeats: Number,
  isSpecial: Boolean,
});

const buttonLabel = computed(() => {
  if (props.isSpecial) return "聯絡專人";
  if (props.availableSeats === 0) return "候補";
  return "報名";
});

const isDisabled = computed(() => props.isSpecial); // 例如：特殊狀況不能線上報名

const buttonClass = computed(() => {
  if (props.isSpecial) return "bg-gray-500 cursor-not-allowed";
  if (props.availableSeats === 0) return "bg-yellow-500";
  return "bg-blue-400 hover:bg-blue-500";
});
</script>
