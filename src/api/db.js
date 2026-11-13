// ============================================================
// api/db.js —— 数据访问"双模式开关"（设计核心）
// 页面从 localhost 打开（npm run dev / preview）→ 走 json-server；
// 页面从线上域名打开（GitHub Pages）→ 自动切到 local（localStorage）。
// 两套实现函数签名完全一致，上层 books.js / borrow.js / users.js
// 完全不用关心自己跑在哪个环境——"一处开关，全局切换"。
// ============================================================
import request from './request'
import { local } from './local'

// 部署环境判定：origin 不是 localhost / 127.0.0.1 就视为线上
const isDevOrigin = /^(?:http|https):\/\/(?:localhost|127\.0\.0\.1)/i.test(location.origin)

const remote = {
  getBooks: () => request.get('/books'),
  getBook: (id) => request.get('/books/' + id),
  createBook: (data) => request.post('/books', data),
  updateBook: (id, data) => request.put('/books/' + id, data),
  deleteBook: (id) => request.delete('/books/' + id),
  getUserByUsername: (username) => request.get('/users', { params: { username } }),
  getUsers: () => request.get('/users'),
  getReaders: () => request.get('/users', { params: { role: 'reader' } }),
  createReader: (data) => request.post('/users', data),
  updateReader: (id, data) => request.put('/users/' + id, data),
  deleteReader: (id) => request.delete('/users/' + id),
  getBorrows: () => request.get('/borrowRecords'),
  getBorrowsByUser: (userId) => request.get('/borrowRecords', { params: { userId } }),
  createBorrow: (data) => request.post('/borrowRecords', data),
  updateBorrow: (id, data) => request.put('/borrowRecords/' + id, data)
}

export const db = isDevOrigin ? remote : local
