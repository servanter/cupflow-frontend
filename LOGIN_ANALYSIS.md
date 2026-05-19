# CupFlow 前端项目 - 登录认证系统分析报告

## 📋 项目概览
- **项目名称**: cupflow-frontend
- **技术栈**: UniApp + Vue3 + Pinia + TypeScript  
- **框架版本**: UniApp 3.0+, Vue 3.4.21, Pinia 2.1.7
- **运行平台**: H5 (web) 和 微信小程序
- **API 地址**: `http://localhost:3000` (可通过 `VITE_API_BASE_URL` 环境变量配置)

---

## 🔐 1. 登录相关文件

### 📄 登录页面
**路径**: `src/pages/login/index.vue`

**功能特性**:
- 登录/注册 Tab 切换
- 用户名(昵称) + 密码输入
- 注册时需要确认密码（密码一致性验证）
- 表单验证: 检查必填项和密码一致性
- 成功后跳转回上一页 (`uni.navigateBack()`)

**核心代码片段**:
```typescript
const userStore = useUserStore();
const isLogin = ref(true);
const form = ref({ nickname: "", password: "", confirmPassword: "" });

const handleSubmit = async () => {
  if (!form.value.nickname || !form.value.password) {
    uni.showToast({ title: "请填写完整", icon: "none" });
    return;
  }

  if (!isLogin.value && form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: "两次密码不一致", icon: "none" });
    return;
  }

  try {
    if (isLogin.value) {
      await userStore.login(form.value.nickname, form.value.password);
    } else {
      await userStore.register(form.value.nickname, form.value.password);
    }
    uni.showToast({ title: isLogin.value ? "登录成功" : "注册成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (err: any) {
    uni.showToast({ title: err.message || "操作失败", icon: "none" });
  }
};
```

---

## 🏪 2. 状态管理 (Pinia Store)

### 📄 用户状态存储
**路径**: `src/store/user.ts`

**状态接口定义**:
```typescript
interface UserState {
  isLoggedIn: boolean;  // 登录状态
  token: string;        // 认证令牌
  userId: number;       // 用户ID
  nickname: string;     // 用户昵称
  points: number;       // 用户积分
}
```

**核心方法**:

#### ① `init()` - 应用启动时初始化
- 从本地存储读取 token 和用户信息
- 恢复登录态
```typescript
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
  }
}
```

#### ② `login(nickname, password)` - 登录
- 调用 `/api/user/login` API
- 响应 code 为 200 时保存 token 和用户信息到本地存储
```typescript
async login(nickname: string, password: string) {
  const res = await api.post("/api/user/login", { nickname, password });
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
  throw new Error(res.message || "登录失败");
}
```

#### ③ `register(nickname, password)` - 注册
- 调用 `/api/user/register` API
- 与登录流程类似，但初始积分为 0
```typescript
async register(nickname: string, password: string) {
  const res = await api.post("/api/user/register", { nickname, password });
  if (res.code === 200 && res.data) {
    // 同 login 方法
    this.token = res.data.token;
    this.isLoggedIn = true;
    this.userId = res.data.userId;
    this.nickname = res.data.nickname;
    this.points = 0;
    uni.setStorageSync("user_token", res.data.token);
    uni.setStorageSync("user_info", JSON.stringify(res.data));
    return true;
  }
  throw new Error(res.message || "注册失败");
}
```

#### ④ `logout()` - 登出
- 清空状态值
- 删除本地存储的 token 和用户信息
```typescript
logout() {
  this.isLoggedIn = false;
  this.token = "";
  this.userId = 0;
  this.nickname = "";
  this.points = 0;
  uni.removeStorageSync("user_token");
  uni.removeStorageSync("user_info");
}
```

---

## 🌐 3. API 请求封装

### 📄 API 配置文件
**路径**: `src/api/index.ts`

**特点**:
- 统一的 API 基础配置
- 支持授权认证 (Authorization header)
- 自动处理 401 未登录响应
- 统一错误处理

**核心代码**:

