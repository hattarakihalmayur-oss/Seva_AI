import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // ── Dev Server ──────────────────────────────────────────────────────────────
  server: {
    host: true,
    port: 3000,
    open: false,
    // Proxy API calls in dev to avoid CORS issues when running frontend only
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // ── Preview Server (after build) ────────────────────────────────────────────
  preview: {
    port: 3000,
  },

  // ── Build Optimizations ─────────────────────────────────────────────────────
  build: {
    // Target modern browsers for smaller, faster bundles
    target: 'es2020',
    // Source maps in production help debug without exposing raw source
    sourcemap: false,
    // Warn when individual chunks exceed this size
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting: vendor libraries separated from app code
        // Reduces re-download when only app code changes
        // Note: Vite 8 / rolldown requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },

  // ── Dependency optimization ──────────────────────────────────────────────────
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'lucide-react'],
  },
});
