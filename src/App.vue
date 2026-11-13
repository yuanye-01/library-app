<!-- ============================================================
  App.vue —— 根组件
  结构很简单：可选的顶部导航（AppHeader）+ 路由出口（router-view）。
  登录页和移动端页面（/m/...）不需要 PC 端导航，用 computed 判断隐藏。
============================================================ -->
<template>
  <div id="app">
    <AppHeader v-if="showHeader" />
    <router-view />
  </div>
</template>

<script>
import AppHeader from './components/AppHeader.vue'

export default {
  name: 'App',
  components: { AppHeader },
  computed: {
    // 登录页不带导航；/m/ 开头的移动端页用 Vant 自带的页面结构，也不带 PC 导航
    showHeader() {
      const p = this.$route.path
      return p !== '/login' && !p.startsWith('/m/')
    }
  }
}
</script>
