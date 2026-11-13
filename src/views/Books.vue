<!-- ============================================================
  Books.vue —— F2 图书列表（Table + 搜索 + 分类筛选）
  检索全部客户端完成：books 整表拉回来，keyword / category
  两个筛选条件进 computed（教材 4.x 响应式计算的典型用法），
  输入一变表格立即重算，不发多余请求。
  行点击进详情（F3 动态路由）；星标列是 O8 收藏。
============================================================ -->
<template>
  <div class="page">
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索书名 / 作者" clearable :prefix-icon="Search" class="search-input" />
        <el-select v-model="category" placeholder="全部分类" clearable class="cat-select">
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <div class="toolbar-btns">
          <el-button v-if="user.isAdmin" type="primary" plain @click="$router.push('/admin/books')">管理藏书</el-button>
          <el-button plain @click="$router.push('/m/books')">移动端视图</el-button>
        </div>
      </div>

      <el-table :data="filtered" border class="book-table" @row-click="goDetail">
        <el-table-column label="封面" width="70">
          <template #default="{ row }">
            <BookCover :name="row.name" :category="row.category" :author="row.author" :size="34" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="书名" min-width="230" />
        <el-table-column prop="author" label="作者" width="140" />
        <el-table-column label="分类" width="130">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="出版社" width="150" />
        <el-table-column label="库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.stock > 0 ? 'success' : 'danger'">
              {{ row.stock > 0 ? '可借 ' + row.stock : '无货' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收藏" width="70">
          <template #default="{ row }">
            <el-button
              size="small"
              circle
              :type="fav.has(row.id) ? 'warning' : 'default'"
              :icon="fav.has(row.id) ? StarFilled : Star"
              @click.stop="fav.toggle(row.id)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button size="small" @click.stop="goDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <p class="muted result-line">
        共 {{ filtered.length }} 种图书（computed：关键词 + 分类双重过滤，无额外请求）
      </p>
    </el-card>
  </div>
</template>

<script>
import { Search, Star, StarFilled } from '@element-plus/icons-vue'
import { fetchBooks } from '../api/books'
import { useUserStore } from '../stores/user'
import { useFavoritesStore } from '../stores/favorites'
import BookCover from '../components/BookCover.vue'

export default {
  name: 'BooksView',
  components: { BookCover },
  data() {
    return {
      user: useUserStore(),
      fav: useFavoritesStore(),
      books: [],
      keyword: '',
      category: '',
      Search, Star, StarFilled
    }
  },
  computed: {
    // 关键词（书名/作者模糊）× 分类（全等）双重过滤 —— 依赖变了自动重算
    filtered() {
      const kw = this.keyword.trim().toLowerCase()
      return this.books.filter(
        (b) =>
          (!kw || b.name.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw)) &&
          (!this.category || b.category === this.category)
      )
    },
    categories() {
      return [...new Set(this.books.map((b) => b.category))].sort()
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      try {
        this.books = await fetchBooks()      // 失败提示由 axios 拦截器统一弹出，表格留空不崩
      } catch (e) { /* 已由拦截器提示 */ }
    },
    goDetail(row) {
      this.$router.push('/book/' + row.id)
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
.search-input { width: 260px; }
.cat-select { width: 160px; }
.toolbar-btns { margin-left: auto; }
.book-table :deep(tbody tr) { cursor: pointer; }
.result-line { margin: 12px 0 0; text-align: right; }
</style>
