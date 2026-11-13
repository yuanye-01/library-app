<!-- ============================================================
  MBookDetail.vue —— 移动端读者页②：详情 + 借阅（Vant）
  与 PC 端复用同一套 api 层（borrowBook / fetchBorrowsByUser），
  只是外壳换成 Vant：van-nav-bar 返回、van-cell-group 展示字段、
  底部 van-button 借阅（确认用 van-dialog 组件，不用函数式 API）。
============================================================ -->
<template>
  <div class="m-page">
    <van-nav-bar title="图书详情" left-text="返回" left-arrow @click-left="$router.back()" />

    <div v-if="book" class="detail">
      <div class="d-top">
        <BookCover :name="book.name" :category="book.category" :author="book.author" :size="96" />
        <div class="d-info">
          <h2 class="d-name">{{ book.name }}</h2>
          <p class="d-line">{{ book.author }} · {{ book.publisher }}</p>
          <van-tag type="primary">{{ book.category }}</van-tag>
          <p class="d-line">当前库存：{{ book.stock }} 本</p>
        </div>
      </div>

      <van-cell-group inset title="内容简介">
        <van-cell :label="book.description" />
      </van-cell-group>

      <div class="action-bar">
        <van-button
          plain
          size="small"
          :type="fav.has(book.id) ? 'warning' : 'default'"
          class="fav-btn"
          @click="fav.toggle(book.id)"
        >
          {{ fav.has(book.id) ? '已收藏' : '收藏' }}
        </van-button>
        <van-tag v-if="user.isAdmin" type="warning" class="admin-tag">管理员账号不参与借阅</van-tag>
        <van-button
          v-else
          block
          round
          type="primary"
          :disabled="!canBorrow || borrowing"
          :loading="borrowing"
          class="borrow-btn"
          @click="showConfirm = true"
        >
          {{ borrowLabel }}
        </van-button>
      </div>

      <!-- 借书确认（组件式 van-dialog，不用函数式 API） -->
      <van-dialog
        v-model:show="showConfirm"
        title="确认借阅"
        :message="`《${book.name}》借期 30 天，到期 ${dueDate}`"
        show-cancel-button
        @confirm="borrow"
      />
      <van-dialog v-model:show="showOK" title="借阅成功" message="已登记借阅记录，请按时归还。" confirm-button-text="好的" />
      <van-dialog v-model:show="showError" title="借阅失败" :message="errorMsg" confirm-button-text="知道了" />
    </div>

    <van-empty v-else-if="loaded" description="没有找到这本书" />
  </div>
</template>

<script>
import { borrowBook, fetchBorrowsByUser } from '../../api/borrow'
import { fetchBook } from '../../api/books'
import { useUserStore } from '../../stores/user'
import { useFavoritesStore } from '../../stores/favorites'
import BookCover from '../../components/BookCover.vue'

export default {
  name: 'MBookDetailView',
  components: { BookCover },
  data() {
    return {
      user: useUserStore(),
      fav: useFavoritesStore(),
      book: null,
      loaded: false,
      myRecords: [],
      borrowing: false,
      showConfirm: false,
      showOK: false,
      showError: false,
      errorMsg: ''
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
      return '立即借阅'
    },
    // 确认框里展示的应还日期：今天 + 30 天
    dueDate() {
      if (!this.book) return ''
      const d = new Date()
      d.setDate(d.getDate() + 30)
      return d.toISOString().slice(0, 10)
    }
  },
  watch: {
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
      try {
        this.book = await fetchBook(this.$route.params.id)
      } catch (e) {
        this.book = null        // 404（编号不存在）→ 统一转空状态
      }
      this.loaded = true
      if (!this.user.isAdmin) {
        this.myRecords = await fetchBorrowsByUser(this.user.id).catch(() => [])
      }
    },
    async borrow() {
      this.borrowing = true
      try {
        await borrowBook(this.book, this.user)
        this.showOK = true
        await this.load()          // 库存 / 在借状态刷新
      } catch (e) {
        this.errorMsg = e.message || '借阅失败，请稍后重试'
        this.showError = true
      } finally {
        this.borrowing = false
      }
    }
  }
}
</script>

<style scoped>
.m-page { background: #f7f8fa; min-height: 100vh; padding-bottom: 24px; }
.d-top { display: flex; gap: 16px; padding: 16px; background: #fff; }
.d-name { font-size: 17px; margin-bottom: 6px; }
.d-line { color: #646566; font-size: 13px; margin: 6px 0; }
.action-bar { display: flex; gap: 10px; align-items: center; padding: 16px; }
.fav-btn { flex-shrink: 0; }
.borrow-btn { flex: 1; }
.admin-tag { margin: 0 auto; }
</style>
