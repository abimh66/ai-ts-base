import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  envDir: "../../",
  resolve: { tsconfigPaths: true },
  // pnpm hoists deps (e.g. the self-hosted DM Sans files) to the monorepo root.
  server: {
    fs: { allow: ["../.."] },
    // The API accepts exactly one browser origin (FRONTEND_ORIGIN). Vite would
    // otherwise move to the next free port and every request would fail CORS,
    // so fail loudly here instead: the fix is to stop whatever holds the port.
    strictPort: true,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
  ],
});

export default config;
