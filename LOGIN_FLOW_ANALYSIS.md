# CupFlow 前端登录相关文件完整分析报告

## 📋 目录结构
```
/Users/zhanghongyan/ReactProjects/cupflow-frontend/
├── src/
│   ├── pages.json              ✅ 路由配置
│   ├── App.vue                 ✅ 应用启动入口
│   ├── main.ts                 
│   ├── api/
│   │   └── index.ts            ✅ API 请求封装（含登录跳转）
│   ├── store/
│   │   └── user.ts             ✅ 登录状态管理
│   ├── utils/
│   │   └── navigate.ts         ✅ 页面导航工具
│   └── pages/
│       ├── index/index.vue     ✅ 首页（初始化用户状态）
│       ├── login/index.vue     ✅ 登录页面
│       ├── user/index.vue      ✅ 个人中心（登录判断）
│       ├── guess/index.vue     ✅ 竞猜页面（登录判断）
│       ├── champion/index.vue  ✅ 冠军预测（登录判断）
│       ├── team-detail/index.vue ✅ 球队详情（登录判断）
│       └── my-guesses/index.vue ✅ 竞猜记录（查询权限）
```

---

## 1️⃣ src/pages.json（路由配置）

### 文件内容特点
- **Login 页面配置**（第79-82行）：
  ```json
  {
    "path": "pages/login/index",
    "style": {
      "navigationBarTitleText": "登录注册"
    }
  }
  ```
- **TabBar 配置**（第164-219行）：包含5个 TabBar 页面
  - `pages/index/index` - 首页
  - `pages/news/index` - 资讯（H5）
  - `pages/guess/index` - 竞猜（H5）
  - `pages/highlights/index` - 精彩（H5）
  - `pages/user/index` - 我的（通用）
  - `pages/schedule/index` - 赛程（微信小程序）
  - `pages/teams/index` - 球队（微信小程序）

### 关键信息
✅ Login 页面是**非 TabBar 页面**，需要用 `navigateTo` 跳转
✅ User 页面是 **TabBar 页面**，需要用 `switchTab` 跳转

---

## 2️⃣ src/App.vue（应用启动）

### 完整代码
```vue
<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("CupFlow App Launched");
});
</script>

<style>
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
```

### 分析
⚠️ **关键缺陷**：App.vue 中**没有启动时的登录检查逻辑**！
- 只有一个简单的 `onLaunch` 日志输出
- 没有初始化用户状态
- **用户状态初始化是在首页（pages/index/index.vue）的 onMounted 中进行的**

---

## 3️⃣ src/store/user.ts（用户状态管理）

### 完整代码

```typescript
import { defineStore } from "pinia";
import api from "@/api";

interface UserState {
  isLoggedIn: boolean;
  token: string;
  userId: number;
  nickname: string;
  points: number;
  avatarUrl: string;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    isLoggedIn: false,
    token: "",
    userId: 0,
    nickname: "",
    points: 0,
    avatarUrl: "",
  }),

  actions: {
    // 初始化用户状态（从 localStorage 读取）
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
        this.avatarUrl = info.avatarUrl || "";
      }
    },

    // 账号密码登录
    async login(nickname: string, password: string) {
      const res = await api.post("/api/user/login", { nickname, password });
      if (res.code === 200 && res.data) {
        this.token = res.data.token;
        this.isLoggedIn = true;
        this.userId = res.data.userId;
        this.nickname = res.data.nickname;
        this.points = res.data.points || 0;
        this.avatarUrl = res.data.avatarUrl || "";
        uni.setStorageSync("user_token", res.data.token);
        uni.setStorageSync("user_info", JSON.stringify(res.data));
        return true;
      }
      throw new Error(res.message || "登录失败");
    },

    // 微信登录
    async wxLogin(code: string) {
      const res = await api.post("/api/user/wechat-login", { code });
      if (res.code === 200 && res.data) {
        this.token = res.data.token;
        this.isLoggedIn = true;
        this.userId = res.data.userId;
        this.nickname = res.data.nickname;
        this.points = res.data.points || 0;
        this.avatarUrl = res.data.avatarUrl || "";
        uni.setStorageSync("user_token", res.data.token);
        uni.setStorageSync("user_info", JSON.stringify(res.data));
        return true;
      }
      throw new Error(res.message || "微信登录失败");
    },

    // 注册
    async register(nickname: string, password: string) {
      const res = await api.post("/api/user/register", { nickname, password });
      if (res.code === 200 && res.data) {
        this.token = res.data.token;
        this.isLoggedIn = true;
        this.userId = res.data.userId;
        this.nickname = res.data.nickname;
        this.points = 0;
        this.avatarUrl = "";
        uni.setStorageSync("user_token", res.data.token);
        uni.setStorageSync("user_info", JSON.stringify(res.data));
        return true;
      }
      throw new Error(res.message || "注册失败");
    },

    // 注销登录
    logout() {
      this.isLoggedIn = false;
      this.token = "";
      this.userId = 0;
      this.nickname = "";
      this.points = 0;
      this.avatarUrl = "";
      uni.removeStorageSync("user_token");
      uni.removeStorageSync("user_info");
    },

    // 更新个人信息
    updateProfile(nickname: string, avatarUrl: string) {
      this.nickname = nickname;
      this.avatarUrl = avatarUrl;
      const userInfo = uni.getStorageSync("user_info");
      if (userInfo) {
        const info = JSON.parse(userInfo);
        info.nickname = nickname;
        info.avatarUrl = avatarUrl;
        uni.setStorageSync("user_info", JSON.stringify(info));
      }
    },
  },
});
```

