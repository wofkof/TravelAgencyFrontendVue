<script setup>
const emit = defineEmits(['switch-to-login'])
import { ElMessage } from 'element-plus'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const name = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errors = ref({})

// 提交註冊表單的函式
const submit = async () => {
  errors.value = {} // reset

  // 先檢查所有欄位是否填寫
  if (!name.value || !phone.value || !email.value || !password.value || !confirmPassword.value || !emailCode.value) {
  alert('請完整填寫所有欄位')
  return
}


  // 密碼確認一致性
  if (password.value !== confirmPassword.value) {
    errors.value.ConfirmPassword = ['密碼輸入不一致，請再次確認']
    return
  }

  try {
    await axios.post('https://localhost:7265/api/account/signup', {
      name: name.value,
      phone: phone.value,
      email: email.value,
      password: password.value,
      emailVerificationCode: emailCode.value

    })

    ElMessage({
      message: '註冊成功，將自動跳轉回登入頁面',
      type: 'success',
      duration: 2000 
    })
    // 清空欄位再切換畫面
    name.value = ''
    phone.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    // 延遲2秒再切換回登入頁
    setTimeout(() => {
      emit('switch-to-login')
    }, 2000)

  } catch (error) {
    const resErrors = error.response?.data?.errors || {}
    errors.value = resErrors
  }
}

const showTos = ref(false)
const showPrivacy = ref(false)
const wrapperRef = ref(null)

function toggleTos() {
  showTos.value = !showTos.value
  showPrivacy.value = false
}

function togglePrivacy() {
  showPrivacy.value = !showPrivacy.value
  showTos.value = false
}

function handleClickOutside(event) {
  if (!wrapperRef.value.contains(event.target)) {
    showTos.value = false
    showPrivacy.value = false
  }
}


// 掛載與卸載事件監聽器（控制點擊彈窗外部關閉條款)
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'

