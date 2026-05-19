# 🔧 CupFlow 登录系统 - 集成与问题排查指南

## 📚 目录
1. [快速集成](#快速集成)
2. [常见问题排查](#常见问题排查)
3. [扩展功能指南](#扩展功能指南)
4. [微信登录集成](#微信登录集成)
5. [安全性加固](#安全性加固)
6. [调试技巧](#调试技巧)

---

## 快速集成

### 场景 1: 在新页面中检查登录状态

```typescript
// pages/new-page/index.vue
<template>
  <view v-if="userStore.isLoggedIn" class="content">
    <!-- 已登录内容 -->
    <text>欢迎, {{ userStore.nickname }}</text>
  </view>
  <view v-else class="login-prompt">
    <button @tap="goLogin">请先登录</button>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const goLogin = () => {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>
```

### 场景 2: 调用需认证的 API

```typescript
import api from '@/api'

// 带认证的 GET 请求
async function fetchUserData() {
  try {
    const res = await api.get('/api/user/data', true)
    if (res.code === 200) {
      console.log('用户数据:', res.data)
    } else {
      uni.showToast({ title: res.message || '加载失败', icon: 'none' })
    }
  } catch (err) {
    console.error('请求失败:', err)
  }
}

// 带认证的 POST 请求
async function updateUserInfo(info: any) {
  try {
    const res = await api.post('/api/user/update', info, true)
    if (res.code === 200) {
      uni.showToast({ title: '更新成功', icon: 'success' })
    }
  } catch (err) {
    console.error('更新失败:', err)
  }
}
```

### 场景 3: 添加新的用户字段

要在 Pinia store 中添加新字段 (如头像 `avatar`):

**第 1 步**: 修改 `src/store/user.ts`

```typescript
// 修改 UserState 接口
interface UserState {
  isLoggedIn: boolean;
  token: string;
  userId: number;
  nickname: string;
  points: number;
  avatar?: string;  // ← 新增字段
  email?: string;   // ← 可选的另一个字段
}

// 修改 state 初始值
state: (): UserState => ({
  isLoggedIn: false,
  token: "",
  userId: 0,
  nickname: "",
  points: 0,
  avatar: "",  // ← 新增
  email: "",   // ← 新增
}),

// 修改 init 方法
init() {
  const token = uni.getStorageSync("user_token");
  const userInfo = uni.getStorageSync("user_info");
  if (token && userInfo) {
    this.token = token;
    this.isLoggedIn = true;
    const info = JSON.parse(userInfo);
    this.userId = info.userId;
    this.nickname = info.nickname;
    this.points = info.points || 0;
    this.avatar = info.avatar;  // ← 新增
    this.email = info.email;    // ← 新增
  }
}

// 修改 login 和 register 方法
async login(nickname: string, password: string) {
  const res = await api.post("/api/user/login", { nickname, password });
  if (res.code === 200 && res.data) {
    this.token = res.data.token;
    this.isLoggedIn = true;
    this.userId = res.data.userId;
    this.nickname = res.data.nickname;
    this.points = res.data.points || 0;
    this.avatar = res.data.avatar;  // ← 新增
    this.email = res.data.email;    // ← 新增
    
    // 保存到 localStorage
    uni.setStorageSync("user_token", res.data.token);
    uni.setStorageSync("user_info", JSON.stringify({
      userId: res.data.userId,
      nickname: res.data.nickname,
      points: res.data.points,
      avatar: res.data.avatar,  // ← 新增
      email: res.data.email,    // ← 新增
      token: res.data.token
    }));
    return true;
  }
  throw new Error(res.message || "登录失败");
}

// 修改 logout 方法
logout() {
  this.isLoggedIn = false;
  this.token = "";
  this.userId = 0;
  this.nickname = "";
  this.points = 0;
  this.avatar = "";   // ← 新增
  this.email = "";    // ← 新增
  uni.removeStorageSync("user_token");
  uni.removeStorageSync("user_info");
}
```

**第 2 步**: 在页面中使用新字段

```typescript
<template>
  <image :src="userStore.avatar" class="avatar" />
  <text>{{ userStore.email }}</text>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
</script>
```

---

## 常见问题排查

### ❌ 问题 1: 登录后刷新页面，登录状态丢失

**症状**: 
- 登录成功后，刷新页面变成未登录状态
- localStorage 中有 token，但状态没有恢复

**原因分析**:
1. `userStore.init()` 未被调用
2. `onShow` 钩子未执行
3. localStorage 数据损坏

**解决方案**:

```typescript
// 1. 在页面的 onShow 中添加初始化
<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { onShow } from '@dcloudio/uni-app'

const userStore = useUserStore()

onShow(() => {
  userStore.init()  // ← 重要!
})
</script>

// 2. 检查 localStorage 数据
// 在浏览器控制台执行:
console.log(uni.getStorageSync('user_token'))
console.log(uni.getStorageSync('user_info'))

// 3. 如果数据已损坏，清除并重新登录
uni.removeStorageSync('user_token')
uni.removeStorageSync('user_info')
```

**预防方案**:
- 每个需要登录态的页面的 `onShow` 中都要调用 `userStore.init()`
- 参考 `src/pages/user/index.vue` 的实现

---

### ❌ 问题 2: API 返回 401，页面自动跳转登录页

**症状**:
- 调用 API 后自动跳转到登录页
- 网络正常，但仍返回 401

**原因分析**:
1. Token 过期
2. Token 无效或被篡改
3. 后端验证失败
4. Token 未被正确传送

**解决方案**:

```typescript
// 1. 检查 token 是否存在和有效
console.log('Token:', uni.getStorageSync('user_token'))

// 2. 检查 API 请求头是否正确
// 在 src/api/index.ts 中添加日志
if (options.needAuth) {
  const token = getToken();
  if (token) {
    console.log('添加认证头:', `Bearer ${token.substring(0, 20)}...`)
    header["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn('needAuth=true 但 token 不存在!')
  }
}

// 3. 手动重新登录
userStore.logout()
uni.navigateTo({ url: '/pages/login/index' })

// 4. 检查后端 token 过期时间
// 后端应该提供 token 过期时间，前端可以在过期前主动刷新
```

**预防方案**:
- 实现 token 刷新机制 (见下方扩展功能)
- 添加 token 过期提醒
- 定期更新 token

---

### ❌ 问题 3: 跨域请求失败

**症状**:
- 浏览器控制台有 CORS 错误
- 请求无法发送到后端

**原因分析**:
1. `VITE_API_BASE_URL` 配置错误
2. 后端未配置 CORS
3. 请求跨越了不同源

**解决方案**:

```typescript
// 1. 检查环境变量配置
// .env.development 中应该有:
VITE_API_BASE_URL=http://localhost:3000

// 2. 检查实际的 BASE_URL
// src/api/index.ts 中添加日志:
console.log('API BASE_URL:', import.meta.env.VITE_API_BASE_URL)

// 3. H5 开发模式可以使用代理
// vite.config.ts 中配置代理:
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})

// 4. 确保后端配置了 CORS
// 后端应该返回正确的 CORS 头:
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Content-Type, Authorization
```

**预防方案**:
- 使用相同的域名 (生产环境)
- 后端统一配置 CORS
- H5 开发时使用代理

---

### ❌ 问题 4: 微信小程序中 localStorage 报错

**症状**:
- `uni.setStorageSync` 和 `uni.getStorageSync` 报错
- 提示权限或容量问题

**原因分析**:
1. 小程序版本过低
2. 存储容量超过限制 (微信小程序 10MB)
3. 存储路径权限问题

**解决方案**:

```typescript
// 1. 使用 try-catch 保护存储操作
function safeSetStorage(key: string, value: string) {
  try {
    uni.setStorageSync(key, value)
  } catch (err: any) {
    console.error(`存储 ${key} 失败:`, err)
    // 可以选择降级处理，如内存存储
  }
}

function safeGetStorage(key: string): string {
  try {
    return uni.getStorageSync(key) || ''
  } catch (err: any) {
    console.error(`读取 ${key} 失败:`, err)
    return ''
  }
}

// 2. 修改 src/store/user.ts 使用安全方法
init() {
  const token = safeGetStorage("user_token");
  const userInfo = safeGetStorage("user_info");
  if (token && userInfo) {
    // ...
  }
}

// 3. 定期清理不需要的存储
function cleanStorage() {
  // 只保留必要的字段
  try {
    uni.removeStorageSync("unnecessary_key")
  } catch (err) {
    console.error('清理存储失败:', err)
  }
}
```

**预防方案**:
- 只存储必要的数据 (token 和基本用户信息)
- 定期清理过期数据
- 监控存储使用情况

---

### ❌ 问题 5: 登录页面输入框无响应

**症状**:
- 输入框显示但无法输入
- 按钮点击无反应

**原因分析**:
1. UniApp 事件绑定问题
2. `v-model` 绑定错误
3. 表单验证阻塞

**解决方案**:

```typescript
// 1. 检查 v-model 绑定是否正确
// 应该是 ref 对象的 .value
<input v-model="form.nickname" placeholder="请输入昵称" />

<script setup>
import { ref } from 'vue'
const form = ref({ 
  nickname: "", 
  password: "", 
  confirmPassword: "" 
})
</script>

// 2. 检查事件绑定
// 应该使用 @tap 而不是 @click
<button @tap="handleSubmit">登录</button>

// 3. 检查权限
// pages.json 中检查是否有权限配置问题
```

---

## 扩展功能指南

### 扩展 1: 实现 Token 刷新机制

```typescript
// src/api/index.ts 添加

interface TokenResponse {
  token: string;
  expiresIn?: number;
}

// 用于存储 token 过期时间
let tokenExpiresAt = 0;

export function isTokenExpiringSoon(): boolean {
  const now = Date.now();
  const timeUntilExpiry = tokenExpiresAt - now;
  // 如果距离过期还有少于 5 分钟，认为即将过期
  return timeUntilExpiry < 5 * 60 * 1000;
}

export async function refreshToken(): Promise<void> {
  try {
    const token = getToken();
    if (!token) return;

    const res = await uni.request({
      url: BASE_URL + '/api/user/refresh',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }) as any;

    if (res.data.code === 200) {
      const newToken = res.data.data.token;
      uni.setStorageSync('user_token', newToken);
      
      // 更新过期时间
      if (res.data.data.expiresIn) {
        tokenExpiresAt = Date.now() + res.data.data.expiresIn * 1000;
      }
    }
  } catch (err) {
    console.error('Token 刷新失败:', err);
  }
}

// 在请求拦截器中使用
export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise(async (resolve, reject) => {
    // 检查 token 是否即将过期
    if (options.needAuth && isTokenExpiringSoon()) {
      await refreshToken();
    }

    // ... 后续的请求逻辑
  });
}
```

### 扩展 2: 添加登录失败重试机制

```typescript
// src/store/user.ts 修改 login 方法

const MAX_RETRY_TIMES = 3;

async login(nickname: string, password: string, retryTimes = 0) {
  try {
    const res = await api.post("/api/user/login", { nickname, password });
    if (res.code === 200 && res.data) {
      // 保存逻辑...
      return true;
    }
    throw new Error(res.message || "登录失败");
  } catch (err: any) {
    // 网络错误时重试
    if (retryTimes < MAX_RETRY_TIMES && err.message.includes('网络')) {
      console.log(`登录重试 (${retryTimes + 1}/${MAX_RETRY_TIMES})...`);
      return this.login(nickname, password, retryTimes + 1);
    }
    throw err;
  }
}
```

### 扩展 3: 添加登录记录日志

```typescript
// src/api/request-logger.ts (新建文件)

interface RequestLog {
  timestamp: number;
  url: string;
  method: string;
  statusCode: number;
  duration: number;
  success: boolean;
}

const logs: RequestLog[] = [];

export function logRequest(
  url: string,
  method: string,
  statusCode: number,
  duration: number,
  success: boolean
) {
  logs.push({
    timestamp: Date.now(),
    url,
    method,
    statusCode,
    duration,
    success
  });

  // 只保存最近 100 条记录
  if (logs.length > 100) {
    logs.shift();
  }
}

export function getLogs(): RequestLog[] {
  return logs;
}

export function exportLogs(): string {
  return JSON.stringify(logs, null, 2);
}

// 在 src/api/index.ts 中使用
export function request<T = any>(options: RequestOptions) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    // ... 请求逻辑
    
    success: (res: any) => {
      const duration = Date.now() - startTime;
      logRequest(options.url, options.method || 'GET', res.statusCode, duration, true);
      // ...
    },
    fail: (err: any) => {
      const duration = Date.now() - startTime;
      logRequest(options.url, options.method || 'GET', 0, duration, false);
      // ...
    }
  });
}

// 在调试时导出日志
// console.log(exportLogs())
```

---

## 微信登录集成

### 集成微信 OAuth 登录

**第 1 步**: 在登录页面添加微信登录按钮

```vue
<!-- pages/login/index.vue -->
<template>
  <!-- ... 现有的登录表单 ... -->
  
  <view class="divider">
    <text>或使用以下方式登录</text>
  </view>
  
  <view class="social-login">
    <button class="wechat-btn" @tap="wechatLogin">
      <text class="wechat-icon">微信登录</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useUserStore } from "@/store/user"

const userStore = useUserStore()

// 微信登录
const wechatLogin = async () => {
  try {
    uni.showLoading({ title: '授权中...' })
    
    // 获取微信登录授权 code
    const { code } = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    }) as any
    
    // 将 code 发送到后端交换 token
    const res = await api.post("/api/user/wechat-login", { code })
    
    if (res.code === 200) {
      // 保存登录信息
      userStore.token = res.data.token
      userStore.isLoggedIn = true
      userStore.userId = res.data.userId
      userStore.nickname = res.data.nickname
      userStore.points = res.data.points || 0
      
      uni.setStorageSync("user_token", res.data.token)
      uni.setStorageSync("user_info", JSON.stringify(res.data))
      
      uni.showToast({ title: "登录成功", icon: "success" })
      setTimeout(() => uni.navigateBack(), 1000)
    }
  } catch (err: any) {
    uni.showToast({ title: err.message || "微信登录失败", icon: "none" })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped>
.divider {
  text-align: center;
  margin: 30rpx 0;
  position: relative;
  color: #999;
}

.social-login {
  display: flex;
  gap: 20rpx;
}

.wechat-btn {
  flex: 1;
  background: #09b83e;
  color: white;
  border: none;
  height: 80rpx;
  border-radius: 40rpx;
}
</style>
```

**第 2 步**: 在 store 中添加微信登录方法

```typescript
// src/store/user.ts

async wechatLogin(code: string) {
  const res = await api.post("/api/user/wechat-login", { code });
  if (res.code === 200 && res.data) {
    this.token = res.data.token;
    this.isLoggedIn = true;
    this.userId = res.data.userId;
    this.nickname = res.data.nickname;
    this.points = res.data.points || 0;
    
    uni.setStorageSync("user_token", res.data.token);
    uni.setStorageSync("user_info", JSON.stringify(res.data));
    return true;
  }
  throw new Error(res.message || "微信登录失败");
}
```

**第 3 步**: 后端实现

后端需要:
1. 实现 `/api/user/wechat-login` 接口
2. 使用 code 调用微信服务器验证
3. 根据微信用户信息创建或更新本地用户
4. 返回 token 和用户信息

```
示例流程:
POST /api/user/wechat-login
Body: { code: "xxx" }

后端:
1. 使用 code + appid + appsecret 调用微信 API
2. 获取用户的 openid 和用户信息
3. 查询本地数据库是否存在该微信用户
4. 如果不存在，创建新用户
5. 生成 token 并返回
```

---

## 安全性加固

### 安全措施 1: 密码传输加密

```typescript
// 实现 RSA 加密 (需要安装加密库)
// npm install jsencrypt

import JSEncrypt from 'jsencrypt'

// src/utils/encryption.ts
export class PasswordEncryptor {
  private encryptor: any
  
  constructor(publicKey: string) {
    this.encryptor = new JSEncrypt()
    this.encryptor.setPublicKey(publicKey)
  }
  
  encrypt(password: string): string {
    return this.encryptor.encrypt(password)
  }
}

// 登录页面中使用
<script setup>
import { PasswordEncryptor } from '@/utils/encryption'

// 从配置文件读取公钥
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----`

const encryptor = new PasswordEncryptor(PUBLIC_KEY)

const handleSubmit = async () => {
  // 加密密码
  const encryptedPassword = encryptor.encrypt(form.value.password)
  
  await userStore.login(form.value.nickname, encryptedPassword)
}
</script>
```

### 安全措施 2: Token 有效期管理

```typescript
// src/store/user.ts 添加

interface UserState {
  // ... 现有字段
  tokenExpiresAt?: number; // token 过期时间戳
}

state: (): UserState => ({
  // ... 现有初始值
  tokenExpiresAt: 0
})

async login(nickname: string, password: string) {
  const res = await api.post("/api/user/login", { nickname, password })
  if (res.code === 200 && res.data) {
    this.token = res.data.token
    this.isLoggedIn = true
    this.userId = res.data.userId
    this.nickname = res.data.nickname
    this.points = res.data.points || 0
    
    // 记录 token 过期时间 (假设后端返回 expiresIn 为秒数)
    const expiresIn = res.data.expiresIn || 86400 // 默认 24 小时
    this.tokenExpiresAt = Date.now() + expiresIn * 1000
    
    uni.setStorageSync("user_token", res.data.token)
    uni.setStorageSync("user_info", JSON.stringify({
      userId: res.data.userId,
      nickname: res.data.nickname,
      points: res.data.points,
      token: res.data.token,
      expiresAt: this.tokenExpiresAt
    }))
    return true
  }
  throw new Error(res.message || "登录失败")
}

// 检查 token 是否有效
isTokenValid(): boolean {
  if (!this.token || !this.tokenExpiresAt) return false
  return Date.now() < this.tokenExpiresAt
}
```

### 安全措施 3: 请求签名验证

```typescript
// src/api/signature.ts

import crypto from 'crypto' // 或使用其他加密库

export function generateSignature(
  method: string,
  url: string,
  data: any,
  secret: string,
  timestamp: number
): string {
  const signStr = `${method}${url}${JSON.stringify(data)}${timestamp}${secret}`
  return crypto.createHash('sha256').update(signStr).digest('hex')
}

// src/api/index.ts 中使用
const SECRET = import.meta.env.VITE_API_SECRET || 'your-secret-key'

export function request<T = any>(options: RequestOptions) {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = generateSignature(
    options.method || 'GET',
    options.url,
    options.data,
    SECRET,
    timestamp
  )
  
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Timestamp': timestamp.toString(),
    'X-Signature': signature
  }
  
  // ... 后续请求逻辑
}
```

---

## 调试技巧

### 技巧 1: 在控制台查看登录状态

```typescript
// 在浏览器控制台执行

// 查看 store 状态
console.log(uni.$store?.state?.user)

// 或通过 Pinia DevTools 查看
console.log(uni.$pinia)

// 查看本地存储
console.log({
  token: uni.getStorageSync('user_token'),
  userInfo: uni.getStorageSync('user_info')
})

// 模拟登出
uni.removeStorageSync('user_token')
uni.removeStorageSync('user_info')
```

### 技巧 2: 监听 API 响应

```typescript
// src/api/index.ts 中添加

export function request<T = any>(options: RequestOptions) {
  return new Promise((resolve, reject) => {
    // ... 

    success: (res: any) => {
      const data = res.data as ApiResponse<T>
      
      // 添加详细日志
      console.log(`[API ${options.method || 'GET'}] ${options.url}`)
      console.log('Request:', options.data)
      console.log('Response:', data)
      
      if (data.code === 401) {
        console.warn('❌ 未登录或 token 已过期')
        uni.navigateTo({ url: "/pages/login/index" })
        reject(new Error("未登录"))
      } else {
        resolve(data)
      }
    }
  })
}
```

### 技巧 3: 使用网络拦截工具

在开发时使用浏览器的网络面板:

1. 打开浏览器开发者工具 (F12)
2. 切换到 "Network" 标签页
3. 观察 API 请求的:
   - 请求头 (查看 Authorization)
   - 响应头 (查看 CORS)
   - 响应体 (查看错误信息)

### 技巧 4: 模拟登录/登出

```typescript
// 快速模拟登出
function mockLogout() {
  uni.removeStorageSync('user_token')
  uni.removeStorageSync('user_info')
  location.reload()
}

// 快速模拟登录 (开发调试)
function mockLogin() {
  const mockToken = 'mock_token_' + Date.now()
  const mockUser = {
    userId: 1,
    nickname: 'TestUser',
    points: 100,
    token: mockToken
  }
  
  uni.setStorageSync('user_token', mockToken)
  uni.setStorageSync('user_info', JSON.stringify(mockUser))
  location.reload()
}

// 在控制台执行: mockLogin() 或 mockLogout()
```

---

## 📋 总结清单

集成登录功能时的检查清单:

- [ ] 已导入 `useUserStore`
- [ ] 已在 `onShow` 中调用 `userStore.init()`
- [ ] 已正确使用 `api.get/post` 第二参数 `needAuth`
- [ ] 已在未登录状态下提供登录入口
- [ ] 已处理 401 错误和网络异常
- [ ] 已在小程序中测试存储功能
- [ ] 已添加适当的加载状态提示
- [ ] 已实现退出登录功能
- [ ] 生产环境已配置正确的 API_BASE_URL
- [ ] 已启用 HTTPS 传输

