import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The prototype ships as one self-contained HTML file so it can be previewed anywhere.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
