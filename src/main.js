import { createApp } from "vue";
import { createPinia } from "pinia";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "@/assets/main.css";

import router from "./router";//引入在 router/index.js 中配置的路由。 富成
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus);// 使用 Element Plus
app.use(pinia);
app.use(router);//將 Vue Router 整合到你的 Vue 應用程式中。現在 <router-view> 才能正常工作。
app.mount("#app");// 確保這裡的 '#app' 與你的 index.html 中的根容器 ID 匹配

