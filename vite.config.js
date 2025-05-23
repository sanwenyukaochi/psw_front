import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';  // 确保导入 path

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // 让 @ 代表 src 目录
    }
  },
  server:{
    allowedHosts: [
      'p.sanwenyukaochi.cloudns.org', // Add this host to allowed hosts
      'localhost', // You can also keep localhost or any other allowed host
      'closely-quiet-lamb.ngrok-free.app'
    ],
    host: '::',
    port: 5173,
    proxy:{
      '/api':{//获取路径中包含了/api的请求
        target:'http://192.168.196.13:8088',//后台服务所在的源
        changeOrigin:true,//修改源
        rewrite:(path)=>path.replace(/^\/api/,'')///api替换为''
      }
    }
  }
})
