// ============================================================
// stores/user.js —— Pinia 用户仓库（F1 登录态）
// 为什么放 Pinia：导航守卫、顶部导航、个人中心都要读"当前是谁"，
// 数据放仓库一处维护、处处同步；
// persist: true 让登录态写进 localStorage——刷新页面不掉线（守卫据此放行）。
// ============================================================
import { defineStore } from 'pinia'
import { getUserByUsername } from '../api/users'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    username: '',
    name: '',
    role: '',        // 'admin' = 图书管理员 / 'reader' = 读者
    status: ''       // 'active' 正常 / 'frozen' 冻结（冻结账号能登录但不能借书）
  }),
  getters: {
    isLogin: (state) => state.id !== '',
    isAdmin: (state) => state.role === 'admin'
  },
  actions: {
    // 登录：按用户名查人 → 比对密码（见 api/users.js 注释：password 不能作为查询条件）
    async login(username, password) {
      const users = await getUserByUsername(username)
      if (users.length === 0 || users[0].password !== password) {
        return false      // 用户名不存在或密码不对
      }
      this.id = users[0].id
      this.username = users[0].username
      this.name = users[0].name
      this.role = users[0].role
      this.status = users[0].status || 'active'
      return true
    },
    // 退出：仓库清回出厂设置（persist 插件会同步清掉 localStorage）
    logout() {
      this.$reset()
    }
  },
  persist: true
})
