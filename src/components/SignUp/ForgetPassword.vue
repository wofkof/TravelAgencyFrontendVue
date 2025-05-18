<template>
  <!-- 外層容器，垂直置中，固定背景色與最小高度 -->
  <div class="flex justify-center items-center min-h-screen">
    <!-- 表單容器 -->
    <div class="w-full max-w-4xl p-6">
      <div class="flex flex-col gap-3">
        <!-- 標題區塊 -->
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white m-2">忘記密碼？</h2>
        </div>

        <!-- 卡片本體 -->
        <Card>
          <CardContent class="grid p-0 md:grid-cols-2">
            <!--  圖片區塊 -->
            <div class="relative hidden bg-muted md:block rounded-[20px]">
              <img
                src="/images/ForgetPasswordImage.jpg"
                alt="Image"
                class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-[20px]"
              />
            </div>

            <!--  表單區塊 -->
            <form @submit.prevent="handleSubmit" class="p-6 md:p-6 overflow-auto max-h-[80vh]">
              <div class="flex flex-col gap-8">
                <!--  Logo -->
                <img src="@/assets/images/newlogo.png" width="160" class="mx-auto" />

                <div class="flex flex-col gap-6">
                  <!--  帳號欄 -->
                  <div v-if="step === 1" class="grid gap-2">
                    <label for="account">信箱</label>
                    <div class="flex gap-2">
                      <input
                        id="account"
                        v-model="form.account"
                        type="text"
                        placeholder="travellian@example.com"
                        class="flex-1"
                        autocomplete="off"
                      />
                      <Button type="button" class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" :disabled="countdown > 0 || !isValidEmail" @click="sendVerificationCode">
                        {{ countdown > 0 ? countdown + ' 秒後重送' : '發送驗證碼' }}
                      </Button>
                    </div>
                    <span v-if="touched && !isValidEmail" class="text-red-500 text-xs">
                      請輸入有效的 Email
                    </span>
                  </div>

                  <!--  驗證碼欄 -->
                  <div v-if="step === 2" class="grid gap-2">
                    <label for="code">驗證碼</label>
                    <input
                      id="code"
                      v-model="form.code"
                      type="text"
                      maxlength="6"
                      placeholder="請輸入 6 碼驗證碼"
                    />
                  </div>

                  <!--  新密碼欄 -->
                  <div v-if="step === 3" class="grid gap-2">
                    <label for="newPassword">新密碼</label>
                    <input id="newPassword" v-model="form.newPassword" type="password" placeholder="輸入新密碼" />

                    <label for="confirmPassword">確認新密碼</label>
                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      type="password"
                      placeholder="再次輸入新密碼"
                    />
                    <span v-if="form.newPassword !== form.confirmPassword && form.confirmPassword"
                      class="text-red-500 text-xs">密碼不一致</span>
                  </div>

                  <!--  說明文字 -->
                  <p class="text-sm text-muted-foreground">
                    說明：<br />請確認您輸入的為本人信箱，密碼重設連結將寄送至該信箱，請於有效時間內完成密碼重設定。<br />  <br />
                    ※ 若您未曾申請密碼重設，請忽略此信件。
                  </p>

                  <!--  提交按鈕 -->
                  <Button type="submit" class="w-full">
                    {{ step === 1 ? '下一步' : step === 2 ? '驗證驗證碼' : '重設密碼' }}
                  </Button>

                  <!--  返回登入 -->
                  <Button type="button" class="w-full" @click="$emit('switch-to-login')">
                    返回登入
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const emit = defineEmits(['switch-to-login'])
const step = ref(1)
const countdown = ref(0)
const touched = ref(false)
const form = reactive({
  account: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => emailRegex.test(form.account.trim()))

watch(() => form.account, () => {
  touched.value = false
})

async function sendVerificationCode() {

  try {
    const email = form.account.trim()
    await axios.post('https://localhost:7265/api/PasswordResets/request', {
  email},
  {
    headers: {
      'Content-Type': 'application/json'
    }
})

    ElMessage.success('驗證碼已寄送，請至信箱查收')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (err) {
    const message =
      err.response?.data && typeof err.response.data === 'string'
        ? err.response.data
        : err.message ?? '發送失敗'
    ElMessage.error(message)
  }
}

async function handleSubmit() {
  const email = form.account.trim()

  if (step.value === 1) {
    if (!isValidEmail.value) {
      touched.value = true
      return
    }
    step.value = 2
  } else if (step.value === 2) {
    try {
      await axios.post('/api/PasswordResets/verify-code', {
        email,
        code: form.code
      })
      ElMessage.success('驗證成功，請設定新密碼')
      step.value = 3
    } catch (err) {
      ElMessage.error(err.response?.data ?? '驗證失敗')
    }
  } else if (step.value === 3) {
    if (!form.newPassword || form.newPassword !== form.confirmPassword) {
      ElMessage.error('請確認密碼一致')
      return
    }
    try {
      await axios.post('/api/PasswordResets/reset', {
        email,
        newPassword: form.newPassword
      })
      ElMessage.success('密碼已重設成功，請重新登入')
      emit('switch-to-login')
    } catch (err) {
      ElMessage.error(err.response?.data ?? '重設失敗')
    }
  }
}
</script>
