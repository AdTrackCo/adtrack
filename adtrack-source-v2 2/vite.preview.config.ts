import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

// Builds a single self-contained HTML file that can be opened directly from
// disk (file://) with no server. Uses the hash router and mock auth so the
// whole app is explorable offline with sample data.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  define: {
    'import.meta.env.VITE_PREVIEW': JSON.stringify('true'),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(''),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
})
