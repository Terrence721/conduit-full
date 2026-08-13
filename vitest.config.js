import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// Split into projects so backend (plain Node) tests don't need jsdom or
// frontend/src/setupTests.js at all - only the frontend project needs
// either, and it only actually loads them once real frontend test files
// exist to run (Vitest skips a project's setupFiles when nothing matches
// its `include` glob).
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "backend",
          globals: true,
          environment: "node",
          include: ["backend/**/*.test.{js,ts}"],
        },
      },
      {
        plugins: [react()],
        test: {
          name: "frontend",
          globals: true,
          environment: "jsdom",
          css: true,
          setupFiles: "frontend/src/setupTests.js",
          include: ["frontend/**/*.test.{js,jsx}"],
        },
      },
    ],
  },
});