### 关键点
✅ **存储位置**：使用 `uni.setStorageSync("user_token", ...)` 和 `uni.getStorageSync("user_info", ...)`
✅ **状态字段**：`isLoggedIn`、`token`、`userId`、`nickname`、`points`、`avatarUrl`
✅ **核心方法**：
  - `init()` - 应用启动时调用，从本地存储恢复登录状态
  - `login()` - 账号密码登录
  - `wxLogin()` - 微信授权登录
  - `register()` - 注册新账号
  - `logout()` - 注销登录
  - `updateProfile()` - 更新昵称和头像

---

## 4️⃣ src/api/index.ts（API 请求封装 + 登录拦截）

### 完整代码

```typescript
// API 基础配置
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string || "http://localhost:3000").replace(/\/$/, "");

// 获取存储的token
function getToken(): string {
  return uni.getStorageSync("user_token") || "";
}

// 封装请求方法
interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  needAuth?: boolean;
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
        // ✅ 401 状态码处理：未登录，自动跳转到登录页
        if (data.code === 401) {
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
  get: <T = any>(url: string, needAuth = false) => request<T>({ url, method: "GET", needAuth }),
  post: <T = any>(url: string, data: any, needAuth = false) => request<T>({ url, method: "POST", data, needAuth }),
  put: <T = any>(url: string, data: any, needAuth = false) => request<T>({ url, method: "PUT", data, needAuth }),
  delete: <T = any>(url: string, needAuth = false) => request<T>({ url, method: "DELETE", needAuth }),
};

export default api;
```

### 关键分析
🔴 **登录跳转触发机制**：
1. 后端返回 `{ code: 401 }` 状态码
2. API 层自动调用 `uni.navigateTo({ url: "/pages/login/index" })`
3. **不需要业务代码手动检查，完全自动化**

⚠️ **needAuth 参数用途**：
- `true` - 在请求头中添加 `Authorization: Bearer ${token}`
- `false` - 不添加认证信息（默认值）

✅ **环境变量**：
- `VITE_API_BASE_URL` - 从 `.env.development` 或 `.env.production` 读取
- 默认值：`http://localhost:3000`

---

## 5️⃣ src/utils/navigate.ts（页面跳转工具）

### 完整代码

