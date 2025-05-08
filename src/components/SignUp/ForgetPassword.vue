<template>
    <div class="flex flex-col gap-3">
      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white m-2">忘記密碼？</h2>
      </div>
  
      <Card>
        <CardContent class="grid p-0 md:grid-cols-2">
          <!-- ✅ 圖片區塊 -->
          <div class="relative hidden bg-muted md:block rounded-[20px]">
            <img
              src="/images/ForgetPasswordImage.jpg"
              alt="Image"
              class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-[20px]"
            />
          </div>
  
          <!-- ✅ 表單 -->
          <form @submit.prevent="handleReset" class="p-6 md:p-6">
            <div class="flex flex-col gap-8">
              <!-- ✅ Logo -->
              <img src="@/assets/images/newlogo.png" width="160" class="mx-auto" />
  
              <div class="flex flex-col gap-6">
                <!-- ✅ 帳號欄 -->
                <div class="grid gap-2">
                  <label for="account" class="text-sm font-medium">信箱</label>
                  <input
                    id="account"
                    v-model="form.account"
                    type="text"
                    placeholder="travellian@example.com"
                    class="border rounded px-3 py-2 text-sm"
                    required
                  />
                  <span v-if="touched && !isValidEmail" class="text-red-500 text-xs">
                    請輸入有效的 Email
                  </span>
                </div>
  
                <!-- ✅ 說明 -->
                <p class="text-sm text-muted-foreground">
                  說明：<br />請確認您輸入的為本人信箱，密碼重設連結將寄送至該信箱，請於有效時間內完成密碼重設定。<br />  <br /> 
                  ※ 若您未曾申請密碼重設，請忽略此信件。
                </p>
  
                <!-- ✅ 提交按鈕 -->
                <Button type="submit" class="w-full">確定重置</Button>
  
                <!-- ✅ 返回登入 -->
                <Button type="button" class="w-full" @click="$emit('switch-to-login')">
                  返回登入
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, computed, watch } from 'vue'
  
  // ✅ 定義 emit 用來關閉視窗
  const emit = defineEmits(['switch-to-login'])
  
  const form = reactive({
    account: ''
  })
  
  const touched = ref(false)
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const isValidEmail = computed(() => emailRegex.test(form.account.trim()))
  
  watch(() => form.account, () => {
    touched.value = false
  })
  
  function handleReset() {
    const trimmed = form.account.trim()
    if (!emailRegex.test(trimmed)) {
      touched.value = true
      return
    }
  
    alert("重設密碼連結已寄送到你的信箱，請於10分鐘內點擊，否則連結將失效")
  
    // ✅ 清空表單並關閉視窗（回到登入頁）
    form.account = ''
    touched.value = false
    emit('switch-to-login')
  }
  </script>
  