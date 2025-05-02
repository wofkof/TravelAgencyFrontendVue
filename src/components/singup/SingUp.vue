<!-- <script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";

interface RuleForm {
  name: string;
  region: string;
  count: string;
  date1: string;
  date2: string;
  delivery: boolean;
  location: string;
  type: string[];
  resource: string;
  desc: string;
}

const ruleFormRef = ref<FormInstance>();
const ruleForm = reactive<RuleForm>({
  name: "Hello",
  region: "",
  count: "",
  date1: "",
  date2: "",
  delivery: false,
  location: "",
  type: [],
  resource: "",
  desc: "",
});

const locationOptions = ["Home", "Company", "School"];

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
    { min: 3, max: 5, message: "Length should be 3 to 5", trigger: "blur" },
  ],
  region: [
    {
      required: true,
      message: "Please select Activity zone",
      trigger: "change",
    },
  ],
  count: [
    {
      required: true,
      message: "Please select Activity count",
      trigger: "change",
    },
  ],
  date1: [
    {
      type: "date",
      required: true,
      message: "Please pick a date",
      trigger: "change",
    },
  ],
  date2: [
    {
      type: "date",
      required: true,
      message: "Please pick a time",
      trigger: "change",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a location",
      trigger: "change",
    },
  ],
  type: [
    {
      type: "array",
      required: true,
      message: "Please select at least one activity type",
      trigger: "change",
    },
  ],
  resource: [
    {
      required: true,
      message: "Please select activity resource",
      trigger: "change",
    },
  ],
  desc: [
    { required: true, message: "Please input activity form", trigger: "blur" },
  ],
});

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
    } else {
      console.log("error submit!", fields);
    }
  });
};

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`,
}));
</script>  -->

<!-- <script setup lang="ts">
import { Button } from '@/registry/new-york/ui/button'
import { Card, CardContent } from '@/registry/new-york/ui/card'
import { Input } from '@/registry/new-york/ui/input'
import { Label } from '@/registry/new-york/ui/label'
</script> -->

<template>
  <div class="flex flex-col gap-3">
    <div class="text-center">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white">歡迎加入嶼你同行</h2>
    </div>
    <Card class="overflow-hidden">
      <CardContent class="grid p-0 md:grid-cols-2">
        <form class="p-6 md:p-6">
          <div class="flex flex-col gap-4">
            <img src="@/assets/images/newlogo.png" width="160" class="mx-auto" />
            <div class="flex flex-col items-center text-center">            
          </div>
            <div class="grid gap-2">
              <Label for="name">姓名</Label>
              <Input
                id="name"
                type="name"
                placeholder="請輸入您的姓名"
                required
              />             
            </div>
            <div class="grid gap-2">
              <Label for="phone">聯絡手機</Label>
              <Input 
                id="phone"
                type="phone"
                placeholder="請輸入您的手機號碼"
                required
              />             
            </div>
            <div class="grid gap-2">
              <Label for="email">聯絡信箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">密碼</Label>
              <Input id="password" type="password" required placeholder="請設定6~12位數密碼" />
            </div>
            <div class="grid gap-2">
              <Label for="password">確認密碼</Label> 
              <Input id="password" type="password" required placeholder="請再次輸入密碼" />
            </div>
           <!-- 假 reCAPTCHA 區塊 -->
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
               <!-- Google Button -->
            <button
              class="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg hover:bg-gray-50 duration-150 active:bg-gray-100"
            >
              <!-- SVG for Google -->
              <img
                src="https://raw.githubusercontent.com/sidiDev/remote-assets/7cd06bf1d8859c578c2efbfda2c68bd6bedc66d8/google-icon.svg"
                alt="Google"
                class="w-5 h-5"
              />
              <!-- Comment: Google Icon SVG here -->
              使用Google帳號註冊
            </button>
            </div>
            <div class="text-center text-sm">
              已經是會員嗎?
              <a href="#" class="underline underline-offset-4">
                前往登入
              </a>
            </div>
          </div>
        </form>
        <div class="relative hidden bg-muted md:block rounded-[20px]">
          <img
            src="/images/SignUpImage.jpg"
            alt="Image"
            class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-[20px]"
          >
        </div>
      </CardContent>
    </Card>
    <div class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>.
    </div>
  </div>
</template>
<script setup>

</script>
