<!-- ============================================================
  Login.vue —— F1 登录页（两种角色，一处入口）
  流程：表单校验（rules 红字拦截）→ Pinia 的 login action
  （内部 axios 问 json-server 对暗号）→ 对上了跳 /books；
  对不上 ElMessage 报"账号或密码错误"。
============================================================ -->
<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">图书借阅管理系统</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="admin / reader" clearable />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="123456" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="loading" @click="submit">登 录</el-button>
        </el-form-item>
      </el-form>
      <p class="tip">演示账号：admin / 123456（管理员）　reader / 123456（读者）</p>
      <p class="tip">
        还没有账号？<el-link type="primary" :underline="false" @click="$router.push('/register')">注册读者账号</el-link>
      </p>
    </el-card>
  </div>
</template>

<script>
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

export default {
  name: 'LoginView',
  data() {
    return {
      loading: false,
      form: { username: '', password: '' },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    submit() {
      this.$refs.formRef.validate(async (ok) => {
        if (!ok) return                 // 校验不过：红字提示，不发请求
        this.loading = true
        try {
          const success = await useUserStore().login(this.form.username, this.form.password)
          if (success) {
            ElMessage.success('登录成功')
            // 优先回跳守卫记下的原地址（如被拦截的 /admin/books），否则进列表
            this.$router.push(this.$route.query.redirect || '/books')
          } else {
            ElMessage.error('账号或密码错误')
          }
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #f0f2f5; }
.login-card { width: 380px; }
.title { text-align: center; margin-bottom: 20px; color: #1a5276; }
.login-btn { width: 100%; }
.tip { color: #909399; font-size: 12px; text-align: center; margin: 0; }
</style>
