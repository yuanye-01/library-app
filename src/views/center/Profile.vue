<!-- ============================================================
  Profile.vue —— 个人资料 + O8 收藏列表
  登录信息直接读 Pinia（persist 后刷新不丢）；
  收藏 ids × books 全表 join 出收藏书单，可跳详情 / 取消收藏。
============================================================ -->
<template>
  <div class="profile">
    <el-descriptions title="登录信息" :column="1" border>
      <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
      <el-descriptions-item label="角色">
        <el-tag :type="user.isAdmin ? 'danger' : 'primary'">{{ user.isAdmin ? '图书管理员' : '读者' }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <h3 class="fav-title">我的收藏（{{ favBooks.length }}）</h3>
    <el-table v-if="favBooks.length" :data="favBooks" border>
      <el-table-column label="封面" width="70">
        <template #default="{ row }">
          <BookCover :name="row.name" :category="row.category" :author="row.author" :size="34" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="书名" min-width="220" />
      <el-table-column label="分类" width="130">
        <template #default="{ row }">
          <el-tag>{{ row.category }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170">
        <template #default="{ row }">
          <el-button size="small" @click="$router.push('/book/' + row.id)">详情</el-button>
          <el-button size="small" text type="danger" @click="fav.toggle(row.id)">取消收藏</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else description="还没有收藏图书，去列表页点亮星标吧" :image-size="80" />
  </div>
</template>

<script>
import { fetchBooks } from '../../api/books'
import { useUserStore } from '../../stores/user'
import { useFavoritesStore } from '../../stores/favorites'
import BookCover from '../../components/BookCover.vue'

export default {
  name: 'ProfileView',
  components: { BookCover },
  data() {
    return {
      user: useUserStore(),
      fav: useFavoritesStore(),
      books: []
    }
  },
  computed: {
    // 收藏 ids join 全表 → 收藏书单（id 有序去重后 join，列表页点亮的顺序保留）
    favBooks() {
      return this.fav.ids.map((id) => this.books.find((b) => b.id === id)).filter(Boolean)
    }
  },
  mounted() {
    fetchBooks().then((books) => { this.books = books }).catch(() => {})
  }
}
</script>

<style scoped>
.fav-title { margin: 20px 0 10px; }
</style>
