import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    // Get repository name for GitHub Pages base path
    // Set VITE_BASE_PATH env var or it defaults to '/' for local dev
    const basePath = env.VITE_BASE_PATH || '/';

    return {
      // Base path for GitHub Pages deployment
      base: basePath,

      server: {
        port: 3000,
        host: '0.0.0.0',
      },

      plugins: [react()],

      // Build optimization for production
      build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
              'ai-vendor': ['@google/genai'],
            }
          }
        },
        // Increase chunk size warning limit for 3D assets
        chunkSizeWarningLimit: 1000,
      },

      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },

      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },

      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
      }
    };
});
