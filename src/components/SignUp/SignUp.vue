<script setup>
const emit = defineEmits(['switch-to-login'])
import { ElMessage } from 'element-plus'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PasswordInput from "./PasswordInput.vue";
import api from '@/utils/api'

const name = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref({})
const isValidPhone = computed(() => /^09\d{8}$/.test(phone.value.trim()))
const isValidPassword = computed(() =>
  /^(?=.*[a-z])(?=.*[A-Z]).{6,12}$/.test(password.value)
)

// 提交註冊表單的函式
const submit = async () => {
  errors.value = {} // reset
if (!isValidPhone.value) {
  ElMessage.warning('請輸入有效的台灣手機號碼（需為09開頭10碼數字）')
  return
}
if (!isValidPassword.value) {
  ElMessage.warning('密碼需包含大小寫英文，長度為6~12位數')
  return
}

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
    await api.post('/Account/signup', {
      name: name.value,
      phone: phone.value,
      email: email.value,
      password: password.value,
      emailVerificationCode: emailCode.value

    })

    ElMessage({
      message: '註冊成功！將自動跳轉回登入頁面',
      type: 'success',
      duration: 1500 
    })
    // 清空欄位再切換畫面
    name.value = ''
    phone.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    emailCode.value = ''
    // 延遲1.5秒再切換回登入頁
    setTimeout(() => {
      emit('switch-to-login')
    }, 1500)

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
    await api.post('/Account/send-email-code', {
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
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
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
                <Input id="name" v-model="name" placeholder="請輸入姓名" required autocomplete="off" />
                <span v-if="errors.Name" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Name" :key="i">{{ msg }}<br /></template>
</span>

              </div>

              <div class="grid gap-2">
                <Label for="phone">聯絡手機</Label>
                <Input id="phone" v-model="phone" placeholder="請輸入手機號碼" required autocomplete="off" maxlength="10" />
                <span v-if="errors.Phone" class="text-red-500 text-sm">
                <template v-for="(msg, i) in errors.Phone" :key="i">{{ msg }}<br /></template>
              </span>
              </div>

<!-- 新增發送驗證碼鈕 -->
 <div class="grid gap-2">
  <Label for="email">聯絡信箱</Label>
  <div class="flex gap-2">
    <Input id="email" v-model="email" placeholder="travellian@example.com" required autocomplete="off" class="flex-1" />
    <Button type="button"  class="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold" :disabled="countdown > 0" @click="sendVerificationCode">
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
  <Input id="email-code" v-model="emailCode" placeholder="請輸入 Email 中收到的驗證碼" maxlength="6" required autocomplete="off" />
  <p class="text-xs text-muted-foreground">
  ※ 驗證碼 10 分鐘內有效
</p>

  <span v-if="errors.EmailVerificationCode" class="text-red-500 text-sm">
    <template v-for="(msg, i) in errors.EmailVerificationCode" :key="i">{{ msg }}<br /></template>
  </span>
</div>
<PasswordInput
  id="password"
  v-model="password"
  label="密碼"
  placeholder="請設定長度6~12位數，且包含大、小寫英文的密碼"
/>
<span v-if="errors.Password" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Password" :key="i">{{ msg }}<br /></template>
</span>
<PasswordInput
  id="confirm-password"
  v-model="confirmPassword"
  label="確認密碼"
  placeholder="請再次輸入密碼"
/>
<span v-if="errors.ConfirmPassword" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.ConfirmPassword" :key="i">{{ msg }}<br /></template>
</span>

</div>
              <Button type="submit" class="w-full">
                立即註冊
              </Button>

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
    <div ref="wrapperRef" class="text-center text-xs text-muted-foreground mt-4 leading-relaxed ">
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
