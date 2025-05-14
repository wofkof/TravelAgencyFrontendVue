<template>
  <div class="login-signup-switch" :class="{ 'is-signup': isSignupSelected }">
    <div class="switch-thumb"></div>

    <button
      class="switch-option login-option"
      :class="{ 'is-active': !isSignupSelected }"
      @click="selectLogin"
    >
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" class="icon user-icon"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm51.2 32H172.8C77.3 288 0 365.3 0 460.8C0 487.5 24.5 512 51.2 512H345.6c26.7 0 51.2-24.5 51.2-51.2C396.8 365.3 319.5 288 224 288z"/></svg>
      登入
    </button>

    <button
      class="switch-option signup-option"
      :class="{ 'is-active': isSignupSelected }"
      @click="selectSignup"
    >
      註冊
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 定義組件可以觸發的事件，讓父組件（Navbar）知道何時打開登入或註冊 Dialog
const emit = defineEmits(['click:login', 'click:signup']);

// 內部狀態：是否選中了註冊 (默認為 false，即選中登入)
const isSignupSelected = ref(false);

// 點擊登入選項
function selectLogin() {
  // 如果當前已經是登入狀態，則觸發登入事件
  if (isSignupSelected.value) {
     isSignupSelected.value = false;
     setTimeout(() => emit('click:login'), 600);
  }else{
    emit('click:login');
  }

}

// 點擊註冊選項
function selectSignup() {
  // 如果當前已經是註冊狀態，則觸發註冊事件
  if (!isSignupSelected.value) {
    isSignupSelected.value = true;
    setTimeout(() => emit('click:signup'), 600);
  }else{
    emit('click:signup');
  }

}

</script>

<style scoped>

.login-signup-switch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background-color: #e0e0e0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

/* 滑動的「球」/背景 */
.switch-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-color: #ec0de1;
  border-radius: 20px;
  transition: left 0.6s ease-in-out, background-color 0.6s ease-in-out;
  z-index: 1;
}

/* 當選中註冊時，將球移動到右側並改變顏色 */
.login-signup-switch.is-signup .switch-thumb {
  left: 50%; /* 移動到右側 */
  background-color: #ff9800;
}

/* 選項按鈕 (登入/註冊) */
.switch-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  z-index: 2;
  transition: color 0.2s ease-in-out;
  box-sizing: border-box;
  height: 100%;
}

/* 非活動狀態的文字顏色 */
.switch-option:not(.is-active) {
    color: #616161; /* 示例：灰色 */
}

/* 登入選項圖標樣式 */
.login-option .icon {
    width: 20px; /* 圖標大小 */
    height: 20px;
    margin-right: 5px; /* 圖標與文字間距 */
}
</style>