<!-- ============================================================
  Stats.vue —— E7 简单统计面板
  三路数据并行拉取（图书 / 借阅记录 / 用户）→ computed 汇总：
  ① 四张卡片：藏书品种、馆藏总量、在借人次、注册读者；
  ② 分类明细表：品种数 / 库存量 / 在借量 / 库存占比进度条。
  在借量按"记录.bookId → 图书.category"归组到分类下。
============================================================ -->
<template>
  <div class="page">
    <el-row :gutter="16" class="stat-cards">
      <el-col :span="6">
        <el-card shadow="never"><p class="stat-num">{{ books.length }}</p><p class="stat-label">藏书品种</p></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><p class="stat-num">{{ totalStock }}</p><p class="stat-label">馆藏总量（本）</p></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><p class="stat-num">{{ borrowedCount }}</p><p class="stat-label">当前在借（人次）</p></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never"><p class="stat-num">{{ readers.length }}</p><p class="stat-label">注册读者</p></el-card>
      </el-col>
    </el-row>

    <el-card>
      <h3 class="table-title">各类别藏书统计</h3>
      <el-table :data="byCategory" border>
        <el-table-column prop="category" label="分类" min-width="130">
          <template #default="{ row }"><el-tag>{{ row.category }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="titles" label="品种数" width="90" />
        <el-table-column prop="stock" label="库存量（本）" width="110" />
        <el-table-column prop="borrowed" label="在借量（本）" width="110" />
        <el-table-column label="库存占比" min-width="220">
          <template #default="{ row }">
            <el-progress :percentage="row.percent" :stroke-width="14" :color="row.percent < 15 ? '#f56c6c' : '#409eff'" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { fetchBooks } from '../../api/books'
import { fetchBorrows } from '../../api/borrow'
import { fetchUsers } from '../../api/users'

export default {
  name: 'StatsView',
  data() {
    return {
      books: [],
      borrows: [],
      readers: []
    }
  },
  computed: {
    totalStock() {
      return this.books.reduce((sum, b) => sum + b.stock, 0)
    },
    borrowedCount() {
      return this.borrows.filter((r) => r.status === 'borrowed').length
    },
    // 分类维度聚合：品种数、库存量、在借量、库存占比
    byCategory() {
      const map = new Map()
      for (const b of this.books) {
        if (!map.has(b.category)) map.set(b.category, { category: b.category, titles: 0, stock: 0, borrowed: 0 })
        const row = map.get(b.category)
        row.titles += 1
        row.stock += b.stock
      }
      for (const r of this.borrows) {
        if (r.status !== 'borrowed') continue
        const book = this.books.find((b) => b.id === r.bookId)
        if (book && map.has(book.category)) map.get(book.category).borrowed += 1
      }
      const total = this.totalStock || 1
      return [...map.values()].map((row) => ({ ...row, percent: Math.round((row.stock / total) * 100) }))
    }
  },
  mounted() {
    Promise.all([fetchBooks(), fetchBorrows(), fetchUsers()])
      .then(([books, borrows, users]) => {
        this.books = books
        this.borrows = borrows
        this.readers = users
      })
      .catch(() => {})
  }
}
</script>

<style scoped>
.stat-cards { margin-bottom: 16px; }
.stat-num { font-size: 30px; font-weight: bold; color: #1a5276; text-align: center; }
.stat-label { text-align: center; color: #909399; margin-top: 4px; }
.table-title { margin-bottom: 12px; color: #1a5276; }
</style>
