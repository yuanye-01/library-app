// ============================================================
// stores/user.js —— Pinia 用户仓库（F1 登录态）
// 为什么放 Pinia：导航守卫、顶部导航、个人中心都要读"当前是谁"，
// 数据放仓库一处维护、处处同步；
// persist: true 让登录态写进 localStorage——刷新页面不掉线（守卫据此放行）。
// ============================================================
import { defineStore } from 'pinia'
import { loginByUsername } from '../api/users'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    username: '',
    name: '',
    role: ''        // 'admin' = 图书管理员 / 'reader' = 读者
  }),
  getters: {
    isLogin: (state) => state.id !== '',
    isAdmin: (state) => state.role === 'admin'
  },
  actions: {
    // 登录：拿账号密码问服务器，对上就把人写进仓库
    async login(username, password) {
      const users = await loginByUsername(username, password)
      if (users.length === 0) {
        return false      // 对不上暗号
      }
      this.id = users[0].id
      this.username = users[0].username
      this.name = users[0].name
      this.role = users[0].role
      return true
    },
    // 退出：仓库清回出厂设置（persist 插件会同步清掉 localStorage）
    logout() {
      this.$reset()
    }
  },
  persist: true
})
