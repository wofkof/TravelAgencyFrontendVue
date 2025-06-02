import { createApp } from "vue";
import { createPinia } from "pinia";// 引入 createPinia
import App from "./App.vue";
import router from "./router";//引入在 router/index.js 中配置的路由。 富成
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue"; // 引入 Element Plus 圖標

import zhCn from "element-plus/es/locale/lang/zh-cn"
import 'leaflet/dist/leaflet.css';
import "@/assets/main.css";
import axios from 'axios'

axios.defaults.withCredentials = true

const app = createApp(App);
const pinia = createPinia();// 創建 Pinia 實例


app.use(pinia);// 使用 Pinia
app.use(router);//使用 router 插件
app.use(ElementPlus);// 使用 Element Plus


// 全域註冊所有 Element Plus 圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");// 確保這裡的 '#app' 與你的 index.html 中的根容器 ID 匹配

