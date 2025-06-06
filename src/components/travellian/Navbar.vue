<template>
  <div class="navbar">
    <!-- logo -->
    <router-link to="/">
      <img
        src="@/assets/images/newlogo.png"
        alt="Travellian logo"
        class="logo__img"
        style="width: 180px; margin-top: 21px"
      />
    </router-link>

    <!-- 漢堡選單按鈕 -->
    <button
      class="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
      @click="toggleMobileMenu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- 桌面導覽列 -->
    <header
      class="hero__header header hidden md:flex"
      v-if="!isSimpleNavbarRoute"
      style="flex-grow: 1; justify-content: center"
    >
      <nav class="header__menu main-menu flex gap-6">
        <router-link
          to="/"
          exact
          class="main-menu__item"
          active-class="main-menu__item--active"
          style="color: black"
          >首頁</router-link
        >
        <router-link
          to="/Domestic"
          exact
          class="main-menu__item"
          active-class="main-menu__item--active"
          style="color: black"
          >國內旅遊</router-link
        >
        <router-link
          to="/ForeignView"
          exact
          class="main-menu__item"
          active-class="main-menu__item--active"
          style="color: black"
          >國外旅遊</router-link
        >
        <router-link
          to="/FreeTravelView"
          exact
          class="main-menu__item"
          active-class="main-menu__item--active"
          style="color: black"
          >自由行</router-link
        >
        <router-link
          to="/CruiseView"
          exact
          class="main-menu__item"
          active-class="main-menu__item--active"
          style="color: black"
          >遊輪旅遊</router-link
        >
        <router-link
          to="/DocumentMenuView"
          exact
          class="main-menu__item"
          active-class="main-menu__item--active"
          style="color: black"
          >代辦簽證</router-link
        >
      </nav>
    </header>

    <!-- 背景遮罩（點擊可關閉選單） -->
    <transition name="fade">
      <div
        v-if="mobileMenuOpen && !isSimpleNavbarRoute"
        class="fixed inset-0 bg-black/30 z-[998]"
        @click="closeMobileMenu"
      ></div>
    </transition>

    <!-- 行動版導覽列 -->
    <transition name="slide-down">
      <div
        v-if="mobileMenuOpen && !isSimpleNavbarRoute"
        class="absolute top-[150px] left-0 w-full bg-white shadow-lg z-[999] border-t border-gray-200"
      >
        <nav class="flex flex-col px-6 py-4 divide-y divide-gray-200">
          <router-link
            @click="closeMobileMenu"
            to="/"
            class="py-3 text-gray-800 hover:text-red-500 flex items-center gap-2"
          >
            <span>🏠</span> 首頁
          </router-link>
          <router-link
            @click="closeMobileMenu"
            to="/Domestic"
            class="py-3 text-gray-800 hover:text-red-500 flex items-center gap-2"
          >
            <span>🗾</span> 國內旅遊
          </router-link>
          <router-link
            @click="closeMobileMenu"
            to="/ForeignView"
            class="py-3 text-gray-800 hover:text-red-500 flex items-center gap-2"
          >
            <span>✈️</span> 國外旅遊
          </router-link>
          <router-link
            @click="closeMobileMenu"
            to="/FreeTravelView"
            class="py-3 text-gray-800 hover:text-red-500 flex items-center gap-2"
          >
            <span>🧳</span> 自由行
          </router-link>
          <router-link
            @click="closeMobileMenu"
            to="/CruiseView"
            class="py-3 text-gray-800 hover:text-red-500 flex items-center gap-2"
          >
            <span>🚢</span> 遊輪旅遊
          </router-link>
          <router-link
            @click="closeMobileMenu"
            to="/DocumentMenuView"
            class="py-3 text-gray-800 hover:text-red-500 flex items-center gap-2"
          >
            <span>📄</span> 代辦簽證
          </router-link>
        </nav>
      </div>
    </transition>

    <!--  登入與註冊直接放在 navbar 右側 -->
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
      <CartPreviewIcon />
      <template v-if="!isLoggedIn && !isSimpleNavbarRoute">
        <div class="login-signup-switch-wrapper">
          <LoginSignupSwitch
            @click:login="openLoginModal"
            @click:signup="openSignUpModal"
          />
        </div>
      </template>

      <!-- 登入時 -->
      <template v-else-if="isLoggedIn">
        <!-- 使用 flex 容器包覆兩個區塊 -->
        <div class="logged-in-user-wrapper">
          <div class="flex items-center space-x-4">
            <!-- 歡迎訊息與下拉選單 -->
            <div
              class="relative"
              ref="menuRef"
              @mouseenter="openMenu"
              @mouseleave="closeMenu"
            >
              <button
                class="inline-flex items-center gap-1 px-4 py-2 bg-transparent rounded-xl shadow hover:bg-gray-50 transition whitespace-nowrap"
                @click="toggleMenu"
              >
                <span
                  v-if="showOrderNotificationDot"
                  class="navbar-notification-dot main-button-dot"
                ></span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 text-indigo-600"
                  viewBox="0 0 640 512"
                  fill="currentColor"
                >
                  <path
                    d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm51.2 32H172.8C77.3 288 0 365.3 0 460.8C0 487.5 24.5 512 51.2 512H345.6c26.7 0 51.2-24.5 51.2-51.2C396.8 365.3 319.5 288 224 288z"
                  />
                </svg>
                歡迎，{{ memberName || "使用者" }}
                <span
                  :class="
                    isMenuOpen
                      ? 'rotate-180 transition-transform'
                      : 'transition-transform'
                  "
                  >▼</span
                >
              </button>
              <div
                v-if="isMenuOpen"
                class="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg ring-1 ring-black/10 z-50"
              >
                <ul class="divide-y divide-gray-100 text-sm text-gray-700">
                  <li>
                    <router-link
                      to="/member/orders"
                      class="block px-4 py-3 hover:bg-red-50 rounded-t-xl"
                      >📦 訂單管理
                      <span
                        v-if="showOrderNotificationDot"
                        class="navbar-notification-dot menu-item-dot"
                      ></span>
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/member/customtravel-status"
                      class="block px-4 py-3 hover:bg-red-50 rounded-t-xl"
                      >🗺️ 客製化行程</router-link
                    >
                  </li>
                  <li>
                    <router-link
                      to="/member/favorite-travelers"
                      class="block px-4 py-3 hover:bg-red-50"
                      >👥 常用旅客名單</router-link
                    >
                  </li>
                  <li>
                    <router-link
                      to="/member/favorites"
                      class="block px-4 py-3 hover:bg-red-50"
                      >❤️ 我的收藏</router-link
                    >
                  </li>
                  <li>
                    <router-link
                      to="/member/comments"
                      class="block px-4 py-3 hover:bg-red-50"
                      >🗝 我的評論</router-link
                    >
                  </li>
                  <li>
                    <router-link
                      to="/member/profile"
                      class="block px-4 py-3 hover:bg-red-50"
                      >🔐 會員帳號管理</router-link
                    >
                  </li>
                  <li>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-3 hover:bg-red-50 rounded-b-xl text-red-600"
                    >
                      🚪 登出
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </template>
    </nav>
  </div>

  <AuthModal
    v-model="showAuthModal"
    :initial="authStep"
    @login-success="handleLoginSuccess"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import CartPreviewIcon from "@/components/tools/CartPreviewIcon.vue"; // 確認路徑
