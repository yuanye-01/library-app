<!-- ============================================================
  Borrowed.vue —— F5 我的借阅 + E6 超期标红
  ① 只看自己的记录：fetchBorrowsByUser(user.id)；
  ② 行数据 join 书名（书可能已删，兜底"已下架"）；
  ③ E6：overdue = 在借 && dueDate < 今天（isOverdue 来自 api 层），
     行级 row-class-name 整行标红 + 状态列红 tag；
  ④ 还书（F4 后半）：returnBook 记录置 returned + 库存 +1。
============================================================ -->
<template>
  <div>
    <el-alert
      v-if="overdueCount > 0"
      type="error"
      :closable="false"
      show-icon
      :title="`您有 ${overdueCount} 本图书已超期未还，请尽快归还！`"
      class="overdue-alert"
    />

    <el-table :data="rows" border :row-class-name="rowClass">
      <el-table-column prop="bookName" label="书名" min-width="220" />
      <el-table-column prop="borrowDate" label="借出日期" width="110" />
      <el-table-column prop="dueDate" label="应还日期" width="110">
        <template #default="{ row }">
          <span :class="{ 'due-red': row.overdue }">{{ row.dueDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'returned' ? 'success' : row.overdue ? 'danger' : 'primary'">
            {{ row.status === 'returned' ? '已归还' : row.overdue ? '已超期' : '在借' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button v-if="row.status === 'borrowed'" size="small" type="warning" @click="giveBack(row)">
            还书
          </el-button>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>
    </el-table>

    <p class="muted summary">
      共 {{ rows.length }} 条：在借 {{ borrowingCount }} / 已还 {{ returnedCount }} / 超期 {{ overdueCount }}（超期行整行标红）
    </p>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { fetchBorrowsByUser, returnBook, isOverdue } from '../../api/borrow'
import { fetchBooks } from '../../api/books'
import { useUserStore } from '../../stores/user'

export default {
  name: 'BorrowedView',
  data() {
    return {
      user: useUserStore(),
      records: [],
      books: []
    }
  },
  computed: {
    // 记录 join 图书：补书名 + 超期标记，一次 computed 全算好
    rows() {
      return this.records.map((r) => {
        const book = this.books.find((b) => b.id === r.bookId)
        return { ...r, bookName: book ? book.name : '（已下架）', overdue: isOverdue(r) }
      })
    },
    borrowingCount() {
      return this.rows.filter((r) => r.status === 'borrowed').length
    },
    returnedCount() {
      return this.rows.filter((r) => r.status === 'returned').length
    },
    overdueCount() {
      return this.rows.filter((r) => r.overdue).length
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      try {
        // 我的记录与全表图书并行拉取
        const [records, books] = await Promise.all([
          fetchBorrowsByUser(this.user.id),
          fetchBooks()
        ])
        this.records = records
        this.books = books
      } catch (e) { /* 已由拦截器提示 */ }
    },
    rowClass({ row }) {
      return row.overdue ? 'overdue-row' : ''
    },
    giveBack(row) {
      ElMessageBox.confirm(`确认归还《${row.bookName}》？库存将自动加回。`, '还书确认', {
        confirmButtonText: '确认归还',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        await returnBook(row, this.books.find((b) => b.id === row.bookId))
        ElMessage.success('归还成功')
        await this.load()      // 重拉：记录变已还、书名库存已联动
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.overdue-alert { margin-bottom: 14px; }
.summary { margin-top: 12px; text-align: right; }
.due-red { color: #f56c6c; font-weight: bold; }
/* 超期整行标红（E6）：穿透 Element Plus 表格行背景 */
:deep(.overdue-row) {
  background: #fef0f0 !important;
}
:deep(.overdue-row td) {
  color: #c45656;
}
</style>
