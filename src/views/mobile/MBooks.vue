<!-- ============================================================
  MBooks.vue —— 移动端读者页①：图书检索（Vant）
  van-search（关键词）+ van-dropdown-menu（分类）→ computed 过滤，
  结果用 van-card 逐本渲染；点卡片进移动端详情页。
  Vant 组件经 vite 按需引入自动注册，模板里直接写 van-xxx。
============================================================ -->
<template>
  <div class="m-page">
    <van-nav-bar title="图书检索" />
    <van-search v-model="keyword" placeholder="搜索书名 / 作者" shape="round" background="#ffffff" />
    <van-dropdown-menu>
      <van-dropdown-item v-model="category" :options="categoryOptions" />
    </van-dropdown-menu>

    <div class="book-list">
      <div v-for="row in filtered" :key="row.id" class="card-wrap" @click="goDetail(row)">
        <van-card>
          <template #thumb>
            <BookCover :name="row.name" :category="row.category" :size="56" />
          </template>
          <template #title>
            <span class="b-name">{{ row.name }}</span>
          </template>
          <template #desc>
            {{ row.author }} · {{ row.publisher }}
          </template>
          <template #price>
            <span class="b-cat">{{ row.category }}</span>
          </template>
          <template #num>
            库存 {{ row.stock }}
          </template>
        </van-card>
      </div>
      <van-empty v-if="loaded && !filtered.length" description="没有匹配的图书" />
      <van-skeleton v-if="!loaded" title :row="3" class="skeleton" />
    </div>
  </div>
</template>

<script>
import { fetchBooks } from '../../api/books'
import BookCover from '../../components/BookCover.vue'

export default {
  name: 'MBooksView',
  components: { BookCover },
  data() {
    return {
      books: [],
      keyword: '',
      category: '',
      loaded: false
    }
  },
  computed: {
    filtered() {
      const kw = this.keyword.trim().toLowerCase()
      return this.books.filter(
        (b) =>
          (!kw || b.name.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw)) &&
          (!this.category || b.category === this.category)
      )
    },
    categoryOptions() {
      return [
        { text: '全部分类', value: '' },
        ...[...new Set(this.books.map((b) => b.category))].sort().map((c) => ({ text: c, value: c }))
      ]
    }
  },
  mounted() {
    fetchBooks()
      .then((books) => { this.books = books })
      .catch(() => {})
      .finally(() => { this.loaded = true })
  },
  methods: {
    goDetail(row) {
      this.$router.push('/m/book/' + row.id)
    }
  }
}
</script>

<style scoped>
.m-page { background: #f7f8fa; min-height: 100vh; }
.book-list { padding: 10px 0 20px; }
.card-wrap { margin: 10px 8px; border-radius: 8px; overflow: hidden; background: #fff; }
.card-wrap :deep(.van-card) { background: #fff; padding: 10px; }
.b-name { font-size: 14px; font-weight: bold; color: #323233; }
.b-cat { color: #1989fa; font-size: 12px; font-weight: bold; }
.skeleton { padding: 16px; }
</style>
