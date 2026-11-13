// ============================================================
// api/borrow.js —— 借还业务（F4 核心动线）
// 借书 = 两条写操作原子化串联：① POST 借阅记录（30 天借期）
//                            ② PUT 图书库存 -1
// 还书 = ① PUT 借阅记录置 returned（补 returnDate）
//        ② PUT 图书库存 +1
// 业务前置校验（库存>0、同一本书不重复借）也收敛在这里，
// 页面只管调函数、收结果、刷视图——逻辑不散落在组件里。
// ============================================================
import { db } from './db'

// 今天的日期（YYYY-MM-DD，与 db.json 存储格式一致）
function today() {
  return new Date().toISOString().slice(0, 10)
}
// 日期加 n 天
function plusDays(dateStr, n) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// E6 超期判定：在借 && 应还日期早于今天 —— 供"我的借阅"标红复用
export function isOverdue(record) {
  return record.status === 'borrowed' && record.dueDate < today()
}

export const fetchBorrows = () => db.getBorrows()
export const fetchBorrowsByUser = (userId) => db.getBorrowsByUser(userId)

// 借书：校验 → 建记录 → 减库存
export async function borrowBook(book, user) {
  if (book.stock <= 0) {
    throw new Error('库存不足，这本书暂时借不了')
  }
  const mine = await db.getBorrowsByUser(user.id)
  if (mine.some((r) => r.bookId === book.id && r.status === 'borrowed')) {
    throw new Error('同一本书在借期间不能重复借阅')
  }
  const borrowDate = today()
  const record = await db.createBorrow({
    bookId: book.id,
    userId: user.id,
    borrowDate,
    dueDate: plusDays(borrowDate, 30),   // 借期 30 天
    status: 'borrowed'
  })
  await db.updateBook(book.id, { ...book, stock: book.stock - 1 })
  return record
}

// 还书：记录置 returned → 加库存（book 可能已下架，容忍为 null）
export async function returnBook(record, book) {
  await db.updateBorrow(record.id, {
    ...record,
    status: 'returned',
    returnDate: today()
  })
  if (book) {
    await db.updateBook(book.id, { ...book, stock: book.stock + 1 })
  }
}
