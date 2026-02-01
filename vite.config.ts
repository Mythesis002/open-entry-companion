import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom resolver plugin for @ alias
function aliasResolverPlugin() {
  return {
    name: "alias-resolver",
    resolveId(id) {
      if (id.startsWith("@/")) {
        return path.resolve(__dirname, id.replace("@/", "src/"));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        allow: [__dirname],
      },
    },
    plugins: [
      aliasResolverPlugin(),
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
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
