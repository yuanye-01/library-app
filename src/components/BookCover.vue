<!-- ============================================================
  BookCover.vue —— O8 图书封面"上传占位"通用组件
  没有真实封面图与上传后端，用"杂志式版面"生成占位封面：
  左侧书脊竖条 + 顶部分类标签 + 中部竖排书名 + 底部作者。
  版式用绝对定位精确摆放（flex + 竖排在缩略尺寸下会挤压）。
  小尺寸（列表 ≤56px）退化为"首字"紧凑样式。
  同一本书在列表 / 详情 / 移动端卡片长得一模一样——一处封装，
  三处复用。
============================================================ -->
<template>
  <div class="book-cover" :class="'cover-' + colorIdx" :style="boxStyle" :title="name + ' · ' + author">
    <template v-if="compact">
      <span class="mini-initial">{{ initial }}</span>
    </template>
    <template v-else>
      <span class="spine"></span>
      <span class="tag">{{ tagText }}</span>
      <span class="title">{{ titleText }}</span>
      <span class="author">{{ authorText }}</span>
    </template>
  </div>
</template>

<script>
export default {
  name: 'BookCover',
  props: {
    name: { type: String, default: '' },
    author: { type: String, default: '' },
    category: { type: String, default: '' },
    size: { type: Number, default: 44 }      // 封面宽度 px，高度 = 宽 × 1.4
  },
  computed: {
    // ≤56px 视为缩略图：只显首字（字多会糊成一团）
    compact() {
      return this.size < 60
    },
    initial() {
      return (this.name || '书').trim().charAt(0) || '书'
    },
    titleText() {
      return (this.name || '图书').trim().slice(0, 2)    // 书名前 2 字竖排
    },
    tagText() {
      return (this.category || '图书').slice(0, 4)
    },
    authorText() {
      return (this.author || '').slice(0, 6) || ' '
    },
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
        fontSize: Math.round(this.size * 0.3) + 'px'   // 主字号：详情 120 → 36px
      }
    }
  }
}
</script>

<style scoped>
.book-cover {
  position: relative;
  border-radius: 4px 6px 6px 4px;
  color: #fff;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

/* ---------- 小尺寸（列表缩略图） ---------- */
.mini-initial {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

/* ---------- 大尺寸（杂志式版面，绝对定位精确摆放） ---------- */
.spine {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10%;
  background: rgba(0, 0, 0, 0.28);        /* 书脊：左缘深色竖条 */
}
.tag {
  position: absolute;
  top: 6%;
  left: 16%;
  right: 8%;
  font-size: 0.28em;                       /* 相对主字号缩放 */
  letter-spacing: 1px;
  opacity: 0.85;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding-bottom: 0.15em;
  text-align: left;
}
.title {
  position: absolute;
  top: 22%;
  bottom: 24%;
  left: 18%;
  width: 64%;
  font-size: 1em;
  font-weight: bold;
  writing-mode: vertical-rl;              /* 书名竖排：中式书封传统版式 */
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
.author {
  position: absolute;
  bottom: 6%;
  left: 16%;
  right: 8%;
  font-size: 0.26em;
  opacity: 0.9;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
}

/* ---------- 6 组分类配色 ---------- */
.cover-0 { background: linear-gradient(150deg, #667eea, #764ba2); }
.cover-1 { background: linear-gradient(150deg, #f67780, #e14eca); }
.cover-2 { background: linear-gradient(150deg, #33d17a, #26a269); }
.cover-3 { background: linear-gradient(150deg, #3584e4, #1c71d8); }
.cover-4 { background: linear-gradient(150deg, #ffb347, #e6646e); }
.cover-5 { background: linear-gradient(150deg, #7f8fa6, #57606f); }
</style>
