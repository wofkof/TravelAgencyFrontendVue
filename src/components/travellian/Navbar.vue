<template>
  <div class="navbar">
    <!-- logo -->
    <router-link to="/" class="header__logo logo">
      <img
        src="@/assets/images/newlogo.png"
        alt="Travellian logo"
        class="logo__img"
        style="width: 180px; margin-left: 100px; margin-top: 21px"
      />
    </router-link>

    <!-- 上導覽列 -->
    <header
      class="hero__header header"
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
      "
    >
      <nav class="header__menu main-menu">
        <router-link
          to="/"
          class="main-menu__item"
          active-class="main-menu__item--active"
          exact
          style="color: black"
          >首頁</router-link
        >
        <router-link
          to="/Domestic"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >國內旅遊</router-link
        >
        <router-link
          to="/ForeignView"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >國外旅遊</router-link
        >
        <router-link
          to="/FreeTravelView"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >自由行</router-link
        >
        <router-link
          to="/CruiseView"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >遊輪旅遊</router-link
        >
        <router-link
          to="/VisaView"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >代辦簽證</router-link
        >
        <router-link
          to="/ContactView"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >聯絡我們</router-link
        >
        <CartPreviewIcon />
        <router-link
          to="/order-form"
          class="main-menu__item"
          exact
          active-class="main-menu__item--active"
          style="color: black"
          >訂單表單</router-link
        >
      </nav>
    </header>

    <!-- ✅ 登入與註冊直接放在 navbar 右側 -->
    <nav
      class="auth-menu"
      style="
        display: flex;
        flex-direction: row;
        gap: 20px;
        align-items: center;
        padding-right: 40px;
      "
    >
      <a
        href="#"
        class="auth-menu__item auth-menu__item--btn1"
        @click.prevent="showLogin = true"
        style="white-space: nowrap"
        >登入</a
      >
      <a
        href="#"
        class="auth-menu__item auth-menu__item--btn"
        @click.prevent="showSignUp = true"
        style="white-space: nowrap; display: inline-block; text-align: center"
        >註冊</a
      >
    </nav>
  </div>

  <!-- Dialog 區域 -->
  <el-dialog v-model="showLogin" width="800px" :close-on-click-modal="false">
    <Login
      @switchToSignUp="handleSwitchToSignUp"
      @switch-to-forget="handleSwitchToForgetPassword"
    />
  </el-dialog>

  <el-dialog v-model="showSignUp" width="800px" :close-on-click-modal="false">
    <SignUp @switch-to-login="handleSwitchToLogin" />
  </el-dialog>

  <el-dialog
    v-model="showForgetPassword"
    width="800px"
    :close-on-click-modal="false"
  >
    <ForgetPassword @switch-to-login="handleSwitchToLogin" />
  </el-dialog>
</template>

<script setup>
import { ref } from "vue";

import Login from "@/components/SignUp/Login.vue";
import SignUp from "@/components/SignUp/SignUp.vue";
import ForgetPassword from "@/components/SignUp/ForgetPassword.vue";
import CartPreviewIcon from "@/components/tools/CartPreviewIcon.vue"; // 確認路徑

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

<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.1); /* 半透明白 */
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  -webkit-backdrop-filter: blur(10px); /* Safari 支援 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.3); /* 淡淡邊框 */
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
</style>
