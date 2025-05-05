<template>
    <div class="flex flex-col gap-3">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white m-2">歡迎回來</h2>
      </div>
      <Card>
        <CardContent class="grid p-0 md:grid-cols-2">
          <form class="p-6 md:p-6" @submit.prevent="handleLogin">

  <div class="flex flex-col gap-8">
    <img src="@/assets/images/newlogo.png" width="160" class="mx-auto" />
    <!-- ✅ 表單內容區塊 -->
    <div class="flex flex-col gap-8">
      <div class="grid gap-2">
        <Label for="account">帳號</Label>
        <Input
          id="account"
          v-model="form.account"
          placeholder="請輸入手機號碼或Email"
          required
        />
        <span v-if="touched && !isValidAccount" class="text-red-500 text-xs">
          請輸入有效的手機號碼或 Email
        </span>
      </div>
      <div class="grid gap-2">
        <Label for="password">密碼</Label>
        <Input
        id="password"
        v-model="form.password"
        type="password"
        placeholder="請設定6~12位數密碼"
        required
      />
      <span v-if="touched && (form.password.length < 6 || form.password.length > 12)" class="text-red-500 text-xs">
        密碼長度需為 6~12 位
      </span>

      </div>
      <!-- ✅ 記住我 + 忘記密碼 -->
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
        type="checkbox"
        v-model="rememberMe"
        class="accent-indigo-600 w-4 h-4 border border-gray-300 rounded focus:ring-indigo-500"
        />記住我</label>
        <button type="button" @click="$emit('switch-to-forget')">忘記密碼？</button>
      </div>
      <!-- ✅ 登入按鈕 -->
      <Button type="submit" class="w-full">
        登入
      </Button>
      <!-- ✅ 分隔線文字 -->
      <div class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span class="relative z-10 bg-background px-2 text-muted-foreground">
          或以社群帳號登入
        </span>
      </div>
      <!-- ✅ Google 登入按鈕 -->
      <div class="grid grid-cols-1 gap-4">
        <button
          class="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100"
        >
          <img
            src="https://raw.githubusercontent.com/sidiDev/remote-assets/7cd06bf1d8859c578c2efbfda2c68bd6bedc66d8/google-icon.svg"
            alt="Google"
            class="w-5 h-5"
          />
          使用 Google 帳號登入
        </button>
      </div>
       <!-- ✅ 註冊導引 -->
      <div class="text-center text-sm">
        還不是會員嗎？
        <button
          type="button"
          @click="$emit('switch-to-sign-up')"
          class="underline underline-offset-4 text-primary hover:text-indigo-500"
        >
          前往註冊
        </button>
      </div>
          </div>
        </div>
      </form>
          <div class="relative hidden bg-muted md:block rounded-[20px]">
            <img
              src="/images/LoginImage.jpg"
              alt="Image"
              class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-[20px]"
            >
          </div>
        </CardContent>
      </Card>
      <div class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary m-2">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  </template>
  <script setup>
  import { reactive, computed, ref } from 'vue'
const form = reactive({
  account: '',
  password: ''
})
const isValidAccount = computed(() => {
  const account = String(form.account).trim()
  return (
    /^09\d{8}$/.test(account) ||
    /^\S+@\S+\.\S+$/.test(account)
  )
});


const rememberMe = ref(false)
const touched = ref(false)

function handleLogin() {
  form.account = form.account.trim()
form.password = form.password.trim()

  touched.value = true

  if (!isValidAccount.value) {
    alert('請輸入有效的手機號碼或信箱格式')
    return
  }

  if (!form.password || form.password.length < 6 || form.password.length > 12) {
    alert('密碼長度需為 6~12 位')
    return
  }

  // ✅ 假登入流程（可換成 axios 登入 API）
  alert(`登入成功：帳號 ${form.account}`)

  // TODO: emit('login-success') 或關閉 dialog 等
}

  </script>
  