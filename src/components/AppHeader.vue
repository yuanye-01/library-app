<!-- ============================================================
  AppHeader.vue —— 全站顶部导航（通用组件层）
  菜单按角色出：管理员看到"图书管理 / 统计面板"，读者看到"我的借阅"；
  退出按钮调 Pinia 的 logout 清登录态，守卫自然把人拦回 /login。
============================================================ -->
<template>
  <header class="app-header">
    <div class="brand" @click="$router.push('/books')">📚 图书借阅管理系统</div>
    <el-menu mode="horizontal" :default-active="activePath" router :ellipsis="false" class="menu">
      <el-menu-item index="/books">图书列表</el-menu-item>
      <template v-if="user.isAdmin">
        <el-menu-item index="/admin/books">图书管理</el-menu-item>
        <el-menu-item index="/admin/stats">统计面板</el-menu-item>
      </template>
      <el-menu-item v-else index="/center/borrowed">我的借阅</el-menu-item>
    </el-menu>
    <div class="user-box">
      <span class="user-name" @click="$router.push('/center/profile')">
        {{ user.name }}（{{ user.isAdmin ? '管理员' : '读者' }}）
      </span>
      <el-button size="small" @click="logout">退出登录</el-button>
    </div>
  </header>
</template>

<script>
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

export default {
  name: 'AppHeader',
  data() {
    return { user: useUserStore() }
  },
  computed: {
    // 详情页 /book/:id 时也让"图书列表"保持高亮
    activePath() {
      if (this.$route.path.startsWith('/book/')) return '/books'
      if (this.$route.path.startsWith('/center/')) return '/center/borrowed'
      return this.$route.path
    }
  },
  methods: {
    logout() {
      this.user.logout()
      ElMessage.success('已退出登录')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 24px;
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.brand { font-size: 17px; font-weight: bold; cursor: pointer; white-space: nowrap; color: #1a5276; }
.menu { flex: 1; border-bottom: none; }
.user-box { display: flex; align-items: center; gap: 10px; white-space: nowrap; }
.user-name { cursor: pointer; color: #409eff; }
</style>
