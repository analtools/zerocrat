import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["json", "html", "lcov", "json-summary"],
      exclude: ["coverage"],
    },
    passWithNoTests: true,
    watch: false,
    testTimeout: 500000,
    include: ["packages/**/*.test.ts"],
    exclude: [
      "package.json",
      "**/package.json",
      "dist/**/*",
      "**/dist/**/*",
      "node_modules/**/*",
      "**/node_modules/**/*",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
