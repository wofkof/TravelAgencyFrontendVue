import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import mkcert from "vite-plugin-mkcert";

import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue(),
    mkcert(),

    Components({
      dirs: ["src/components"],
      extensions: ["vue"],
      deep: true,
      dts: "src/components.d.ts",
      resolvers: [ElementPlusResolver({ importStyle: "css" })],
    }),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts",
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    https: true,
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "https://localhost:7265",
        changeOrigin: true,
        secure: true,  // 允許代理到使用自簽章憑證的後端
        // rewrite: (path) => path.replace(/^\/api/, ""),
        rewrite: (path) => path,
      },
    },
  },
  css: {
    preprocessorOptions: {},
  },
});
