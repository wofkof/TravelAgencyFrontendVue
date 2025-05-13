import { createApp } from "vue";
import { createPinia } from "pinia";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn"
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "@/assets/main.css";

import router from "./router";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(ElementPlus, {
  locale: zhCn,
});
app.use(pinia);
app.use(router);
app.mount("#app");// 確保這裡的 '#app' 與你的 index.html 中的根容器 ID 匹配
