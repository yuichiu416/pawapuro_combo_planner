import path from "path";
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			// Enables global test APIs like 'describe', 'it', 'expect'
			globals: true,
			// Essential for React Testing Library
			environment: "jsdom",
			// The setup file we discussed previously
			setupFiles: ["./src/setupTests.ts"],
			include: ["src/**/*.{test,spec}.{ts,tsx}"],
			testTimeout: 15000, // Sets global timeout to 15s
			hookTimeout: 15000,
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	}),
);
