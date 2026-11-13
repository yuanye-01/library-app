// ============================================================
// api/users.js —— 用户接口（F1 登录）
// 坑：json-server v1 beta 出于安全禁止按 password 字段过滤
// （?password=xxx 永远查不到东西），所以登录分两步：
// ① 按用户名把人查出来（username 可过滤）；
// ② 密码在前端和查到的记录比对（见 stores/user.js）。
// ============================================================
import { db } from './db'

// 按用户名查用户：返回数组，长度 0 说明用户名不存在
export function getUserByUsername(username) {
  return db.getUserByUsername(username)
}

// 全体用户（统计面板用）
export function fetchUsers() {
  return db.getUsers()
}
