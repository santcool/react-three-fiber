import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const { NODE_ENV } = process.env

// 是否本地开发环境
const LOCAL_DEV = NODE_ENV !== 'production'
const PUBLIC_PATH = LOCAL_DEV ? '/' : '/speedcat-nft/'
export default defineConfig({
  base: PUBLIC_PATH,
  optimizeDeps: {
    exclude: ['@react-three/fiber'],
  },
  plugins: [react()],
})
