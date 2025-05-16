<template>
  <div class="grid gap-2">
    <label class="text-sm text-gray-700">我不是機器人驗證：</label>
    <div class="flex items-center gap-2">
        <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="reCAPTCHA"
                  class="ml-auto w-10 h-10"
                />
      <span class="text-lg font-semibold text-blue-600">{{ num1 }} + {{ num2 }} =</span>
      <input
        type="number"
        v-model.number="userAnswer"
        placeholder="運算結果..."
        class="border px-3 py-2 rounded w-[106px] text-center text-base"
        @input="checkAnswer"
      />
      <button
        type="button"
        @click="generateCaptcha"
        class="text-sm text-blue-500 hover:underline"
      >
        換一題 🔄
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

// 定義 v-model:isValid 綁定
const props = defineProps({
  isValid: Boolean,
})
const emit = defineEmits(['update:isValid'])

const num1 = ref(0)
const num2 = ref(0)
const userAnswer = ref(null)

function generateCaptcha() {
  let a = 0
  let b = 0
  do {
    a = Math.floor(Math.random() * 9) + 1
    b = Math.floor(Math.random() * 9) + 1
  } while (a + b > 18)

  num1.value = a
  num2.value = b
  userAnswer.value = null
  emit('update:isValid', false) // 重置驗證狀態
}

function checkAnswer() {
  const isCorrect = userAnswer.value === num1.value + num2.value
  emit('update:isValid', isCorrect)
}

onMounted(() => {
  generateCaptcha()
})
</script>