```typescript
// API 基础配置 - 生产环境请修改为实际域名
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// 获取存储的token
function getToken(): string {
  return uni.getStorageSync("user_token") || "";
}

// 封装请求方法
interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  needAuth?: boolean;  // 是否需要授权
}

interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const header: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // 如果需要授权，添加 Bearer Token
    if (options.needAuth) {
      const token = getToken();
      if (token) {
        header["Authorization"] = `Bearer ${token}`;
      }
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header,
      success: (res: any) => {
        const data = res.data as ApiResponse<T>;
        if (data.code === 401) {
          // 未登录，跳转登录页
          uni.navigateTo({ url: "/pages/login/index" });
          reject(new Error("未登录"));
        } else {
          resolve(data);
        }
      },
      fail: (err: any) => {
        uni.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
}

// 快捷方法
export const api = {
  get: <T = any>(url: string, needAuth = false) => 
    request<T>({ url, method: "GET", needAuth }),
  post: <T = any>(url: string, data: any, needAuth = false) => 
    request<T>({ url, method: "POST", data, needAuth }),
  put: <T = any>(url: string, data: any, needAuth = false) => 
    request<T>({ url, method: "PUT", data, needAuth }),
  delete: <T = any>(url: string, needAuth = false) => 
    request<T>({ url, method: "DELETE", needAuth }),
};
```

**使用示例**:
```typescript
// 需要认证的请求
await api.get("/api/user/profile", true);

// 不需要认证的请求
await api.post("/api/user/login", { nickname, password });
```

---

## 🛣️ 4. 路由配置

### 📄 页面路由
**路径**: `src/pages.json`

**登录相关配置**:
```json
{
  "path": "pages/login/index",
  "style": {
    "navigationBarTitleText": "登录注册"
  }
}
```

**当前登录状态下会访问的 API**:
- `GET /api/user/profile` - 获取用户个人资料（在 `pages/user/index.vue` 中）

**路由跳转方式**:
```typescript
// 非 TabBar 页面，使用 navigateTo
uni.navigateTo({ url: "/pages/login/index" });

// 返回上一页
uni.navigateBack();
```

---

## 👤 5. 个人中心页面集成

### 📄 个人中心实现
**路径**: `src/pages/user/index.vue`

**登录态检查**:
```typescript
onShow(() => {
  userStore.init();  // 刷新登录状态
  if (userStore.isLoggedIn) {
    fetchProfile();  // 获取个人资料
  }
});

const fetchProfile = async () => {
  const res = await api.get("/api/user/profile", true);
  if (res.code === 200) profile.value = res.data;
};
```

**未登录显示**:
- 欢迎文案
- 功能介绍卡片
- "登录/注册" 按钮

**已登录显示**:
- 用户头像 (昵称首字)
- 昵称 + 积分 + 排名
- 快捷功能入口 (竞猜/关注/排行榜)
- 关注列表预览
- 竞猜记录预览
- 退出登录按钮

---

## 🔍 6. 微信登录集成分析

### ❌ 目前**没有微信登录**相关代码

**查询结果**:
- 搜索关键词: `wechat`, `微信`, `oauth`, `WeChat` - 无结果
- 未找到微信开放平台 SDK 集成
- 未找到 OAuth 认证流程

**可扩展方向**:
1. 调用微信 login API 获取 code
2. 将 code 发送到后端交换 token
3. 后端验证微信服务器，返回用户信息和 token
4. 前端保存 token 到本地存储

---

## 💾 7. 本地存储机制

### 存储的数据
```
user_token        → Token 字符串 (用于 API 认证)
user_info         → JSON 字符串，包含:
  {
    userId: number,
    nickname: string,
    points: number,
    token: string
  }
```

### 存储位置
- **H5**: `localStorage`
- **微信小程序**: `wx.setStorageSync` 对应的本地存储

### 清空存储
- 调用 `userStore.logout()` 时自动清除

---

## 🔄 8. 认证流程图

