<template>
  <header class="hero__header header">
    <!-- logo -->
    <a href="/" class="header__logo logo">
      <router-link to="/">
        <img
          src="@/assets/images/logo.png"
          alt="Travellian logo"
          class="logo__img"
          style="width: 180px"
        />
      </router-link>
    </a>
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
    </nav>
    <!-- 登入與註冊 -->
    <nav class="header__menu auth-menu">
      <a
        href="#"
        class="auth-menu__item"
        data-text="Login"
        @click.prevent="showLogin = true"
        >登入
      </a>
      <a
        href="#"
        class="auth-menu__item auth-menu__item--btn"
        data-text="Sign up"
        @click.prevent="showSignUp = true"
        >註冊
      </a>
    </nav>
  </header>

  <el-dialog
  v-model="showLogin"
  width="800px"
  :close-on-click-modal="false"
>
  <Login @switchToSignUp="handleSwitchToSignUp" />
</el-dialog>

<el-dialog v-model="showSignUp" width="800px" :close-on-click-modal="false">
  <SignUp @switch-to-login="handleSwitchToLogin" />
</el-dialog>
</template>

<script setup>
import { ref } from "vue";
import SignUp from "@/components/SignUp/SignUp.vue";
import Login from "@/components/SignUp/Login.vue";

const showSignUp = ref(false);
const showLogin = ref(false);

function handleSwitchToSignUp() {
  showLogin.value = false;
  showSignUp.value = true;
}

function handleSwitchToLogin() {
  showSignUp.value = false
  showLogin.value = true
}

</script>
