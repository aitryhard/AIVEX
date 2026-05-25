import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'strip-console',
      transform(code, id) {
        if (id.includes('node_modules')) return;
        if (id.endsWith('.js') || id.endsWith('.jsx')) {
          return code.replace(/\bconsole\.(log|debug|trace)\([^)]*\)\s*;?/g, '');
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          markdown: ['react-markdown', 'react-syntax-highlighter', 'remark-gfm', 'rehype-raw'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
})