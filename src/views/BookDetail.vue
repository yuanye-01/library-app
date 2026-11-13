<!-- ============================================================
  BookDetail.vue —— F3 图书详情（动态路由 /book/:id）
  watch $route.params.id：同组件复用时（点列表不同行）也会重新拉数据。
  借书（F4）：canBorrow computed 汇总"库存>0 / 本人未在借 / 是读者"三个条件，
  按钮自动出现 禁用 / 变文案 —— 状态计算与视图渲染彻底解耦。
============================================================ -->
<template>
  <div class="page">
    <el-page-header content="图书详情" class="detail-header" @back="$router.back()" />

    <el-card v-if="book" class="detail-card">
      <div class="detail-top">
        <BookCover :name="book.name" :category="book.category" :size="120" />
        <div class="detail-info">
          <h2 class="book-name">{{ book.name }}</h2>
          <el-descriptions :column="1" border size="small" class="desc-table">
            <el-descriptions-item label="作者">{{ book.author }}</el-descriptions-item>
            <el-descriptions-item label="分类">
              <el-tag>{{ book.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="出版社">{{ book.publisher }}</el-descriptions-item>
            <el-descriptions-item label="当前库存">{{ book.stock }} 本</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <el-divider />
      <h3 class="section-title">内容简介</h3>
      <p class="desc-text">{{ book.description }}</p>

      <div class="actions">
        <el-button :type="fav.has(book.id) ? 'warning' : 'default'" @click="fav.toggle(book.id)">
          {{ fav.has(book.id) ? '已收藏' : '收藏' }}
        </el-button>
        <el-tag v-if="user.isAdmin" type="info" class="admin-tag">管理员账号仅维护台账，不参与借阅</el-tag>
        <el-button
          v-else
          :type="canBorrow ? 'primary' : 'info'"
          :disabled="!canBorrow || borrowing"
          :loading="borrowing"
          @click="borrow"
        >
          {{ borrowLabel }}
        </el-button>
      </div>
    </el-card>

    <el-card v-else-if="loaded">
      <el-empty description="没有找到这本书（可能已被下架删除）" />
    </el-card>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { fetchBook } from '../api/books'
import { borrowBook, fetchBorrowsByUser } from '../api/borrow'
import { useUserStore } from '../stores/user'
import { useFavoritesStore } from '../stores/favorites'
import BookCover from '../components/BookCover.vue'

export default {
  name: 'BookDetailView',
  components: { BookCover },
  data() {
    return {
      user: useUserStore(),
      fav: useFavoritesStore(),
      book: null,
      loaded: false,        // 区分"加载中"与"确实没有"
      myRecords: [],        // 本人当前借阅记录（判定重复借）
      borrowing: false
    }
  },
  computed: {
    alreadyBorrowed() {
      return this.myRecords.some((r) => r.bookId === this.book?.id && r.status === 'borrowed')
    },
    canBorrow() {
      return !!this.book && this.book.stock > 0 && !this.alreadyBorrowed
    },
    borrowLabel() {
      if (!this.book || this.book.stock <= 0) return '库存不足'
      if (this.alreadyBorrowed) return '已在借阅中'
      return '借阅（借期 30 天）'
    }
  },
  watch: {
    // 动态路由参数变化 → 重拉数据（列表点不同书复用本组件）
    '$route.params.id': {
      immediate: true,
      handler() {
        this.load()
      }
    }
  },
  methods: {
    async load() {
      this.loaded = false
      this.book = null
      try {
        this.book = await fetchBook(this.$route.params.id)
      } catch (e) {
        this.book = null        // 404（编号不存在）等异常 → 统一转空状态，不崩页
      }
      this.loaded = true
      if (!this.user.isAdmin) {
        this.myRecords = await fetchBorrowsByUser(this.user.id).catch(() => [])
      }
    },
    borrow() {
      ElMessageBox.confirm(
        `确认借阅《${this.book.name}》？借期 30 天，应还日期见"我的借阅"。`,
        '借书确认',
        { confirmButtonText: '确认借阅', cancelButtonText: '再想想', type: 'info' }
      ).then(async () => {
        this.borrowing = true
        try {
          await borrowBook(this.book, this.user)
          ElMessage.success('借阅成功，可在"个人中心-我的借阅"查看')
          await this.load()          // 刷新库存与在借状态
        } catch (err) {
          ElMessage.error(err.message || '借阅失败')
        } finally {
          this.borrowing = false
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.detail-header { margin-bottom: 14px; }
.detail-top { display: flex; gap: 24px; align-items: flex-start; }
.book-name { margin-bottom: 14px; }
.section-title { margin-bottom: 8px; color: #1a5276; }
.desc-text { color: #606266; line-height: 1.8; }
.actions { margin-top: 20px; display: flex; gap: 12px; align-items: center; }
.admin-tag { line-height: 30px; }
</style>
