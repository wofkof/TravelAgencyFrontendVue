<template>
  <div>
    <StatusList v-if="view === 'list'" @view-detail="viewDetail" />
    <StatusContent v-if="view === 'content'" :customTravelId="selectedId" @go-back="view = 'list'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatusList from '@/components/customtravel/StatusList.vue'
import StatusContent from '@/components/customtravel/StatusContent.vue'

const view = ref('list')
const selectedId = ref(null)

const viewDetail = (id) => {
  selectedId.value = id
  view.value = 'content'
}
</script>