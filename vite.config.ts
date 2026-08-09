import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // svelteTesting resolves the browser build of Svelte and registers the
  // Testing Library cleanup hook; without it components render server-side.
  plugins: [sveltekit(), svelteTesting()],
  server: {
    port: 5173
  },
  test: {
    name: 'unit',
    environment: 'jsdom',
    // Enabled so Testing Library registers its automatic cleanup hook.
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.{ts,svelte}'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90
      }
    }
  }
});
