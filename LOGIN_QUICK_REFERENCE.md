# 📁 CupFlow 登录系统 - 关键文件快速索引

## 🎯 快速查阅表

| 功能 | 文件位置 | 关键函数/组件 | 说明 |
|------|--------|-----------|------|
| 登录页面 | `src/pages/login/index.vue` | `handleSubmit()` | 登录/注册表单，Tab 切换 |
| 用户状态 | `src/store/user.ts` | `useUserStore()` | Pinia store，管理登录态、token、用户信息 |
| API 请求 | `src/api/index.ts` | `request()`, `api.*` | 统一 HTTP 请求封装，Bearer Token 认证 |
| 路由配置 | `src/pages.json` | (JSON 配置) | UniApp 页面注册，login 页面路由定义 |
| 个人中心 | `src/pages/user/index.vue` | `onShow()`, `fetchProfile()` | 用户登录态展示，登出功能 |
| 应用入口 | `src/main.ts` | `createApp()` | Vue 3 + Pinia 初始化 |
| 根组件 | `src/App.vue` | `onLaunch` | 应用启动钩子 |

---

## 📄 核心文件详解

### 1️⃣ 登录页面
**文件**: `/src/pages/login/index.vue` (243 行)

```typescript
// 关键方法
handleSubmit()     // 提交登录/注册表单
userStore.login()  // 调用登录 action
userStore.register() // 调用注册 action
```

**关键变量**:
- `isLogin` - 登录/注册 tab 切换状态
- `form` - 表单数据 {nickname, password, confirmPassword}

**成功流程**: 表单验证 → 调用 store 方法 → 成功后 navigateBack()

---

### 2️⃣ 用户状态管理
**文件**: `/src/store/user.ts` (76 行)

```typescript
// 关键方法
init()      // 应用启动时恢复登录态 (从 localStorage)
login()     // POST /api/user/login，保存 token 到 localStorage
register()  // POST /api/user/register，保存 token 到 localStorage
logout()    // 清空状态，删除 localStorage

// 关键状态
isLoggedIn: boolean    // 登录状态标记
token: string          // Bearer token
userId: number
nickname: string
points: number
```

**本地存储键名**:
```
user_token    → token 字符串
user_info     → JSON 字符串 {userId, nickname, points, token}
```

---

### 3️⃣ API 请求封装
**文件**: `/src/api/index.ts` (68 行)

```typescript
// 导出的 API 对象
api.get(url, needAuth?)
api.post(url, data, needAuth?)
api.put(url, data, needAuth?)
api.delete(url, needAuth?)

// 内部实现
request(options)  // 核心请求方法
getToken()        // 从 localStorage 读取 token

// 关键特性
- Bearer Token 认证 (Authorization header)
- 401 响应自动跳转登录页
- 环境变量配置 BASE_URL
```

**使用示例**:
```typescript
// 登录
await api.post("/api/user/login", {nickname, password})

// 获取个人资料 (需要认证)
await api.get("/api/user/profile", true)

// 取消关注 (需要认证)
await api.delete("/api/user/follows?teamId=1", true)
```

---

### 4️⃣ 路由配置
**文件**: `/src/pages.json` (159 行)

```json
{
  "path": "pages/login/index",
  "style": {
    "navigationBarTitleText": "登录注册"
  }
}
```

**特殊标记**: `#ifndef MP-WEIXIN` - 小程序中不显示某些 TabBar 项

---

### 5️⃣ 个人中心页面
**文件**: `/src/pages/user/index.vue` (370 行)

```typescript
// 关键方法
onShow()         // TabBar 切换时调用，刷新登录态
userStore.init() // 重新读取 localStorage 状态
fetchProfile()   // 获取用户资料 API 调用
handleLogout()   // 调用 userStore.logout()

// 条件渲染
v-if="!userStore.isLoggedIn"  // 未登录界面
v-else                         // 已登录界面
```

---

### 6️⃣ 应用入口
**文件**: `/src/main.ts` (11 行)

```typescript
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);
  return { app };
}
```

**作用**: 初始化 Vue 3 应用和 Pinia 状态管理

---

## 🔐 认证流程速查

