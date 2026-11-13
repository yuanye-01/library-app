// ============================================================
// api/request.js —— axios 实例（接口层的"地基"）
// baseURL 统一指向 json-server（3001 端口），业务模块只写路径；
// 响应拦截器统一"拆包"：成功直接返回 res.data（剥掉 axios 的信封），
// 失败统一弹错误提示并向下抛错——页面里只管成功分支，不用处处写 catch 的 UI。
// ============================================================
import axios from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'

const request = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 5000
})

// 响应拦截器
request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    ElMessage.error('接口请求失败：' + (err.message || '未知错误'))
    return Promise.reject(err)
  }
)

export default request
