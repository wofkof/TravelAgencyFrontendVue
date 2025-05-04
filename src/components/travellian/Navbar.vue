<template>
  <header class="hero__header header">
    <!-- logo -->
      <router-link to="/" class="header__logo logo">
        <img
          src="@/assets/images/logo.png"
          alt="Travellian logo"
          class="logo__img"
          style="width: 180px"
        />
      </router-link>
    <!-- 上導覽列 -->
    <nav class="header__menu main-menu">
      <router-link
        to="/"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >首頁
      </router-link>

      <router-link
        to="/Domestic"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >國內旅遊
      </router-link>

      <router-link
        to="/ForeignView"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >國外旅遊
      </router-link>

      <router-link
        to="/FreeTravelView"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >自由行
      </router-link>

      <router-link
        to="/CruiseView"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >遊輪旅遊
      </router-link>

      <router-link
        to="/PricingView"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >優惠活動
      </router-link>

      <router-link
        to="/VisaView"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >代辦簽證
      </router-link>

      <router-link
        to="/ContactView"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >聯絡我們
      </router-link>

      <!-- <router-link
        to="/Cart"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        title="購物車" >
        <el-icon size="20"><ShoppingCart /></el-icon>
      </router-link> -->
      <CartPreviewIcon />
      
      <router-link
        to="/order-form"
        class="main-menu__item"
        active-class="main-menu__item--active"
        exact
        >訂單表單
      </router-link>
    </nav>

    <!-- 登入與註冊 -->
    <nav class="header__menu auth-menu">
      <a href="#" class="auth-menu__item" data-text="Login" @click.prevent="showLogin = true">登入</a>
      <a href="#" class="auth-menu__item auth-menu__item--btn" data-text="Sign up" @click.prevent="showSignUp = true">註冊</a>
    </nav>
  </header>

  <!-- 🔒 登入 Dialog -->
  <el-dialog v-model="showLogin" width="800px" :close-on-click-modal="false">
    <Login
      @switchToSignUp="handleSwitchToSignUp"
      @switch-to-forget="handleSwitchToForgetPassword"
    />
  </el-dialog>

  <!-- 📝 註冊 Dialog -->
  <el-dialog v-model="showSignUp" width="800px" :close-on-click-modal="false">
    <SignUp @switch-to-login="handleSwitchToLogin" />
  </el-dialog>

  <!-- ❓ 忘記密碼 Dialog -->
  <el-dialog v-model="showForgetPassword" width="800px" :close-on-click-modal="false">
    <ForgetPassword @switch-to-login="handleSwitchToLogin" />
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";

import Login from "@/components/SignUp/Login.vue";
import SignUp from "@/components/SignUp/SignUp.vue";
import ForgetPassword from "@/components/SignUp/ForgetPassword.vue";
import SingUp from "@/components/singup/SingUp.vue";

import CartPreviewIcon from '@/components/tools/CartPreviewIcon.vue'; // 確認路徑
const showSingUp = ref(false);

// 控制各個 dialog 顯示
const showLogin = ref(false);
const showSignUp = ref(false);
const showForgetPassword = ref(false);

// 切換邏輯
function handleSwitchToSignUp() {
  showLogin.value = false;
  showSignUp.value = true;
}

function handleSwitchToLogin() {
  showSignUp.value = false;
  showForgetPassword.value = false;
  showLogin.value = true;
}

function handleSwitchToForgetPassword() {
  showLogin.value = false;
  showForgetPassword.value = true;
}
</script>
