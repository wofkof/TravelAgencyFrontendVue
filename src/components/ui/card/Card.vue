<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <div
    :class="
      cn('shadow-none border-none rounded-none', props.class)
    "
  >
    <slot />
  </div>
</template>
