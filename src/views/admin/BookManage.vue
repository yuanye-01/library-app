<!-- ============================================================
  BookManage.vue —— F2 管理端：图书增删改（Table 全家福）
  新增/编辑共用一个 Dialog：openDialog(row) 有参=编辑（浅拷贝回填），
  无参=新增（空白表单）——组件复用 + 状态区分的经典写法。
  保存前 formRef.validate 红字拦截（E02 异常用例依据）；
  删除走 ElMessageBox 二次确认（误删防线）。
============================================================ -->
<template>
  <div class="page">
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索书名 / 作者" clearable :prefix-icon="Search" class="search-input" />
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增图书</el-button>
        <span class="muted count">共 {{ filtered.length }} 种</span>
      </div>

      <el-table :data="filtered" border>
        <el-table-column prop="id" label="编号" width="100" />
        <el-table-column prop="name" label="书名" min-width="220" />
        <el-table-column prop="author" label="作者" width="130" />
        <el-table-column label="分类" width="130">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publisher" label="出版社" width="150" />
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑共用的 Dialog 表单 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑图书' : '新增图书'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="书名" prop="name">
          <el-input v-model="form.name" placeholder="必填" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="form.author" placeholder="必填" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" allow-create filterable default-first-option placeholder="选择已有分类或输入新分类" class="full">
            <el-option v-for="c in categoryOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="出版社" prop="publisher">
          <el-input v-model="form.publisher" maxlength="30" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :max="99" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { fetchBooks, saveBook, removeBook } from '../../api/books'

const EMPTY_FORM = () => ({
  id: '',
  name: '',
  author: '',
  category: '',
  publisher: '',
  stock: 5,
  description: ''
})

export default {
  name: 'BookManageView',
  data() {
    return {
      books: [],
      keyword: '',
      dialogVisible: false,
      saving: false,
      form: EMPTY_FORM(),
      rules: {
        name: [{ required: true, message: '请输入书名', trigger: 'blur' }],
        author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
        category: [{ required: true, message: '请选择或输入分类', trigger: 'change' }],
        stock: [{ required: true, type: 'number', message: '请输入库存', trigger: 'change' }]
      },
      Search, Plus
    }
  },
  computed: {
    filtered() {
      const kw = this.keyword.trim().toLowerCase()
      return kw ? this.books.filter((b) => b.name.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw)) : this.books
    },
    // 已有分类 + 常用候选，配合 allow-create 输入新分类
    categoryOptions() {
      return [...new Set(this.books.map((b) => b.category))].sort()
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      try {
        this.books = await fetchBooks()
      } catch (e) { /* 已由拦截器提示 */ }
    },
    openDialog(row) {
      this.form = row ? { ...row } : EMPTY_FORM()      // 浅拷贝回填，避免直接改表格行
      this.dialogVisible = true
    },
    save() {
      if (this.saving) return                    // 防重复提交（连点/焦点残留双触发）
      this.$refs.formRef.validate(async (ok) => {
        if (!ok) return                                    // 校验不过：红字提示，不发请求
        this.saving = true
        try {
          await saveBook(this.form)
          ElMessage.success(this.form.id ? '修改已保存' : '新书已上架')
          this.dialogVisible = false
          await this.load()
        } catch (e) {
          ElMessage.error(e.message || '保存失败')
        } finally {
          this.saving = false
        }
      })
    },
    del(row) {
      ElMessageBox.confirm(`确定删除《${row.name}》？历史借阅记录会保留。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await removeBook(row.id)
        ElMessage.success('已删除')
        await this.load()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
.search-input { width: 240px; }
.count { margin-left: auto; }
.full { width: 100%; }
</style>
