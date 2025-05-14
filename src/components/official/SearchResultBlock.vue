<template>
  <div class="pb-4 mb-5">
    <SRlist/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SRlist from './SRlist.vue'
import { useSearchResultStore } from '@/stores/useSearchResultStore'


const store = useSearchResultStore()


</script>
