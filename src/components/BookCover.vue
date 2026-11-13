<!-- ============================================================
  BookCover.vue —— O8 图书封面"上传占位"通用组件
  没有真实封面图与上传后端，用"分类色渐变 + 书名首字"生成
  占位封面：同一本书在任何页面（列表 / 详情 / 移动端卡片）
  颜色一致——一处封装，三处复用。
============================================================ -->
<template>
  <div class="book-cover" :class="'cover-' + colorIdx" :style="boxStyle">{{ initial }}</div>
</template>

<script>
export default {
  name: 'BookCover',
  props: {
    name: { type: String, default: '' },
    category: { type: String, default: '' },
    size: { type: Number, default: 44 }      // 封面宽度 px，高度 = 宽 × 1.4
  },
  computed: {
    initial() {
      return (this.name || '书').trim().charAt(0) || '书'
    },
    // 分类做哈希 → 固定落到 6 组配色，同名同色
    colorIdx() {
      let h = 0
      for (const ch of this.category || this.name || 'lib') {
        h = (h * 31 + ch.charCodeAt(0)) % 997
      }
      return h % 6
    },
    boxStyle() {
      const h = Math.round(this.size * 1.4)
      return {
        width: this.size + 'px',
        height: h + 'px',
        fontSize: Math.max(12, Math.round(this.size * 0.45)) + 'px',
        lineHeight: h + 'px'
      }
    }
  }
}
</script>

<style scoped>
.book-cover {
  border-radius: 4px;
  color: #fff;
  text-align: center;
  font-weight: bold;
  flex-shrink: 0;
  box-shadow: inset -6px 0 0 rgba(0, 0, 0, 0.08);   /* 书脊效果 */
}
.cover-0 { background: linear-gradient(135deg, #667eea, #764ba2); }
.cover-1 { background: linear-gradient(135deg, #f67780, #e14eca); }
.cover-2 { background: linear-gradient(135deg, #33d17a, #26a269); }
.cover-3 { background: linear-gradient(135deg, #3584e4, #1c71d8); }
.cover-4 { background: linear-gradient(135deg, #ffb347, #e6646e); }
.cover-5 { background: linear-gradient(135deg, #7f8fa6, #57606f); }
</style>