// 控制密碼欄位的顯示或隱藏
const showPassword = ref(false)
const showConfirmPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value
}
//Email驗證倒數區
const emailCode = ref('')
const countdown = ref(0)
let countdownTimer = null
const sendVerificationCode = async () => {
  if (!email.value) {
    ElMessage.warning('請先輸入 Email')
    return
  }

  try {
    await axios.post('https://localhost:7265/api/account/send-email-code', {
      email: email.value
    })

    ElMessage.success('驗證碼已發送至信箱，請查收')

    // 開始倒數 30 秒
    countdown.value = 30
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer)
      }
    }, 1000)
  } catch (err) {
    ElMessage.error('驗證碼發送失敗')
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <div class="flex flex-col gap-3">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white m-2">
          嶼你同行，一起探索旅行
        </h2>
      </div>
      <Card>
        <CardContent class="grid p-0 md:grid-cols-2">
          <div class="relative hidden bg-muted md:block rounded-[20px]">
            <img
              src="/images/SignUpImage.jpg"
              alt="Image"
              class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-[20px]"
            />
          </div>

          <div class="p-6 md:p-6 flex flex-col gap-8">
            <img src="@/assets/images/newlogo.png" width="160" class="mx-auto" />

            <div class="flex flex-col gap-6">
              <div class="grid gap-2">
                <Label for="name">姓名</Label>
                <Input id="name" v-model="name" placeholder="請輸入姓名" required />
                <span v-if="errors.Name" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Name" :key="i">{{ msg }}<br /></template>
</span>

              </div>

              <div class="grid gap-2">
                <Label for="phone">聯絡手機</Label>
                <Input id="phone" v-model="phone" placeholder="請輸入手機號碼" required  maxlength="10" />
                <span v-if="errors.Phone" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Phone" :key="i">{{ msg }}<br /></template>
</span>
              </div>

              <!-- <div class="grid gap-2">
                <Label for="email">聯絡信箱</Label>
                <Input id="email" v-model="email" placeholder="travellian@example.com" required />
                <span v-if="errors.Email" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Email" :key="i">{{ msg }}<br /></template>
</span>
              </div> -->
<!-- 新增發送驗證碼鈕 -->
 <div class="grid gap-2">
  <Label for="email">聯絡信箱</Label>
  <div class="flex gap-2">
    <Input id="email" v-model="email" placeholder="travellian@example.com" required class="flex-1" />
    <Button type="button" :disabled="countdown > 0" @click="sendVerificationCode">
      {{ countdown > 0 ? countdown + ' 秒後重送' : '發送驗證碼' }}
    </Button>
  </div>
  <span v-if="errors.Email" class="text-red-500 text-sm">
    <template v-for="(msg, i) in errors.Email" :key="i">{{ msg }}<br /></template>
  </span>
</div>
 <!-- 驗證碼欄位&重新發送鈕 -->
  <div class="grid gap-2">
  <Label for="email-code">Email 驗證碼</Label>
  <Input id="email-code" v-model="emailCode" placeholder="請輸入 Email 中收到的驗證碼" required />
  <span v-if="errors.EmailVerificationCode" class="text-red-500 text-sm">
    <template v-for="(msg, i) in errors.EmailVerificationCode" :key="i">{{ msg }}<br /></template>
  </span>
  <div class="grid gap-2 relative">
  <Label for="password">密碼</Label>
  <div class="relative">
    <Input
      :type="showPassword ? 'text' : 'password'"
      id="password"
      v-model="password"
      placeholder="請設定長度6~12位數，且包含大、小寫英文的密碼
"
      required  maxlength="12"
      class="pr-10"
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
  <span v-if="errors.Password" class="text-red-500 text-sm">
    <template v-for="(msg, i) in errors.Password" :key="i">{{ msg }}<br /></template>
  </span>
</div>

<div class="grid gap-2 relative">
  <Label for="confirm-password">確認密碼</Label>
  <div class="relative">
    <Input
      :type="showConfirmPassword ? 'text' : 'password'"
      id="confirm-password"
      v-model="confirmPassword"
      placeholder="請再次輸入密碼"
      required maxlength="12"
      class="pr-10"
    />
    <button
      type="button"
      @click="toggleConfirmPassword"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
      tabindex="-1"
      aria-label="切換確認密碼顯示"
    >
      <component :is="showConfirmPassword ? EyeIcon : EyeOffIcon" class="w-5 h-5" />
    </button>
  </div>
  <span v-if="errors.ConfirmPassword" class="text-red-500 text-sm">
    <template v-for="(msg, i) in errors.ConfirmPassword" :key="i">{{ msg }}<br /></template>
  </span>
 
</div>

</div>

</div>
              <Button type="submit" class="w-full">
                立即註冊
              </Button>

              <div class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span class="relative z-10 bg-background px-2 text-muted-foreground">
                  或以社群帳號註冊
                </span>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <button
                  class="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100">
                  <img
                    src="https://raw.githubusercontent.com/sidiDev/remote-assets/7cd06bf1d8859c578c2efbfda2c68bd6bedc66d8/google-icon.svg"
                    alt="Google"
                    class="w-5 h-5"
                  />
                  使用Google帳號註冊
                </button>
              </div>

              <div class="text-center text-sm">
                已經是會員嗎？
                <button @click="$emit('switch-to-login')"
                        class="underline underline-offset-4 text-primary hover:text-indigo-500">
                  前往登入
                </button>
              </div>
            </div>

        </CardContent>
      </Card>
    </div>
    <div ref="wrapperRef" class="text-center text-xs text-muted-foreground m-3 leading-relaxed">
    點擊「註冊」即表示您已閱讀並同意本旅行社之

    <span @click.stop="toggleTos" class="underline underline-offset-4 cursor-pointer relative">
      服務條款
      <div
        v-show="showTos"
        class="absolute top-[-110%] left-1/2 -translate-x-1/2 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-10"
      >
        本旅行社依據交通部觀光署相關規範，提供行程預約、客服聯繫、資料保護等服務。
        使用者應遵守預約流程規定，並保證提供真實有效資訊。如有違反條款者，旅行社有權終止服務。
      </div>
    </span>

    與

    <span @click.stop="togglePrivacy" class="underline underline-offset-4 cursor-pointer relative">
      隱私權政策
      <div
        v-show="showPrivacy"
        class="absolute top-[-110%] left-1/2 -translate-x-1/2 w-64 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-10"
      >
        我們會妥善保存您提供的個人資料，僅用於辦理旅遊業務與提供客服，未經本人同意不會提供第三方。
      </div>
    </span>
  </div>
  </form>
</template>
