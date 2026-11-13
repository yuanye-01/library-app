// ============================================================
// stores/favorites.js —— O8 收藏仓库
// 收藏是纯本地行为（不涉及服务器），放 Pinia + persist：
// 读者在任何页面点亮星标，个人资料页、移动端详情页同步可见。
// ============================================================
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    ids: []          // 收藏的图书 id 列表
  }),
  getters: {
    count: (state) => state.ids.length,
    // 带参 getter：模板里 fav.has(book.id) 直接判断
    has: (state) => (id) => state.ids.includes(id)
  },
  actions: {
    toggle(id) {
      if (this.ids.includes(id)) {
        this.ids = this.ids.filter((x) => x !== id)
      } else {
        this.ids.push(id)
      }
    }
  },
  persist: true
})
