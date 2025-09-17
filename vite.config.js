import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public', // 👈 tells Vite to use public as the entry (where index.html is)
  build: {
    outDir: '../dist', // 👈 puts final build outside public into /dist
    emptyOutDir: true,
  },
});
