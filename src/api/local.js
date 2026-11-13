// ============================================================
// api/local.js —— localStorage 版"迷你 json-server"（线上模式）
// 背景：期末要求部署到 GitHub Pages——静态托管跑不了 json-server。
// 方案：页面不是从 localhost 打开时（= 部署环境），接口层整体切换到
// 本模块：同一套函数签名，数据落在 localStorage，刷新/二次访问不丢，
// 线上演示效果与开发版完全一致（见 api/db.js 的开关逻辑）。
// 种子数据与 db.json 保持一致（改一处记得同步另一处）。
// ============================================================
const KEY = 'library-app-db-v1'

const SEED = {
  users: [
    { id: 'u1', username: 'admin', password: '123456', name: '张管理员', role: 'admin' },
    { id: 'u2', username: 'reader', password: '123456', name: '李读者', role: 'reader' }
  ],
  books: [
    { id: 'b1', name: 'Vue.js前端开发实战（第2版）', author: '黑马程序员', category: '前端开发', stock: 4, publisher: '人民邮电出版社', description: '以实战为导向讲解 Vue 3 组件、路由、状态管理与项目开发流程，配套课程实验教材。' },
    { id: 'b2', name: 'JavaScript高级程序设计（第4版）', author: '马特·弗里斯比', category: '编程语言', stock: 3, publisher: '人民邮电出版社', description: '红宝书新版，系统覆盖 ECMAScript 标准与浏览器环境下的 JavaScript 核心机制。' },
    { id: 'b3', name: 'CSS新世界', author: '张鑫旭', category: '前端开发', stock: 5, publisher: '人民邮电出版社', description: '围绕布局、视觉与动效深入讲解现代 CSS 特性，大量案例可即学即用。' },
    { id: 'b4', name: '深入浅出MySQL：数据库开发、优化与管理维护', author: '翟振兴', category: '数据库', stock: 6, publisher: '人民邮电出版社', description: '从 SQL 基础到调优运维，结合实战案例讲解 MySQL 数据库的完整知识体系。' },
    { id: 'b5', name: 'TCP/IP详解 卷1：协议', author: '凯文·R·法尔', category: '计算机网络', stock: 2, publisher: '机械工业出版社', description: '逐层拆解 TCP/IP 协议栈的工作原理，网络方向的经典参考书。' },
    { id: 'b6', name: '机器学习', author: '周志华', category: '人工智能', stock: 7, publisher: '清华大学出版社', description: '西瓜书，国内机器学习入门权威教材，覆盖主流学习范式与理论基础。' },
    { id: 'b7', name: 'Python编程：从入门到实践', author: '埃里克·马瑟斯', category: '编程语言', stock: 5, publisher: '人民邮电出版社', description: '零基础友好的 Python 教程，语法部分之后附三个完整项目实战。' },
    { id: 'b8', name: '软件工程：实践者的研究方法', author: '罗杰·S·普莱斯曼', category: '软件工程', stock: 3, publisher: '机械工业出版社', description: '从需求到维护全生命周期的软件工程方法，工程化思维必读。' },
    { id: 'b9', name: '数据结构与算法分析：C语言描述', author: '马克·艾伦·维斯', category: '数据结构与算法', stock: 4, publisher: '机械工业出版社', description: '以 C 语言实现经典数据结构与算法，注重复杂度分析的严谨性。' },
    { id: 'b10', name: '大话设计模式', author: '程杰', category: '软件工程', stock: 2, publisher: '清华大学出版社', description: '用对话体和小故事讲解 23 种设计模式，入门友好。' }
  ],
  borrowRecords: [
    { id: 'r1', bookId: 'b6', userId: 'u2', borrowDate: '2026-10-10', dueDate: '2026-11-01', status: 'borrowed' },
    { id: 'r2', bookId: 'b1', userId: 'u2', borrowDate: '2026-11-05', dueDate: '2026-12-05', status: 'borrowed' },
    { id: 'r3', bookId: 'b2', userId: 'u2', borrowDate: '2026-09-01', dueDate: '2026-10-01', status: 'returned' }
  ]
}

// 读库：第一次访问时把种子数据写进 localStorage，之后读真实状态
function load() {
  const raw = localStorage.getItem(KEY)
  if (raw) return JSON.parse(raw)
  const fresh = JSON.parse(JSON.stringify(SEED))
  localStorage.setItem(KEY, JSON.stringify(fresh))
  return fresh
}
function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db))
}
// 简易 ID 生成器（对齐 json-server 的自增/随机 id 语义）
const rid = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const local = {
  async getBooks() {
    return load().books
  },
  async getBook(id) {
    return load().books.find((b) => b.id === id) || null
  },
  async createBook(data) {
    const db = load()
    const book = { ...data, id: rid('b') }
    db.books.push(book)
    save(db)
    return book
  },
  async updateBook(id, data) {
    const db = load()
    const i = db.books.findIndex((b) => b.id === id)
    if (i === -1) return null
    db.books[i] = { ...data, id }
    save(db)
    return db.books[i]
  },
  async deleteBook(id) {
    const db = load()
    db.books = db.books.filter((b) => b.id !== id)
    save(db)
    return {}
  },
  async getUserByUsername(username) {
    return load().users.filter((u) => u.username === username)
  },
  async getUsers() {
    return load().users
  },
  async getBorrows() {
    return load().borrowRecords
  },
  async getBorrowsByUser(userId) {
    return load().borrowRecords.filter((r) => r.userId === userId)
  },
  async createBorrow(data) {
    const db = load()
    const rec = { ...data, id: rid('r') }
    db.borrowRecords.push(rec)
    save(db)
    return rec
  },
  async updateBorrow(id, data) {
    const db = load()
    const i = db.borrowRecords.findIndex((r) => r.id === id)
    if (i === -1) return null
    db.borrowRecords[i] = { ...data, id }
    save(db)
    return db.borrowRecords[i]
  }
}