### 初次打开应用
```
1. main.ts → createApp()
2. App.vue → onLaunch() hook
3. 进入首页，onShow() 钩子
4. userStore.init() → 从 localStorage 读取 token
5. 如果有 token → isLoggedIn = true
6. 如果无 token → isLoggedIn = false
```

### 用户登录
```
1. 点击"登录/注册"按钮 → navigateTo('/pages/login/index')
2. 输入昵称和密码
3. 点击"登录"按钮 → handleSubmit()
4. userStore.login(nickname, password)
   ├─ POST /api/user/login
   ├─ 保存 token 到 localStorage
   ├─ 更新 store 状态
5. 显示成功提示
6. navigateBack() 返回上一页
```

### 访问需认证的 API
```
1. 页面调用 api.get(url, true)
2. request() 方法
   ├─ 检查 needAuth 参数
   ├─ 从 localStorage 获取 token
   ├─ 添加 Authorization: Bearer {token} header
   ├─ 发送请求
   ├─ 响应 code = 401?
   │   ├─ 是: 跳转登录页，reject
   │   └─ 否: resolve(data)
```

### 用户登出
```
1. 个人中心页面点击"退出登录"
2. handleLogout()
3. userStore.logout()
   ├─ 清空所有状态
   ├─ 删除 user_token 和 user_info
4. 返回未登录界面
```

---

## 🌐 API 端点清单

### 登录相关 (不需认证)
```
POST   /api/user/login
请求: {nickname, password}
响应: {code, data: {token, userId, nickname, points}}

POST   /api/user/register
请求: {nickname, password}
响应: {code, data: {token, userId, nickname, points}}
```

### 用户相关 (需认证: needAuth=true)
```
GET    /api/user/profile
响应: {code, data: {userId, nickname, points, rank, follows[], guesses[]}}

DELETE /api/user/follows?teamId={id}
响应: {code, message}
```

---

## 💡 关键概念

### Bearer Token 认证方式
```typescript
// 请求头格式
Authorization: Bearer eyJhbGc...

// 后端验证
server.getToken() // 提取 Bearer 后的部分
server.verifyToken() // 验证签名和过期时间
```

### 401 Unauthorized 处理
```typescript
// 后端返回 401 时
{
  "code": 401,
  "message": "未登录或 token 已过期"
}

// 前端响应
if (res.code === 401) {
  uni.navigateTo({url: '/pages/login/index'})
  reject(new Error('未登录'))
}
```

### 状态持久化
```typescript
// 登录时保存
uni.setStorageSync('user_token', token)
uni.setStorageSync('user_info', JSON.stringify(userInfo))

// 应用启动时恢复
const token = uni.getStorageSync('user_token')
if (token) {
  store.isLoggedIn = true
  store.token = token
}

// 登出时清除
uni.removeStorageSync('user_token')
uni.removeStorageSync('user_info')
```

---

## 🚨 常见问题排查

| 问题 | 可能原因 | 检查位置 |
|------|--------|--------|
| 登录后刷新丢失登录态 | init() 未被调用 | onShow() 钩子 |
| API 返回 401 | token 过期或无效 | store.token 值 |
| 跨域请求失败 | API_BASE_URL 错误或后端 CORS | vite.config.ts, api/index.ts |
| localStorage 报错 | 微信小程序环境 | 使用 uni.setStorageSync |
| 无法跳转登录页 | 路由路径错误 | pages.json 配置 |

---

## 🔧 常用代码片段

### 在任何页面检查登录状态
```typescript
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
if (!userStore.isLoggedIn) {
  uni.navigateTo({url: '/pages/login/index'})
}
```

### 调用需认证的 API
```typescript
import api from '@/api'

const res = await api.get('/api/user/profile', true)
if (res.code === 200) {
  console.log(res.data)
}
```

### 添加新的用户状态字段
```typescript
// 1. 修改 UserState 接口
interface UserState {
  // ... 现有字段
  avatar?: string
}

// 2. 修改 state 初始值
state: (): UserState => ({
  // ... 现有字段
  avatar: ''
})

// 3. 修改 login/register 方法保存
this.avatar = res.data.avatar

// 4. 修改 localStorage 保存
uni.setStorageSync('user_info', JSON.stringify({...}))
```

