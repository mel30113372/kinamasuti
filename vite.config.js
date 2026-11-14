import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// npm run build         → dist/        website folder (installable, works offline) — upload this to any web host
// npm run build:single  → dist-single/ one self-contained index.html (easy to email or preview)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: mode === 'single' ? { outDir: 'dist-single', copyPublicDir: false } : { outDir: 'dist' },
}));
