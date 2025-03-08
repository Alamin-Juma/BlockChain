import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    nodePolyfills({
      // Specify which polyfills to include
      include: ['buffer', 'crypto', 'stream', 'assert'],
    }),
  ],
  resolve: {
    alias: {
      // Map Node.js modules to their browser equivalents
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
});