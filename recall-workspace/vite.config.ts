import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  define: command === "build" ? { "process.env.NODE_ENV": '"production"', __VUE_OPTIONS_API__: "false", __VUE_PROD_DEVTOOLS__: "false" } : {},
  build: { outDir: "../frontend/recall-assets", emptyOutDir: true, lib: { entry: "src/main.ts", formats: ["es"], fileName: () => "workspace.js" }, cssCodeSplit: false, rollupOptions: { output: { assetFileNames: "[name].[ext]" } } },
}));
