<!-- ============================================================
  Readers.vue —— 读者管理（管理员端）
  列：编号/用户名/姓名/状态/在借数/操作
  ① 新增读者（Dialog 表单，用户名前端查重）
  ② 编辑（改名 + el-switch 冻结/解冻）
  ③ 重置密码（确认后 PUT password=123456）
  ④ 删除保护：读者名下还有"在借"记录 → 拒绝删除
  ⑤ 查看借阅：Dialog 表格展示该读者全部记录（join 书名，超期标红）
============================================================ -->
<template>
  <div class="page">
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索用户名 / 姓名" clearable :prefix-icon="Search" class="search-input" />
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增读者</el-button>
        <span class="muted count">共 {{ filtered.length }} 位读者</span>
      </div>

      <el-table :data="rows" border>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'frozen' ? 'danger' : 'success'">
              {{ row.status === 'frozen' ? '冻结' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="在借 / 超期" width="110">
          <template #default="{ row }">
            <span :class="{ 'over-red': row.overdueCount > 0 }">{{ row.borrowedCount }}</span>
            <span v-if="row.overdueCount > 0" class="over-red">（超期 {{ row.overdueCount }}）</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewRecords(row)">查看借阅</el-button>
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="warning" plain @click="resetPwd(row)">重置密码</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑共用 Dialog -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑读者' : '新增读者'" width="440px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="!!form.id" maxlength="20" placeholder="3-20 位字母 / 数字" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" maxlength="20" />
        </el-form-item>
        <el-form-item v-if="!form.id" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password maxlength="20" />
        </el-form-item>
        <el-form-item v-if="form.id" label="状态">
          <el-switch v-model="form.status" active-value="active" inactive-value="frozen"
            active-text="正常" inactive-text="冻结" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保 存</el-button>
      </template>
    </el-dialog>

    <!-- 查看借阅 Dialog -->
    <el-dialog v-model="recordsVisible" :title="`【${viewing.name}】的借阅记录`" width="720px">
      <el-table :data="viewRecordsRows" border :row-class-name="rowClass" max-height="420">
        <el-table-column prop="bookName" label="书名" min-width="220" />
        <el-table-column prop="borrowDate" label="借出日期" width="110" />
        <el-table-column prop="dueDate" label="应还日期" width="110">
          <template #default="{ row }">
            <span :class="{ 'over-red': row.overdue }">{{ row.dueDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'returned' ? 'success' : row.overdue ? 'danger' : 'primary'">
              {{ row.status === 'returned' ? '已归还' : row.overdue ? '已超期' : '在借' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <p class="muted sum">共 {{ viewRecordsRows.length }} 条：在借 {{ viewingBorrowed }} / 超期 {{ viewingOverdue }}</p>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import { fetchReaders, createReader, updateReader, deleteReader } from '../../api/users'
import { fetchBorrows, isOverdue } from '../../api/borrow'
import { fetchBooks } from '../../api/books'

const EMPTY_FORM = () => ({ id: '', username: '', name: '', password: '', status: 'active' })

export default {
  name: 'ReadersView',
  data() {
    return {
      readers: [],
      records: [],
      books: [],
      keyword: '',
      dialogVisible: false,
      recordsVisible: false,
      saving: false,
      form: EMPTY_FORM(),
      viewing: {},
      viewingRows: [],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '3-20 位字母 / 数字 / 下划线', trigger: 'blur' }
        ],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度 6 到 20 位', trigger: 'blur' }
        ]
      },
      Search, Plus
    }
  },
  computed: {
    filtered() {
      const kw = this.keyword.trim().toLowerCase()
      return kw
        ? this.readers.filter((u) => u.username.toLowerCase().includes(kw) || u.name.includes(this.keyword.trim()))
        : this.readers
    },
    // 读者表：join 在借数 / 超期数
    rows() {
      return this.filtered.map((u) => {
        const mine = this.records.filter((r) => r.userId === u.id)
        const active = mine.filter((r) => r.status === 'borrowed')
        return { ...u, borrowedCount: active.length, overdueCount: active.filter(isOverdue).length }
      })
    },
    viewRecordsRows() {
      return this.viewingRows.map((r) => {
        const book = this.books.find((b) => b.id === r.bookId)
        return { ...r, bookName: book ? book.name : '（已下架）', overdue: isOverdue(r) }
      })
    },
    viewingBorrowed() {
      return this.viewRecordsRows.filter((r) => r.status === 'borrowed').length
    },
    viewingOverdue() {
      return this.viewRecordsRows.filter((r) => r.overdue).length
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      try {
        const [readers, records, books] = await Promise.all([fetchReaders(), fetchBorrows(), fetchBooks()])
        this.readers = readers
        this.records = records
        this.books = books
      } catch (e) { /* 已由拦截器提示 */ }
    },
    rowClass({ row }) {
      return row.overdue ? 'overdue-row' : ''
    },
    openDialog(row) {
      this.form = row ? { ...row, password: '' } : EMPTY_FORM()
      this.dialogVisible = true
    },
    save() {
      if (this.saving) return
      this.$refs.formRef.validate(async (ok) => {
        if (!ok) return
        // 新增时前端查重（用户名唯一）
        if (!this.form.id && this.readers.some((u) => u.username === this.form.username)) {
          ElMessage.error('用户名已存在')
          return
        }
        this.saving = true
        try {
          if (this.form.id) {
            await updateReader(this.form.id, { ...this.form, password: undefined })
          } else {
            await createReader(this.form)
          }
          ElMessage.success(this.form.id ? '修改已保存' : '读者已添加')
          this.dialogVisible = false
          await this.load()
        } catch (e) {
          ElMessage.error(e.message || '保存失败')
        } finally {
          this.saving = false
        }
      })
    },
    resetPwd(row) {
      ElMessageBox.confirm(`将【${row.name}】的密码重置为 123456？`, '重置密码', {
        confirmButtonText: '重置', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        await updateReader(row.id, { ...row, password: '123456' })
        ElMessage.success('密码已重置为 123456')
      }).catch(() => {})
    },
    del(row) {
      // 删除保护：名下有在借记录的读者不能删（台账完整性）
      if (row.borrowedCount > 0) {
        ElMessageBox.alert(
          `【${row.name}】名下还有 ${row.borrowedCount} 本图书在借，须先归还全部图书才能删除账号。`,
          '无法删除', { confirmButtonText: '知道了', type: 'warning' }
        )
        return
      }
      ElMessageBox.confirm(`确定删除读者【${row.name}】？历史借阅记录会保留。`, '删除确认', {
        confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
      }).then(async () => {
        await deleteReader(row.id)
        ElMessage.success('已删除')
        await this.load()
      }).catch(() => {})
    },
    viewRecords(row) {
      this.viewing = row
      this.viewingRows = this.records.filter((r) => r.userId === row.id)
      this.recordsVisible = true
    }
  }
}
</script>

<style scoped>
.toolbar { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
.search-input { width: 240px; }
.count { margin-left: auto; }
.over-red { color: #f56c6c; font-weight: bold; }
.sum { margin-top: 10px; text-align: right; }
:deep(.overdue-row) { background: #fef0f0 !important; }
</style>
