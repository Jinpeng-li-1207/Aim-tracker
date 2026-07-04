/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "path";

// https://vite.dev/config/
// GitHub Pages 项目站点在 /Aim-tracker/ 子路径，构建时用该 base；本地 dev 仍用 /
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Aim-tracker/" : "/",
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Aim Tracker",
        short_name: "AimTracker",
        description: "Valorant 靶场瞄准训练记录",
        lang: "zh-CN",
        theme_color: "#0e1419",
        background_color: "#0e1419",
        display: "standalone",
        icons: [
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
}));
