<template>
  <div class="bg-white rounded-xl p-4 text-center text-gray-700 shadow">
    <SRlist/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SRlist from './SRlist.vue'
import { useSearchResultStore } from '@/stores/useSearchResultStore'


const store = useSearchResultStore()


</script>
