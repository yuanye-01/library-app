# library-app —— 图书借阅管理系统（WEB前端框架技术 期末大作业 · G1）

面向高校图书馆的借阅业务系统：读者在线检索与借阅，管理员维护藏书与借还台账。

**仓库地址**：https://github.com/yuanye-01/library-app
**线上部署**：https://yuanye-01.github.io/library-app/ （push 到 master 自动构建发布）

## 技术栈

Vue 3（选项式 API）+ Vite + Vue Router（动态 / 嵌套 / 守卫 / 懒加载）+ Element Plus（PC 端）+ Vant（移动端）+ Axios + Pinia + pinia-plugin-persistedstate + json-server。

## 启动（两个窗口）

```bash
# 窗口 1：起后端接口（3001 端口）
npm run server

# 窗口 2：起前端页面（5173 端口）
npm run dev
```

## 演示账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 图书管理员 | admin | 123456 | 图书 / 读者管理、统计面板 |
| 读者 | reader | 123456 | 在借 2 本（其中 1 本超期） |
| 读者 | wangxm | 123456 | 在借 1 本 |
| 读者（冻结） | zhaomin | 123456 | 可登录，借书会被冻结拦截 |

新读者可在登录页点「注册读者账号」自助注册（每人同时在借上限 5 本）。

## 功能

- F1 登录与权限守卫（两种角色 + redirect 回跳）
- F2 图书列表（搜索 / 分类筛选）；F3 详情（动态路由）；F4 借还书联动库存
- F5 我的借阅（超期标红）；E7 统计面板；O8 收藏 / 封面占位
- 扩展：读者自助注册、管理员读者管理（增删改 / 冻结 / 重置密码 / 查看借阅 / 删除保护）、借阅上限 5 本
- Vant 移动端读者页（检索 / 详情 / 借阅）
- 打包优化（懒加载 + 按需引入）+ GitHub Pages 自动部署

> AI生成
