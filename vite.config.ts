import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import tailwindcss from '@tailwindcss/vite'

const vueAmapResolver = (componentName: string) => {
  if (componentName.startsWith('ElAmap')) {
    return {
      name: componentName,
      from: '@vuemap/vue-amap',
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    
    vue(),
    vueDevTools(),

     AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [vueAmapResolver, ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
