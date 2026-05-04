import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tailwind from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const isDev = mode === "development";

  const BASE_PATH = isDev ? "/" : "/booking/";

  // ✅ Proxy configuration for local development only
  const proxyConfig = {
    // ---------------- EXISTING PROXIES (UNCHANGED) ----------------
    "/initiate-payment": {
      target: "http://localhost:5000",
      changeOrigin: true,
      secure: false,
    },

    "/booking/api_bck": {
      target: env.VITE_API_URL || "https://membership.xpresshotelpos.com/",
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/booking\/api_bck/, "/booking/api_bck"),
    },

    "/pg_demo": {
      target: "https://membership.xpresshotelpos.com/",
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/pg_demo/, "/pg_demo"),
    },

    
  };

  return defineConfig({
    plugins: [react(), basicSsl(), tailwind()],
    base: BASE_PATH,

    server: {
      host: true,
      https: true,
      port: 5173,
      strictPort: false,
      proxy: isDev ? proxyConfig : undefined,
    },

    build: {
      outDir: "dist",
      sourcemap: isDev,
    },

    define: {
      _API_BASE_: JSON.stringify(BASE_PATH),
      _BACKEND_URL_: JSON.stringify(env.VITE_API_URL || ""),
      _ENCODED_STRING_: JSON.stringify(env.VITE_ENCODED_STRING || ""),
    },
  });
};
