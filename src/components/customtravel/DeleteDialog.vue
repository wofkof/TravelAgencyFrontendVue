<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="360px"
    :close-on-click-modal="false"
  >
    <span>{{ message }}</span>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="danger" @click="confirm">確定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
let resolveFn, rejectFn

const open = (options) => {
  title.value = options.title || '確認操作'
  message.value = options.message || '確定要執行這個操作嗎？'
  visible.value = true
  return new Promise((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
  })
}

const confirm = () => {
  visible.value = false
  resolveFn()
}

const cancel = () => {
  visible.value = false
  rejectFn()
}

defineExpose({ open })
</script>