```
┌─────────────────────────────────────────────────────────────┐
│ App 启动                                                     │
├─────────────────────────────────────────────────────────────┤
│ 1. main.ts 初始化 Vue + Pinia                               │
│ 2. App.vue onLaunch hook                                     │
│ 3. 各页面 onShow 时调用 userStore.init()                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
        ┌──────────────────────────────────────┐
        │ 检查 localStorage 中是否有 token      │
        └──────────────────────────────────────┘
                 │                  │
          ✓ 有  │                  │ ✗ 无
                 │                  │
                 ↓                  ↓
        ┌─────────────────┐  ┌──────────────────┐
        │ 恢复登录状态    │  │ 保持未登录状态   │
        │ (isLoggedIn=true)│  │ (isLoggedIn=false)│
        └─────────────────┘  └──────────────────┘
                 │                  │
                 └──────────┬────────┘
                            ↓
                   ┌─────────────────────┐
                   │ 用户进行操作         │
                   └─────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ↓               ↓               ↓
      需要登录      点击login页      访问需认证的API
            │               │               │
            ↓               ↓               ↓
    ┌────────────────┐  ┌─────────────┐  ┌──────────────┐
    │跳转到登录页    │  │输入昵称密码 │  │自动添加token │
    │                │  │             │  │到header      │
    └────────────────┘  └─────┬───────┘  └──────┬───────┘
                               │                 │
                               ↓                 ↓
                        ┌─────────────┐  ┌──────────────┐
                        │POST login   │  │code=401?     │
                        │/register API│  └──┬───────┬───┘
                        └──────┬──────┘     ↓       ↓
                               │        是  跳转  否
                               │        登录页  继续
                               ↓
                        ┌──────────────┐
                        │保存token和   │
                        │用户信息到    │
                        │localStorage  │
                        └──────────────┘
                               │
                               ↓
                        ┌──────────────┐
                        │更新store状态 │
                        │返回上一页    │
                        └──────────────┘
```

---

## 📌 9. API 端点汇总

| 端点 | 方法 | 是否需认证 | 说明 |
|------|------|----------|------|
| `/api/user/login` | POST | ✗ | 登录 |
| `/api/user/register` | POST | ✗ | 注册 |
| `/api/user/profile` | GET | ✓ | 获取个人资料 |
| `/api/user/follows?teamId=xxx` | DELETE | ✓ | 取消关注球队 |

---

## 🚀 10. 启动流程

### H5 开发服务
```bash
npm run dev:h5
```
- Vite 启动开发服务器 (默认端口 5173)
- 自动连接到 `http://localhost:3000` API 服务

### 微信小程序开发
```bash
npm run dev:mp-weixin
```
- 使用微信开发者工具打开生成的小程序代码
- 同样连接到后端 API

---

## ⚠️ 11. 安全性考虑

### 当前实现
✓ Token 存储在本地存储中  
✓ Bearer Token 认证方式  
✓ 401 响应自动跳转登录页  
✓ 表单验证 (前端)

### 建议改进
⚠️ Token 过期时间管理 (目前未见实现)  
⚠️ 刷新 token 机制 (目前未见实现)  
⚠️ HTTPS 传输 (生产环境必须)  
⚠️ 密码加密传输 (建议使用 HTTPS 自动加密)  
⚠️ XSS 防护 (UniApp 已默认处理)

---

## 📦 项目文件结构

```
cupflow-frontend/
├── src/
│   ├── api/
│   │   └── index.ts              # API 请求封装
│   ├── store/
│   │   └── user.ts               # 用户状态管理 (Pinia)
│   ├── pages/
│   │   ├── login/
│   │   │   └── index.vue         # 登录/注册页面
│   │   ├── user/
│   │   │   └── index.vue         # 个人中心页面
│   │   ├── my-follows/
│   │   ├── my-guesses/
│   │   └── ... (其他页面)
│   ├── App.vue                   # 根组件
│   ├── main.ts                   # 应用入口
│   └── pages.json                # UniApp 路由配置
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📝 总结

CupFlow 项目的登录认证系统采用了简洁的设计:

1. **前端登录页面**: Vue 3 + UniApp 构建，支持登录和注册
2. **状态管理**: Pinia 管理用户登录态和信息
3. **API 封装**: 统一的 request 函数，支持 Bearer Token 认证
4. **本地存储**: 使用 UniApp 的 setStorageSync 持久化 token
5. **路由保护**: 401 响应自动跳转登录页

**当前没有微信登录实现**，可根据需求后续集成。

