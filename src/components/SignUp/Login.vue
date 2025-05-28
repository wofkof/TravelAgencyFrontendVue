<template>
  <div class="flex flex-col gap-3">
    <div class="text-center">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white m-2">
        歡迎回來
      </h2>
    </div>
    <Card>
      <CardContent class="grid p-0 md:grid-cols-2">
        <form class="p-6 md:p-6" @submit.prevent="handleLogin">
          <div class="flex flex-col gap-8">
            <img
              src="@/assets/images/newlogo.png"
              width="160"
              class="mx-auto"
            />
            <!-- 表單內容區塊 -->
            <div class="flex flex-col gap-8">
              <div class="grid gap-2">
                <Label for="account">帳號</Label>
                <Input
                  id="account"
                  v-model="form.account"
                  placeholder="請輸入手機號碼或Email"
                  required autocomplete="off"
                />
              </div>
              <PasswordInput
                v-model="form.password"
                label="密碼"
                id="password"
                placeholder="請輸入6~12位數密碼，且包含大、小寫英文的密碼"
              />
              

              <!-- 記住我 + 忘記密碼 -->
              <div
                class="flex items-center justify-between text-sm text-muted-foreground"
              >
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="rememberMe"
                    class="accent-indigo-600 w-4 h-4 border border-gray-300 rounded focus:ring-indigo-500"
                  />記住我</label
                >
                <button type="button" @click="$emit('switch-to-forget')">
                  忘記密碼？
                </button>
              </div>
              <!-- Google reCAPTCHA 框 -->
              <div class="flex justify-center">
              <div class="scale-[0.95] sm:scale-100" v-html="recaptchaHtml"></div>
            </div>

              <!-- 登入按鈕 -->
              <Button type="submit" class="w-full"> 登入 </Button>
              <!-- 分隔線文字 -->
              <div
                class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
              >
                <span
                  class="relative z-10 bg-background px-2 text-muted-foreground"
                >
                  或以社群帳號登入
                </span>
              </div>
              <!-- Google 登入按鈕 -->
              <div class="grid grid-cols-1 gap-4">
                <button type="button" @click="handleGoogleLogin"
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
              <!-- 註冊導引 -->
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
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import api from '@/utils/api'
import { reactive, computed, ref,onMounted } from "vue";
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import { defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import PasswordInput from "./PasswordInput.vue";
const siteKey = '6LcVekgrAAAAAGl9ArUfrJjLffkSNTWtvMQlHBTo'
const recaptchaHtml = `<div class="g-recaptcha" data-sitekey="${siteKey}"></div>`;
const getRecaptchaToken = () => {
  return grecaptcha.getResponse()
}
const emit = defineEmits(["close", "login-success", 'switch-to-sign-up', 'switch-to-forget'])
const authStore = useAuthStore()
const form = reactive({
  account: "",
  password: "",
});
// 驗證帳號格式
const isValidAccount = computed(() => {
  const account = String(form.account).trim();
  return /^09\d{8}$/.test(account) || /^\S+@\S+\.\S+$/.test(account);
});
//驗證密碼格式
const isValidPassword = computed(() => {
  return /^(?=.*[a-z])(?=.*[A-Z]).{6,12}$/.test(form.password);
});
const rememberMe = ref(false);
const touched = ref(false);
const router = useRouter()
const route = useRoute()
const isPageMode = computed(() => route.name === "LoginPage")
onMounted(() => {
  const el = document.querySelector('.g-recaptcha')
  if (window.grecaptcha && el) {
    grecaptcha.render(el, {
      sitekey: siteKey
    });
  } else {
    console.warn('⚠️ grecaptcha 或 reCAPTCHA element 尚未就緒');
  }
});

async function handleLogin() {
  form.account = form.account.trim();
  form.password = form.password.trim();
  touched.value = true;
  if (!isValidAccount.value) {
    ElMessage({
      message: '請輸入有效的手機號碼或信箱格式',
      type: 'warning',
      duration: 2500
    });
    return;
  }
if (!isValidPassword.value) {
  ElMessage({
    message: '密碼需包含大小寫英文，長度為6~12字元',
    type: 'warning',
    duration: 2500
  });
  return;
}
const recaptchaToken = getRecaptchaToken()
if (!recaptchaToken) {
  ElMessage({
    message: '請先通過「我不是機器人」驗證',
    type: 'warning',
    duration: 2500
  })
  return
}
  try {
    // ✅ 呼叫後端登入 API
    const response = await api.post(
      "/account/login",
      {
        account: form.account,
        password: form.password,
         recaptchaToken: recaptchaToken
      }
    );
    
    //將會員名稱及ID存入 localStorage
    const memberName = response.data.name;
    const memberId = response.data.id;
    authStore.login(memberName, memberId, rememberMe.value)
      emit("login-success")
    console.log(" Pinia 中的會員資訊：", authStore.$state)

    if (isPageMode.value) {
      router.push("/")
    } else {
      emit("close")
    }
    grecaptcha.reset();
  } catch (error) {
     authStore.reset() 
    if (error.response && error.response.status === 401) {
      ElMessage({
        message: '帳號或密碼錯誤',
        type: 'error',
        duration: 2500
      });
      grecaptcha.reset();
    } else {
      // 其他錯誤
      ElMessage({
        message: '登入失敗，請稍後再試',
        type: 'error',
        duration: 2500
      });
      console.error(error);
    }
  }
}
function resetForm() {
  form.account = "";
  form.password = "";
  touched.value = false;
}
defineExpose({ resetForm });
function handleGoogleLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = 'https://localhost:3000/oauth2/callback'; // 要跟 Google Cloud 中設定的一樣
  const scope = 'openid email profile';
  const responseType = 'code';

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=${responseType}&scope=${encodeURIComponent(
    scope
  )}&prompt=consent select_account`;

  window.location.href = url;
}

</script>
