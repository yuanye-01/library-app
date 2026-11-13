<!-- ============================================================
  Register.vue —— 读者自助注册（开放入口，无需登录）
  只能注册 reader 角色（管理员账号不开放注册）；
  用户名查重 → POST /users → 跳登录页用新账号登录。
============================================================ -->
<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">注册读者账号</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="字母 / 数字，如 wangxm" clearable maxlength="20" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="真实姓名，如 王小明" clearable maxlength="20" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="至少 6 位" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input v-model="form.confirm" type="password" placeholder="再输入一遍" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-btn" :loading="saving" @click="submit">注 册</el-button>
        </el-form-item>
      </el-form>
      <p class="tip">
        已有账号？<el-link type="primary" :underline="false" @click="$router.push('/login')">去登录</el-link>
      </p>
    </el-card>
  </div>
</template>

<script>
import { register } from '../api/users'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

export default {
  name: 'RegisterView',
  data() {
    const checkConfirm = (rule, value, cb) => {
      value === this.form.password ? cb() : cb(new Error('两次输入的密码不一致'))
    }
    return {
      saving: false,
      form: { username: '', name: '', password: '', confirm: '' },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '3-20 位字母 / 数字 / 下划线', trigger: 'blur' }
        ],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度 6 到 20 位', trigger: 'blur' }
        ],
        confirm: [{ required: true, validator: checkConfirm, trigger: 'blur' }]
      }
    }
  },
  methods: {
    submit() {
      this.$refs.formRef.validate(async (ok) => {
        if (!ok) return
        this.saving = true
        try {
          await register({ username: this.form.username, name: this.form.name, password: this.form.password })
          ElMessage.success('注册成功，请登录')
          this.$router.push('/login')
        } catch (e) {
          ElMessage.error(e.message || '注册失败')
        } finally {
          this.saving = false
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
