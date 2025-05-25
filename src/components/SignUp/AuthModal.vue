<template>
  <transition name="modal-fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[2000] flex justify-center bg-black/40"
      @click.self="emit('update:modelValue', false)"
    >
      <div
        class="relative bg-white rounded-xl w-full max-w-4xl mx-auto p-4 max-h-[100vh] overflow-y-auto"
      >
        <!-- 關閉按鈕 -->
        <button
          @click="emit('update:modelValue', false)"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          &times;
        </button>

        <!-- 動態內容 -->
        <component
          :is="currentComponent"
          @switch-to-login="switchTo('Login')"
          @switch-to-sign-up="switchTo('SignUp')"
          @switch-to-forget="switchTo('ForgetPassword')"
          @close="emit('update:modelValue', false)"
          @login-success="emit('login-success')"
        />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import Login from './Login.vue'
import SignUp from './SignUp.vue'
import ForgetPassword from './ForgetPassword.vue'
import { shallowRef } from 'vue'

const currentComponent = shallowRef(Login)


const props = defineProps({
  modelValue: Boolean,
  initial: { type: String, default: 'Login' }
})

const emit = defineEmits(['update:modelValue', 'login-success'])

const switchTo = (type) => {
  if (type === 'Login') currentComponent.value = Login
  else if (type === 'SignUp') currentComponent.value = SignUp
  else if (type === 'ForgetPassword') currentComponent.value = ForgetPassword
}

watch(
  () => props.initial,
  (val) => {
    switchTo(val)
  },
  { immediate: true }
)
</script>

<style scoped>
/* 彈出淡入淡出動畫 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