```typescript
/**
 * 跨平台导航工具
 * 自动判断目标页面是否为 TabBar 页，使用正确的跳转方式
 *
 * 微信小程序 TabBar: 首页 / 赛程 / 球队 / 我的
 * H5 TabBar:        首页 / 资讯 / 竞猜 / 精彩 / 我的
 */
export const goPage = (url: string) => {
  const normalizedUrl = url.startsWith("/") ? url : "/" + url;

  let tabPages: string[] = [];
  // #ifdef MP-WEIXIN
  tabPages = [
    "/pages/index/index",
    "/pages/schedule/index",
    "/pages/teams/index",
    "/pages/user/index",
  ];
  // #endif
  // #ifndef MP-WEIXIN
  tabPages = [
    "/pages/index/index",
    "/pages/news/index",
    "/pages/guess/index",
    "/pages/highlights/index",
    "/pages/user/index",
  ];
  // #endif

  if (tabPages.includes(normalizedUrl)) {
    uni.switchTab({ url: normalizedUrl });
  } else {
    uni.navigateTo({ url: normalizedUrl });
  }
};
```

### 关键点
✅ **自动选择跳转方式**：
- TabBar 页面 → `uni.switchTab()`
- 普通页面 → `uni.navigateTo()`

⚠️ **Login 页面跳转方式**：
- Login 不在 TabBar 中，所以总是用 `uni.navigateTo()`
- ❌ **错误做法**：`uni.switchTab({ url: "/pages/login/index" })`
- ✅ **正确做法**：`uni.navigateTo({ url: "/pages/login/index" })`

---

## 6️⃣ 登录相关页面分析

### 📄 src/pages/login/index.vue（登录注册页面）

#### 关键代码块

**非微信版本（H5）：账号密码登录/注册**
```vue
<template>
  <!-- 切换Tab -->
  <view class="tab-bar">
    <view class="tab-item" :class="{ active: isLogin }" @tap="isLogin = true">
      <text>登录</text>
    </view>
    <view class="tab-item" :class="{ active: !isLogin }" @tap="isLogin = false">
      <text>注册</text>
    </view>
  </view>

  <!-- 输入框 -->
  <input v-model="form.nickname" placeholder="请输入昵称" />
  <input v-model="form.password" type="password" placeholder="请输入密码" />
  <input v-if="!isLogin" v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" />

  <!-- 提交按钮 -->
  <view class="submit-btn" @tap="handleSubmit">
    <text>{{ isLogin ? '登 录' : '注 册' }}</text>
  </view>
</template>

<script setup lang="ts">
const isLogin = ref(true);
const form = ref({ nickname: "", password: "", confirmPassword: "" });

const handleSubmit = async () => {
  // 验证
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
      // 登录
      await userStore.login(form.value.nickname, form.value.password);
    } else {
      // 注册
      await userStore.register(form.value.nickname, form.value.password);
    }
    
    uni.showToast({ title: isLogin.value ? "登录成功" : "注册成功", icon: "success" });
    
    // 1 秒后返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (err: any) {
    uni.showToast({ title: err.message || "操作失败", icon: "none" });
  }
};
</script>
```

**微信版本：微信授权登录**
```vue
<template>
  <!-- 隐私政策勾选 -->
  <view class="wx-privacy-check">
    <view class="privacy-row" @tap="togglePrivacy">
      <view class="privacy-checkbox" :class="{ checked: privacyAgreed }">
        <text v-if="privacyAgreed" class="checkbox-tick">✓</text>
      </view>
      <view class="privacy-texts">
        <text>我已阅读并同意</text>
        <text class="privacy-link" @tap.stop="openAgreement">《用户服务协议》</text>
        <text>及</text>
        <text class="privacy-link" @tap.stop="openPrivacy">《隐私政策》</text>
      </view>
    </view>
  </view>

  <!-- 微信登录按钮 -->
  <button
    class="wx-login-btn"
    :class="{ 'wx-login-btn-disabled': !privacyAgreed }"
    @tap="handleWxLogin"
  >
    微信授权登录
  </button>
</template>

<script setup lang="ts">
const wxLoading = ref(false);
const privacyAgreed = ref(false);

const handleWxLogin = async () => {
  if (!privacyAgreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议及隐私政策', icon: 'none', duration: 2000 });
    return;
  }
  
  wxLoading.value = true;
  try {
    // 1. 获取临时登录凭证 code
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: resolve,
        fail: reject,
      });
    });

    // 2. 用 code 登录
    const result = await userStore.wxLogin(loginRes.code);

    uni.showToast({ title: "登录成功", icon: "success" });
    
    // 3. 登录成功后跳转到完善资料页
    setTimeout(() => {
      uni.redirectTo({ url: "/pages/edit-profile/index?mode=first" });
    }, 800);
  } catch (err: any) {
    uni.showToast({ title: err.message || "登录失败，请重试", icon: "none" });
  } finally {
    wxLoading.value = false;
  }
};
</script>
```