import { useRouter, useRoute } from "vue-router";
import LoginSignupSwitch from "@/components/tools/LoginSignupSwitch.vue";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import AuthModal from "@/components/SignUp/AuthModal.vue";
import { getConnection } from "@/utils/socket";
import { useHesitationStore } from "@/stores/hesitationStore";
const showAuthModal = ref(false);
const authStep = ref("Login"); // 可為 'Login' | 'SignUp' | 'ForgetPassword'
const chatStore = useChatStore();
const route = useRoute();
const authStore = useAuthStore();
const router = useRouter();
const hesitationStore = useHesitationStore();

// 計算屬性：判斷當前路由是否為需要簡化導覽列的頁面
const isSimpleNavbarRoute = computed(() => {
  return route.meta.simpleNavbar === true;
});

// 登入狀態控制變數
const isLoggedIn = computed(() => authStore.isLoggedIn);
const memberName = computed(() => authStore.memberName);

const showOrderNotificationDot = computed(
  () => hesitationStore.shouldShowHesitationNotification
);

const mobileMenuOpen = ref(false);

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

onMounted(() => {
  authStore.loadFromStorage();
  //正式版要拿掉
  console.log("Pinia 中的會員資訊：", {
    isLoggedIn: authStore.isLoggedIn,
    memberName: authStore.memberName,
    memberId: authStore.memberId,
  });
});

// 登出
function handleLogout() {
  authStore.logout();
  chatStore.reset();
  const conn = getConnection();
  if (conn) {
    conn.stop(); // 斷開 SignalR 連線
  }
  ElMessage.success("您已成功登出");
  router.push("/");
}

// 會員中心下拉選單開關（設定hover + click 並存）
const isMenuOpen = ref(false);
let hoverTimeout = null; // 用於延遲關閉選單

function toggleMenu() {
  clearTimeout(hoverTimeout);
  isMenuOpen.value = !isMenuOpen.value;
}

// 滑鼠移入選單時打開
function openMenu() {
  clearTimeout(hoverTimeout);
  isMenuOpen.value = true;
}

// 滑鼠移出選單時延遲關閉
function closeMenu() {
  hoverTimeout = setTimeout(() => {
    isMenuOpen.value = false;
  }, 200);
}

onBeforeUnmount(() => {
  clearTimeout(hoverTimeout);
});

function handleLoginSuccess() {
  authStore.loadFromStorage();
  showAuthModal.value = false;
  window.location.reload();
  ElMessage.success("登入成功");
}

function openLoginModal() {
  authStep.value = "Login";
  showAuthModal.value = true;
}
function openSignUpModal() {
  authStep.value = "SignUp";
  showAuthModal.value = true;
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}
.slide-down-leave-active {
  transition: all 0.2s ease-in;
}
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

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
  justify-content: space-between; /* 將 logo 和 auth-menu 分開 */
  padding: 0 20px;
}
.login-signup-switch-wrapper {
  width: 150px;
  height: 40px;
  flex: 0 0 150px;
  align-self: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  position: relative;
}
.logged-in-user-wrapper {
  width: 150px;
  height: 40px;
  flex: 0 0 150px;
  align-self: center;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-notification-dot {
  position: absolute;
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
  animation: pulse-dot 1.5s infinite;
}

.main-button-dot {
  top: 6px;
  right: 6px;
}

.menu-item-dot {
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
}

@keyframes pulse-dot {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.navbar .auth-menu .relative ul li .block {
  position: relative; /* 給下拉菜單項的 router-link 添加 relative */
}

@media (max-width: 768px) {
  .navbar > .header__logo {
    margin-left: 20px !important;
  }
  .navbar > .auth-menu {
    padding-right: 20px !important;
  }
}
</style>
