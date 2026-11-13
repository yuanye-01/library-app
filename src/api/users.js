// ============================================================
// api/users.js —— 用户/读者接口（F1 登录 + 读者管理）
// 登录坑：json-server v1 beta 出于安全禁止按 password 字段过滤
// （?password=xxx 永远查不到东西），所以登录分两步：
// ① 按用户名把人查出来（username 可过滤）；
// ② 密码在前端和查到的记录比对（见 stores/user.js）。
// 读者管理：role 过滤可用（?role=reader 正常返回）。
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

// ---------- 读者管理（管理员端） ----------
// 读者列表：GET /users?role=reader
export function fetchReaders() {
  return db.getReaders()
}

// 新增读者：POST /users（补默认 role/status）
export function createReader(data) {
  return db.createReader({ ...data, role: 'reader', status: data.status || 'active' })
}

// 更新读者：PUT /users/:id（改名/冻结/解冻/重置密码都走这里）
export function updateReader(id, data) {
  return db.updateReader(id, data)
}

// 删除读者：DELETE /users/:id（页面层先做"在借未清"保护）
export function deleteReader(id) {
  return db.deleteReader(id)
}

// 读者自助注册：与新增读者同一接口，仅默认 reader 角色
export async function register(form) {
  const exists = await getUserByUsername(form.username)
  if (exists.length > 0) {
    throw new Error('用户名已被占用')
  }
  return createReader(form)
}
