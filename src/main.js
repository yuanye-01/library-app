// ============================================================
// main.js —— 应用入口（插件总线）
// 与 ch06 实验不同：这里 Element Plus / Vant 一行都不 import——
// 按需引入由 vite.config.js 的 Components 插件在编译期自动完成。
// main.js 只负责装"全局唯一"的两样东西：Pinia（带持久化）和路由。
// ============================================================
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// Pinia：集中式状态管理；persist 插件把标记了 persist 的仓库存进 localStorage
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)
app.mount('#app')
