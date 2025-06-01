import { createApp } from "vue";
import { createPinia } from "pinia";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn"
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import 'leaflet/dist/leaflet.css';

import "@/assets/main.css";

import router from "./router";//引入在 router/index.js 中配置的路由。 富成
import App from "./App.vue";
import axios from 'axios'

axios.defaults.withCredentials = true

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(ElementPlus);// 使用 Element Plus
app.use(router);//將 Vue Router 整合到你的 Vue 應用程式中。現在 <router-view> 才能正常工作。使用 router 插件
import { useAuthStore } from '@/stores/authStore'
const authStore = useAuthStore()
authStore.loadFromStorage()

window.isScrolledToBottom = function () {
  const el = document.querySelector(".chat-message-box");
  if (!el) return false;
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
};

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");// 確保這裡的 '#app' 與你的 index.html 中的根容器 ID 匹配