#### 总结
✅ **登录流程**：
1. 用户输入昵称 + 密码
2. 点击"登 录"按钮
3. 调用 `userStore.login()` → 发 POST 请求到后端
4. 后端返回 token 和 userInfo
5. 保存到 localStorage
6. `uni.navigateBack()` 返回上一页

✅ **注册流程**：同上，调用 `userStore.register()`

✅ **微信登录流程**：
1. 用户同意隐私政策
2. 点击"微信授权登录"
3. 调用 `uni.login()` 获取临时 code
4. 调用 `userStore.wxLogin(code)` 发 POST 请求
5. 后端返回 token 和 userInfo
6. 跳转到"完善资料"页面（`/pages/edit-profile/index?mode=first`）

---

### 📄 src/pages/index/index.vue（首页 - 用户状态初始化）

#### 关键代码

```vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

onMounted(() => {
  // ✅ 在首页加载时初始化用户状态
  userStore.init();
  fetchBanners();
  fetchUpcomingMatches();
  fetchHotTeams();
  fetchTopScorers();
});
</script>
```

#### 分析
🔴 **关键问题**：
- **只有首页会初始化用户状态**
- 如果用户直接访问其他 TabBar 页面（资讯、竞猜、精彩），用户状态不会被初始化
- 解决方案：应该在 App.vue 的 `onLaunch` 或全局中间件中初始化

---

### 📄 src/pages/user/index.vue（个人中心 - 登录检查）

#### 关键代码块

**未登录状态**
```vue
<template>
  <view v-if="!userStore.isLoggedIn" class="not-login">
    <view class="not-login-header">
      <view class="not-login-bg"></view>
      <view class="not-login-content">
        <view class="avatar-placeholder">
          <text class="avatar-icon">👤</text>
        </view>
        <text class="welcome-text">欢迎来到 CupFlow</text>
        <text class="welcome-desc">登录后解锁更多精彩功能</text>
      </view>
    </view>
    
    <view class="not-login-body">
      <view class="feature-list">
        <!-- 功能列表 -->
      </view>
      <view class="login-btn-wrap" @tap="goLogin">
        <text class="login-btn-text">登录 / 注册</text>
      </view>
    </view>
  </view>

  <!-- 已登录状态 -->
  <view v-else>
    <!-- 用户信息卡片 -->
    <view class="user-header" @tap="goEditProfile">
      <!-- 头像 + 昵称 -->
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @tap="navigateTo('/pages/guess/index')">
        <text class="menu-icon">🎯</text>
        <text class="menu-text">去竞猜</text>
      </view>
      <!-- ... 更多菜单 -->
    </view>
    
    <!-- 我的关注 / 竞猜记录等 -->
  </view>
</template>

<script setup lang="ts">
import { onShow } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

// 使用 onShow 代替 onMounted，TabBar 切换时也能刷新
onShow(() => {
  userStore.init();
  if (userStore.isLoggedIn) {
    fetchProfile();
    fetchReminders();
  }
});

const goLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const handleLogout = () => {
  userStore.logout();
  profile.value = {};
  uni.showToast({ title: "已退出登录", icon: "success" });
};
</script>
```

#### 分析
✅ **实现方式**：
- 使用 `v-if="!userStore.isLoggedIn"` 条件渲染
- 未登录时显示登录提示 + 登录按钮
- 已登录时显示用户信息 + 功能菜单

✅ **使用 onShow**：
- 当从其他页面返回时自动刷新状态
- 确保 TabBar 切换时都能更新数据

---

### 📄 src/pages/guess/index.vue（竞猜页面 - 登录拦截）

#### 关键代码

