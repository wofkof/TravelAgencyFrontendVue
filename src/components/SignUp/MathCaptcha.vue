<template>
  <div class="bg-white border border-gray-300 rounded-xl p-5 shadow-sm w-full max-w-[380px] mx-auto">
    <label class="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1">
      <!-- 圖片 -->
      <img
        src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
        alt="reCAPTCHA"
        class="w-8 h-8 shrink-0"
      />我不是機器人：
    </label>

    <div class="flex items-center gap-3">
      

      <!-- 驗證式 -->
      <div class="flex items-center gap-2">
        <span class="text-lg md:text-xl font-bold text-blue-700 whitespace-nowrap transition">
{{ num1 }} + {{ num2 }} =</span>
        <input
          type="number"
          v-model.number="userAnswer"
          placeholder="請輸入答案"
          class="border border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded px-3 py-1.5 w-[130px] text-center text-base"
          @input="checkAnswer"
        />
      </div>

      <!-- 按鈕 -->
      <button
        type="button"
        @click="generateCaptcha"
        class="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"

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
defineExpose({
  resetCaptcha: generateCaptcha
})
</script>
