import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const resolve: any = {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs"],
  };

  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        allow: ["."],
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve,
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "sonner",
        "zod",
        "@supabase/supabase-js",
      ],
    },
  };
});