```vue
<script setup lang="ts">
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

onMounted(() => {
  userStore.init();
  fetchMatches();
});

const submitGuess = async (matchId: number, choice: string) => {
  // ✅ 登录检查
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }

  // 提交竞猜
  const res = await api.post(`/api/guess/${matchId}`, { choice }, true);
  if (res.code === 200) {
    uni.showToast({ title: "竞猜成功！", icon: "success" });
    fetchVoteData(matchId);
  }
};
</script>
```

#### 分析
✅ **主动登录检查**：
- 在 `submitGuess()` 函数中检查 `userStore.isLoggedIn`
- 未登录则调用 `uni.navigateTo()` 跳转到登录页
- 这是**业务层面的主动拦截**，而不是被动的 API 401 拦截

---

### 📄 src/pages/team-detail/index.vue（球队详情 - 登录拦截）

#### 关键代码

```vue
<script setup lang="ts">
const toggleFollow = async () => {
  // ✅ 关注时检查登录状态
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }

  if (isFollowed.value) {
    // 取消关注
    const res = await api.delete(`/api/user/follows?teamId=${teamId.value}`, true);
    if (res.code === 200) {
      isFollowed.value = false;
      uni.showToast({ title: "已取消关注", icon: "success" });
    }
  } else {
    // 添加关注
    const res = await api.post("/api/user/follows", { teamId: Number(teamId.value) }, true);
    if (res.code === 200) {
      isFollowed.value = true;
      uni.showToast({ title: "关注成功", icon: "success" });
    }
  }
};
</script>
```

#### 分析
✅ **关注功能的登录检查**：
- 在 `toggleFollow()` 中检查 `userStore.isLoggedIn`
- 支持已关注用户的取消关注
- 支持未关注用户的关注操作

---

### 📄 src/pages/champion/index.vue（冠军预测 - 登录拦截）

#### 关键代码

```vue
<script setup lang="ts">
const vote = async (teamId: number) => {
  // ✅ 投票时检查登录状态
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }

  const res = await api.post("/api/vote/champion", { teamId }, true);
  if (res.code === 200) {
    uni.showToast({ title: "投票成功！", icon: "success" });
    fetchPredictions();
  } else {
    uni.showToast({ title: res.message || "投票失败", icon: "none" });
  }
};
</script>
```

#### 分析
✅ **投票功能的登录检查**：
- 在 `vote()` 中检查 `userStore.isLoggedIn`
- 支持用户投票冠军球队

---

### 📄 src/pages/my-guesses/index.vue（竞猜记录 - 权限检查）

#### 关键代码

```vue
<script setup lang="ts">
const fetchGuesses = async () => {
  // ✅ 直接调用需要认证的 API
  const res = await api.get("/api/user/profile", true);
  if (res.code === 200) {
    guesses.value = res.data.guesses || [];
  }
  // ⚠️ 如果未登录，API 会返回 401，自动跳转到登录页
};

onShow(() => {
  fetchGuesses();
});
</script>
```

#### 分析
🔴 **权限依赖于 API 响应**：
- 调用 `api.get("/api/user/profile", true)` 时传入 `needAuth = true`
- 如果用户未登录，后端返回 401
- API 层自动调用 `uni.navigateTo({ url: "/pages/login/index" })`

---

## 📊 登录跳转触发逻辑总结

### 触发方式 1️⃣：**API 自动拦截（被动）**

**触发场景**：当 API 响应返回 401 时

**代码位置**：`src/api/index.ts`（第43-46行）

```typescript
if (data.code === 401) {
  uni.navigateTo({ url: "/pages/login/index" });
  reject(new Error("未登录"));
}
```

**流程**：
```
业务代码调用 API
  ↓
API 发送请求（带 token）
  ↓
后端返回 401（token 过期或无效）
  ↓
API 层自动检测 code === 401
  ↓
自动调用 uni.navigateTo("/pages/login/index")
  ↓
页面跳转到登录页
```

**受影响的页面**：
- ✅ `pages/my-guesses/index.vue` - 竞猜记录页
- ✅ `pages/user/index.vue` - 个人中心（获取 profile 信息）
- ✅ 任何调用 `needAuth=true` 的 API 的页面

---

### 触发方式 2️⃣：**业务主动检查（主动）**

**触发场景**：需要用户登录才能执行某个操作时

**代码位置**：各页面的事件处理函数中

