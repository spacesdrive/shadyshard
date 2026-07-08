import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (/react-router/.test(id)) return "vendor-router"
          if (/\/(react|react-dom|scheduler)\//.test(id)) return "vendor-react"
          if (/framer-motion/.test(id)) return "vendor-motion"
          if (/@base-ui|cmdk|lucide-react/.test(id)) return "vendor-ui"
          if (/fuse\.js/.test(id)) return "vendor-search"
        },
      },
    },
  },
})
