// ============================================================
// vite.config.js —— 构建与插件配置
// Components 插件 + 两个 Resolver（Element Plus / Vant）：
// 编译每个 .vue 时扫描模板，见到 el-xxx / van-xxx 就只把
// 这一个组件的代码和样式真正 import 进来——"按需引入"，
// main.js 因此不再需要全量 import 组件库，首屏体积更小。
// ⚠️ 改完本文件必须重启 dev 服务器才生效！
// ============================================================
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver, VantResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver(), VantResolver()]
    })
  ]
})
