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
                  required
                />
              </div>
              <div class="grid gap-2 relative">
                <Label for="password">密碼</Label>
                <div class="relative">
                  <Input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="form.password"
                    placeholder="請輸入6~12位數密碼，且包含大、小寫英文的密碼"
                    required
                    class="pr-10"
                  />
                  <button
                    type="button"
                    @click="togglePassword"
                    class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    tabindex="-1"
                    aria-label="切換密碼顯示"
                  >
                    <component
                      :is="showPassword ? EyeIcon : EyeOffIcon"
                      class="w-5 h-5"
                    />
                  </button>
                </div>
              </div>
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
import { reactive, computed, ref } from "vue";
const form = reactive({
  account: "",
  password: "",
});
// 驗證帳號格式
const isValidAccount = computed(() => {
  const account = String(form.account).trim();
  return /^09\d{8}$/.test(account) || /^\S+@\S+\.\S+$/.test(account);
});

const rememberMe = ref(false);
const touched = ref(false);

import axios from "axios";
import { ElMessage } from 'element-plus'

async function handleLogin() {
  form.account = form.account.trim();
  form.password = form.password.trim();
  touched.value = true;

  if (!isValidAccount.value) {
    ElMessage({
      message: '請輸入有效的手機號碼或信箱格式',
      type: 'warning',
      duration: 3000
    });
    return;
  }

  if (!form.password || form.password.length < 6 || form.password.length > 12) {
     ElMessage({
      message: '密碼長度為 6~12 位，且包含大、小寫英文',
      type: 'warning',
      duration: 3000
    });
    return;
  }

  try {
    // ✅ 呼叫後端登入 API
    const response = await axios.post(
      "https://localhost:7265/api/account/login",
      {
        account: form.account,
        password: form.password,
      }
    );
    //將會員名稱存入 localStorage
    const memberName = response.data.name;
    localStorage.setItem("memberName", memberName);

      ElMessage({
      message: '登入成功！3秒後將自動跳轉至首頁',
      type: 'success',
      duration: 3000
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 3000);

  } catch (error) {
    if (error.response && error.response.status === 401) {
      ElMessage({
        message: '帳號或密碼錯誤',
        type: 'error',
        duration: 3000
      });
    } else {
      // 其他錯誤
      ElMessage({
        message: '登入失敗，請稍後再試',
        type: 'error',
        duration: 3000
      });
      console.error(error);
    }
  }
}

import { EyeIcon, EyeOffIcon } from "lucide-vue-next"; // 加入圖示
const showPassword = ref(false); // 密碼是否顯示
function togglePassword() {
  showPassword.value = !showPassword.value;
}
</script>
