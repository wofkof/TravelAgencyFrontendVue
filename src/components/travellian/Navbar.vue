<template>
  <header class="hero__header header">
    <!-- logo -->
    <a href="/" class="header__logo logo">
      <img
        src="/images/logo.svg"
        alt="Travellian logo"
        class="logo__img"
      />
    </a>
    <!-- 上導覽列 -->
    <nav class="header__menu main-menu">
      <a
        href="#"
        class="main-menu__item main-menu__item--active"
        data-text="Home"
        >Home</a
      >
      <a href="#" class="main-menu__item" data-text="Explore">Explore</a>
      <a href="#" class="main-menu__item" data-text="Travel">Travel</a>
      <a href="#" class="main-menu__item" data-text="Blog">Blog</a>
      <a href="#" class="main-menu__item" data-text="Pricing">Pricing</a>
    </nav>
    <!-- 登入與註冊 -->
    <nav class="header__menu auth-menu">
      <a href="#" class="auth-menu__item" data-text="Login">Login</a>
      <a
        href="#"
        class="auth-menu__item auth-menu__item--btn"
        data-text="Sign up"
        >Sign up</a
      >
    </nav>
  </header>
</template>

