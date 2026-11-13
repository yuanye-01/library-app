// ============================================================
// api/books.js —— 图书接口（F2 / F3）
// 列表检索在客户端用 computed 过滤（关键词 + 分类），
// 所以这里只提供整表 CRUD，不做服务端模糊查询。
// ============================================================
import { db } from './db'

export const fetchBooks = () => db.getBooks()
export const fetchBook = (id) => db.getBook(id)

// 新增（无 id）或更新（有 id）二合一
export function saveBook(book) {
  return book.id ? db.updateBook(book.id, book) : db.createBook(book)
}

export const removeBook = (id) => db.deleteBook(id)
