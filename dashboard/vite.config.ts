import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    {
      name: 'app-title-transform',
      transformIndexHtml(html) {
        return html.replace(/<title>.*?<\/title>/i, '<title>AI News Traker Agent</title>');
      },
    },
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-router-dom')) return 'react';
          if (id.includes('@tanstack/react-query')) return 'query';
          if (id.includes('@hello-pangea/dnd')) return 'dnd';
          if (id.includes('lucide-react') || id.includes('recharts')) return 'ui';
          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