```typescript
const submitGuess = async (matchId: number, choice: string) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  // ... 继续业务逻辑
};
```

**流程**：
```
用户点击"登 录"/"去竞猜"/"关注"等按钮
  ↓
页面代码检查 userStore.isLoggedIn
  ↓
如果为 false，主动调用 uni.navigateTo("/pages/login/index")
  ↓
页面跳转到登录页
```

**使用的页面**：
- ✅ `pages/guess/index.vue` - 竞猜投票
- ✅ `pages/champion/index.vue` - 冠军预测
- ✅ `pages/team-detail/index.vue` - 球队详情（关注）
- ✅ `pages/user/index.vue` - 个人中心（登录按钮）

---

### 触发方式 3️⃣：**用户主动点击登录按钮**

**触发场景**：未登录用户看到登录提示时

**代码位置**：
- `pages/user/index.vue` - "登 录 / 注 册"按钮
- `pages/index/index.vue` - 快速入口

```typescript
const goLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};
```

---

## 📈 登录后页面跳转

### 登录成功后的跳转

**H5 版本**：
```typescript
// 在 pages/login/index.vue 中
setTimeout(() => {
  uni.navigateBack();  // 返回登录前的上一页
}, 1000);
```

**微信小程序版本**：
```typescript
// 在 pages/login/index.vue 中
setTimeout(() => {
  uni.redirectTo({ url: "/pages/edit-profile/index?mode=first" });  // 跳转到完善资料页
}, 800);
```

---

## 🔐 本地存储结构

### 存储的数据

```javascript
// 1. Token 存储
localStorage["user_token"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// 2. 用户信息存储
localStorage["user_info"] = JSON.stringify({
  userId: 123,
  nickname: "张三",
  points: 100,
  avatarUrl: "/uploads/avatar.jpg"
})
```

### 读取方式

```typescript
const token = uni.getStorageSync("user_token");
const userInfo = uni.getStorageSync("user_info");
if (token && userInfo) {
  // 用户已登录
  const info = JSON.parse(userInfo);
}
```

---

## ⚠️ 已知问题和建议

### 问题 1️⃣：App 启动时没有初始化用户状态

**当前情况**：
- `App.vue` 中只有 `onLaunch` 日志，没有调用 `userStore.init()`
- 首页加载时才初始化用户状态
- 如果用户从其他页面开始（e.g., 通过分享链接），用户状态不会初始化

**建议解决方案**：
```typescript
// 在 App.vue 中
import { useUserStore } from "@/store/user";

onLaunch(() => {
  const userStore = useUserStore();
  userStore.init();  // ✅ 应用启动时初始化
  console.log("CupFlow App Launched");
});
```

---

### 问题 2️⃣：登录检查分散在各个页面

**当前情况**：
- 竞猜、冠军预测、球队详情等页面都有独立的登录检查
- 代码重复度高

**建议解决方案**：
```typescript
// 创建 src/utils/authGuard.ts
export const requireLogin = (callback: () => void) => {
  const userStore = useUserStore();
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
  } else {
    callback();
  }
};

// 使用方式
const submitGuess = async (matchId: number, choice: string) => {
  requireLogin(async () => {
    const res = await api.post(`/api/guess/${matchId}`, { choice }, true);
    // ...
  });
};
```

---

### 问题 3️⃣：页面导航时没有考虑 TabBar 切换

**当前情况**：
- 某些页面使用 `uni.navigateTo()` 跳转到 TabBar 页面
- 应该使用 `uni.switchTab()` 或 `goPage()`

**已有解决方案**：`src/utils/navigate.ts` 中的 `goPage()` 函数

---

## 📝 完整登录流程图

