<template>
  <!-- 外層容器，垂直置中 -->
  <div class="flex justify-center items-center min-h-screen">
    <!-- 表單容器 -->
    <div class="w-full max-w-4xl p-6">
      <div class="flex flex-col gap-3">
        <!-- 標題區塊 -->
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-800 dark:text-white m-2">
            {{ stepTitle }}
          </h2>

        </div>

        <!-- 卡片本體 -->
        <Card>
          <CardContent class="grid p-0 md:grid-cols-2">
            <!--  圖片區塊 -->
            <div class="relative hidden bg-muted md:block rounded-[20px] min-h-[600px]">
              <img
                src="/images/ForgetPasswordImage.jpg"
                alt="Image"
                class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-[20px]"
              />
            </div>

            <!--  表單區塊 -->
            <form @submit.prevent="handleSubmit" class="p-6 md:p-6 overflow-auto h-full flex flex-col justify-center">
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
                        type="link"
                        placeholder="travellian@example.com"
                        class="flex-1"
                        autocomplete="off"
                      />
                      <Button type="button" class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" :disabled="countdown > 0 || !isValidEmail" @click="sendVerificationCode">
                        {{ countdown > 0 ? countdown + ' 秒後重送' : '發送驗證碼' }}
                      </Button>
                    </div>
                    
                  </div>

                  <!--  驗證碼欄 -->
                  <div v-if="step === 2" class="grid gap-2">
                    <label for="code">驗證碼</label>
                    <input
                      id="code"
                      v-model="form.code"
                      type="link"
                      maxlength="6"
                      placeholder="請輸入 6 碼驗證碼"
                    />
                    
                  </div>

                  <!--  新密碼欄 -->
                  <div v-if="step === 3" class="grid gap-2">
                      <PasswordInput
                      id="newPassword"
                      v-model="form.newPassword"
                      label="新密碼"
                      placeholder="請輸入新密碼"
                    />
                    <PasswordInput
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      label="確認新密碼"
                      placeholder="請再次輸入新密碼"
                    />
                 
                  </div>

                  <!--  說明文字 -->
                  <p v-if="step === 1" class="text-sm text-muted-foreground">
                    說明：<br />請先輸入您註冊會員時的聯絡信箱，系統將寄送 6 碼驗證碼至您的信箱，請於10分鐘內於下一步輸入驗證碼以繼續重設密碼。<br /><br />                  
                  </p>
                  <p v-if="step === 2" class="text-sm text-muted-foreground">
                    說明：<br />
                    我們已發送驗證碼至您填寫的信箱，請於 10 分鐘內輸入 6 碼驗證碼完成身份驗證。<br /><br />
                    ※ 若未收到信件，請確認垃圾郵件匣或嘗試重新發送驗證碼。
                  </p>
                  <div v-if="step === 3" class="text-sm text-muted-foreground">
                  <p>您目前正在為 <strong>{{ form.account }}</strong> 重設密碼</p>
                  <br />
                  <p>
                    說明：<br />
                    請設定長度6~12位數，且包含大、小寫英文的密碼，以提高帳戶安全性。
                    <br /><br />
                    ※ 設定完成後，系統將自動導回登入畫面。
                  </p>
                </div>

                  <!--  提交按鈕 -->
                  <Button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                    {{ step === 1 ? '下一步' : step === 2 ? '驗證驗證碼' : '重設密碼' }}
                  </Button>
                  <div class="flex gap-2">
                    <!-- 返回上一步 -->
                     <Button
                        v-if="step === 2"
                        type="button"
                        class="flex-1"
                        @click="() => { form.account = ''; form.code = ''; step = 1 }"
                      >
                      返回填寫信箱
                    </Button>
                  <!--  返回登入 -->
                  <Button type="button" class="flex-1" @click="() => { resetForm(); $emit('switch-to-login') }">
                    返回登入
                  </Button>
                  </div>
                 
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
import api from '@/utils/api'
import PasswordInput from "./PasswordInput.vue";
const resendTimer = ref(null)
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
const isValidPassword = computed(() => {
  return /^(?=.*[a-z])(?=.*[A-Z]).{6,12}$/.test(form.newPassword);
});
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => emailRegex.test(form.account.trim()))

watch(() => form.account, () => {
  touched.value = false
})

async function sendVerificationCode() {

  try {
    const email = form.account.trim()
    await api.post('/PasswordResets/request', {
  email},
  {
    headers: {
      'Content-Type': 'application/json'
    }
})
    ElMessage.success('驗證碼已寄送，請至信箱查收')
    countdown.value = 60
    if (resendTimer.value) clearInterval(resendTimer.value)
    resendTimer.value = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(resendTimer.value)
    }, 1000)

  } catch (err) {
    const message =
      err.response?.data && typeof err.response.data === 'string'
        ? err.response.data
        : err.message ?? '發送失敗'
    ElMessage.error(message)
  }
}
//標題內容
const stepTitle = computed(() => {
  switch (step.value) {
    case 1:
      return '忘記密碼？'
    case 2:
      return '輸入驗證碼'
    case 3:
      return '重設新密碼'
    default:
      return '忘記密碼？'
  }
})
async function handleSubmit() {
  const email = form.account.trim()
if (step.value === 1) {
    if (!isValidEmail.value) {
      ElMessage.error('請輸入Email信箱，以獲取驗證碼')
      touched.value = true
      return
    }
    step.value = 2
  } else if (step.value === 2) {
    try {
      await api.post('/PasswordResets/verify-code', {
        email,
        code: form.code
      })
      ElMessage.success('驗證成功，請設定新密碼')
      step.value = 3
    } catch (err) {
      ElMessage.error(err.response?.data ?? '驗證失敗')
    }
  } else if (step.value === 3) {
   if (!isValidPassword.value) {
  ElMessage.error('密碼需包含大小寫英文，長度為6~12字元')
  return
}
    if (form.newPassword !== form.confirmPassword) {
      ElMessage.error('請確認兩次輸入的密碼一致')
      return
    }
    try {
      await api.post('/PasswordResets/reset', {
        email,
        newPassword: form.newPassword
      })
      ElMessage.success('密碼已重設成功，請重新登入')
      setTimeout(() => {
        resetForm()
        emit('switch-to-login')
      }, 1000)

    } catch (err) {
      ElMessage.error(err.response?.data ?? '重設失敗')
    }
  }
}
function resetForm() {
  form.account = ''
  form.code = ''
  form.newPassword = ''
  form.confirmPassword = ''
  step.value = 1
  countdown.value = 0
  touched.value = false
  if (resendTimer.value) clearInterval(resendTimer.value)
}
defineExpose({
  resetForm
})
</script>
