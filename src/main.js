import { createApp } from "vue";
import { createPinia } from "pinia";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "@/assets/main.css";

import router from "./router";
import App from "./App.vue";
import axios from 'axios'

axios.defaults.withCredentials = true

const app = createApp(App);
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);
app.use(pinia);
app.use(router);
app.mount("#app");// 確保這裡的 '#app' 與你的 index.html 中的根容器 ID 匹配