```
┌─────────────────────────────────────────────────────────────┐
│                    应用启动（App.vue）                        │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ 缺少 userStore.init() - 用户状态未初始化               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
         ┌───────────────────────────────┐
         │  用户访问首页或其他 TabBar 页  │
         └───────────────┬───────────────┘
                         │
          ┌──────────────┴──────────────┐
          ↓                             ↓
    ┌─────────────┐             ┌──────────────┐
    │   首页已    │             │ 其他 TabBar  │
    │  初始化     │             │ 页面无初始化 │
    └────┬────────┘             └──────────────┘
         │
    ┌────┴──────────────────────────────────────┐
    ↓                                            ↓
┌──────────────────────┐          ┌─────────────────────────┐
│  用户已登录           │          │ 用户未登录               │
│  渲染已登录状态       │          │ 渲染登录提示             │
└──────┬───────────────┘          └────────────┬────────────┘
       │                                       │
       │                            ┌──────────┴──────────┐
       │                            ↓                     ↓
       │                    ┌─────────────────┐  ┌─────────────────┐
       │                    │ 用户点击登录    │  │ API 返回 401    │
       │                    │ 按钮            │  │ 自动跳转        │
       │                    └────────┬────────┘  └────────┬────────┘
       │                            │                    │
       │                    ┌───────┴──────────────────┬─┘
       │                    │                          │
       │                    ↓                          ↓
       │            ┌─────────────────────────┐
       │            │ pages/login/index.vue   │
       │            │ 显示登录/注册表单        │
       │            └────────────┬────────────┘
       │                         │
       │            ┌────────────┴────────────┐
       │            ↓                         ↓
       │    ┌──────────────┐        ┌──────────────┐
       │    │ H5 版本      │        │ 微信版本     │
       │    │ 账号+密码    │        │ 授权登录     │
       │    └──────┬───────┘        └──────┬───────┘
       │           │                       │
       │  ┌────────┴──────────┐  ┌────────┴──────────┐
       │  ↓                   ↓  ↓                   ↓
       │  ┌───────────────┐  ┌──────────────────────┐
       │  │ 登 录         │  │ 微信授权登录         │
       │  │ 注 册         │  │ 获取 code           │
       │  └───────┬───────┘  └──────┬───────────────┘
       │          │                  │
       │  ┌───────┴────────────────┬─┘
       │  │                        │
       │  ↓                        ↓
       │  POST /api/user/login       POST /api/user/wechat-login
       │  POST /api/user/register
       │          │                  │
       │          └────────┬─────────┘
       │                   ↓
       │         ┌──────────────────────────┐
       │         │ 后端验证 + 返回 token    │
       │         │ + userInfo              │
       │         └────────┬─────────────────┘
       │                  │
       │          ┌───────┴──────────┐
       │          ↓                  ↓
       │   ┌──────────────┐  ┌───────────────────┐
       │   │ localStorage │  │ userStore.isLogin │
       │   │ 保存 token   │  │ 标记为 true      │
       │   │ + userInfo   │  └────────┬──────────┘
       │   └──────┬───────┘           │
       │          │                   │
       │   ┌──────┴───────────────────┘
       │   │
       │   ↓
       │ ┌─────────────────┐
       │ │ navigateBack()  │ (H5)
       │ │ redirectTo      │ (微信：跳转完善资料)
       │ └────────┬────────┘
       │          │
       └──────────┴──────────────────────────────────┐
                                                     │
                                                     ↓
                                          ┌──────────────────────┐
                                          │ 返回首页或已登录页    │
                                          │ 显示已登录状态        │
                                          └──────────────────────┘
```

---

## 📱 关键 API 端点

### 认证相关
- `POST /api/user/login` - 账号密码登录
- `POST /api/user/register` - 用户注册
- `POST /api/user/wechat-login` - 微信授权登录

### 需要认证的 API（`needAuth=true`）
- `GET /api/user/profile` - 获取用户信息
- `GET /api/user/follows` - 获取关注列表
- `POST /api/user/follows` - 添加关注
- `DELETE /api/user/follows` - 取消关注
- `GET /api/guess/{matchId}` - 获取竞猜数据
- `POST /api/guess/{matchId}` - 提交竞猜
- `POST /api/vote/champion` - 投票冠军
- `GET /api/subscribe` - 获取订阅提醒

### 无需认证的 API
- `GET /api/banners` - 获取 Banner
- `GET /api/matches` - 获取比赛列表
- `GET /api/matches/today` - 获取今日比赛
- `GET /api/teams` - 获取球队列表
- `GET /api/teams/{id}` - 获取球队详情
- `GET /api/players/top-scorers` - 获取射手榜
- `GET /api/vote/champion` - 获取冠军投票数据

