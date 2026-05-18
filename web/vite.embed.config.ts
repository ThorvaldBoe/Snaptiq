import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';

const webRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: webRoot,
  build: {
    outDir: 'dist-embed',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(webRoot, 'src/embed.ts'),
      name: 'SnaptiqWebBundle',
      formats: ['iife'],
      fileName: () => 'snaptiq-web.js',
      cssFileName: 'snaptiq-web'
    }
  }
});
