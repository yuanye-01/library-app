// ============================================================
// api/users.js —— 用户接口（F1 登录）
// 登录本质：拿着用户名密码去服务器"对暗号"。
// json-server 用 GET /users?username=x&password=y 过滤，
// 返回数组长度为 1 就是对上了（长度 0 即账号或密码不对）。
// ============================================================
import request from './request'

export function loginByUsername(username, password) {
  return request.get('/users', {
    params: { username, password }
  })
}
