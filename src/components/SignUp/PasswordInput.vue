<template>
  <div class="grid gap-2">
    <label :for="id" class="text-sm font-medium text-gray-700 dark:text-white">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        v-model="modelValueRef"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        :maxlength="maxlength"
        class="w-full pr-10 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        required
      />
      <button
        type="button"
        @click="togglePassword"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
        tabindex="-1"
        aria-label="切換密碼顯示"
      >
        <component :is="showPassword ? EyeIcon : EyeOffIcon" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: '密碼'
  },
  placeholder: {
    type: String,
    default: '請輸入密碼'
  },
  id: {
    type: String,
    default: ''
  },
  maxlength: {
    type: Number,
    default: 12
  }
})
const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)
const modelValueRef = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const EyeIcon = Eye
const EyeOffIcon = EyeOff

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>
