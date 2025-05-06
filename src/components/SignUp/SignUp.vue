<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const name = ref('')
const phone = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const errors = ref({})

const submit = async () => {
  errors.value = {} // reset
  if (password.value !== confirmPassword.value) {
  errors.value.ConfirmPassword = ['密碼輸入不一致，請再次確認']
  return
}

  try {
    await axios.post('https://localhost:7265/api/account/signup', {
      name: name.value,
      phone: phone.value,
      email: email.value,
      password: password.value
    })
    alert('註冊成功')
  } catch (error) {
    const resErrors = error.response?.data?.errors || {}
    errors.value = resErrors
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
                <Input id="phone" v-model="phone" placeholder="請輸入手機號碼" required />
                <span v-if="errors.Phone" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Phone" :key="i">{{ msg }}<br /></template>
</span>
              </div>

              <div class="grid gap-2">
                <Label for="email">聯絡信箱</Label>
                <Input id="email" v-model="email" placeholder="travellian@example.com" required />
                <span v-if="errors.Email" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Email" :key="i">{{ msg }}<br /></template>
</span>
              </div>

              <div class="grid gap-2">
                <Label for="password">密碼</Label>
                <Input id="password" type="password" v-model="password" placeholder="請設定6~12位數密碼" required />
                <span v-if="errors.Password" class="text-red-500 text-sm">
  <template v-for="(msg, i) in errors.Password" :key="i">{{ msg }}<br /></template>
</span>

              </div>

              <div class="grid gap-2">
  <Label for="confirm-password">確認密碼</Label>
  <Input
    id="confirm-password"
    type="password"
    v-model="confirmPassword"
    placeholder="請再次輸入密碼"
    required
  />
  <span v-if="errors.ConfirmPassword" class="text-red-500 text-sm">
    <template v-for="(msg, i) in errors.ConfirmPassword" :key="i">{{ msg }}<br /></template>
  </span>
</div>

              <div class="flex items-center gap-2 border rounded px-4 py-3 bg-gray-50">
                <input type="checkbox" id="fake-recaptcha" class="w-5 h-5 accent-blue-600" />
                <label for="fake-recaptcha" class="text-sm text-gray-700 select-none">
                  我不是機器人
                </label>
                <img
                  src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                  alt="reCAPTCHA"
                  class="ml-auto w-10 h-10"
                />
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
          </div>
        </CardContent>
      </Card>

      <div class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary m-2">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  </form>
</template>
