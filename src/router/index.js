// ============================================================
// router/index.js —— 路由表 + 全局前置守卫（F1 权限控制）
// ① 懒加载：所有页面都写成 () => import('...')——打包时每个页面
//    自动单独成一个 js 文件，访问到才下载（build 分包优化的依据）；
// ② 嵌套路由：/center 下挂 borrowed（我的借阅）、profile（资料）两个子页；
// ③ 守卫：beforeEach 每次导航前查 Pinia 登录态——
//    未登录访问受保护页 → 拦下转 /login；非管理员访问 /admin → 弹回 /books。
// ============================================================
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  { path: '/', redirect: '/books' },
  { path: '/login', component: () => import('../views/Login.vue'), meta: { title: '登录' } },

  // ---------- 读者与管理员共用区域（需登录） ----------
  { path: '/books', component: () => import('../views/Books.vue'), meta: { requiresAuth: true, title: '图书列表' } },
  { path: '/book/:id', component: () => import('../views/BookDetail.vue'), meta: { requiresAuth: true, title: '图书详情' } },

  // ---------- 个人中心（嵌套路由演示） ----------
  {
    path: '/center',
    component: () => import('../views/Center.vue'),
    meta: { requiresAuth: true, title: '个人中心' },
    children: [
      { path: '', redirect: '/center/borrowed' },
      { path: 'borrowed', component: () => import('../views/center/Borrowed.vue'), meta: { requiresAuth: true, title: '我的借阅' } },
      { path: 'profile', component: () => import('../views/center/Profile.vue'), meta: { requiresAuth: true, title: '个人资料' } }
    ]
  },

  // ---------- 管理员专属区域 ----------
  { path: '/admin/books', component: () => import('../views/admin/BookManage.vue'), meta: { requiresAuth: true, requiresAdmin: true, title: '图书管理' } },
  { path: '/admin/stats', component: () => import('../views/admin/Stats.vue'), meta: { requiresAuth: true, requiresAdmin: true, title: '统计面板' } },

  // ---------- 移动端读者页（Vant，题目"移动端场景"） ----------
  { path: '/m', redirect: '/m/books' },
  { path: '/m/books', component: () => import('../views/mobile/MBooks.vue'), meta: { requiresAuth: true, title: '图书检索（移动端）' } },
  { path: '/m/book/:id', component: () => import('../views/mobile/MBookDetail.vue'), meta: { requiresAuth: true, title: '图书详情（移动端）' } }
]

const router = createRouter({
  // hash 模式：地址带 #，静态托管（GitHub Pages）无需服务器改写路由
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫：登录态与角色两级检查
router.beforeEach((to) => {
  const user = useUserStore()
  if (to.meta.requiresAuth && !user.isLogin) {
    return '/login'          // 未登录：一律先去登录页
  }
  if (to.meta.requiresAdmin && !user.isAdmin) {
    return '/books'          // 登录了但不是管理员：送回列表页
  }
})

export default router
