<template>
  <div style="margin-top: -155px">
    <BigBanner class="mb-6 bg-slate-600"/>
  </div>
   
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // const memberId = JSON.parse(localStorage.getItem('memberId'))
  // if (!memberId?.memberId) {
  //   router.replace('/login')
  //   return
  // }

  // const listKey = `list_${member.memberId}`
  // const stored = JSON.parse(localStorage.getItem(listKey) || '[]')
  const stored = JSON.parse(localStorage.getItem('list') || '[]')

  if (stored.length === 0) {
    router.replace('/CustomtravelCreate')
  } else {
    router.replace('/CustomtravelList')
  }
})
</script>
