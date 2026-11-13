<!-- ============================================================
  Center.vue —— F5 个人中心（嵌套路由的"壳"）
  /center 本身不装内容，只放切换页签（el-tabs）；
  真正的子页 <router-view> 在下面换：borrowed（我的借阅）/ profile（资料）。
============================================================ -->
<template>
  <div class="page">
    <el-card>
      <el-tabs :model-value="activeTab" @tab-change="go">
        <el-tab-pane label="我的借阅" name="/center/borrowed" />
        <el-tab-pane label="个人资料" name="/center/profile" />
      </el-tabs>
      <!-- 嵌套路由出口：子组件在这里"换台" -->
      <router-view />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CenterView',
  computed: {
    activeTab() {
      return this.$route.path
    }
  },
  methods: {
    go(path) {
      this.$router.push(path)    // 点页签 = 换子路由，壳不动
    }
  }
}
</script>
