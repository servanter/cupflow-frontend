# CupFlow 登录流程 - 快速参考

## 🎯 核心概念

### 三种登录跳转触发方式

#### 1. **API 自动拦截（被动）**
- **位置**：`src/api/index.ts` 第 43-46 行
- **触发**：后端返回 `code: 401`
- **代码**：
```typescript
if (data.code === 401) {
  uni.navigateTo({ url: "/pages/login/index" });
  reject(new Error("未登录"));
}
```
- **适用**：所有调用 `needAuth=true` 的 API 的页面

#### 2. **业务主动检查（主动）**
- **位置**：各页面的事件处理函数
- **触发**：用户执行需要登录的操作（投票、关注等）
- **代码示例**：
```typescript
const submitGuess = async (matchId: number, choice: string) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  // ... 继续业务逻辑
};
```
- **使用页面**：
  - `pages/guess/index.vue` - 竞猜投票
  - `pages/champion/index.vue` - 冠军预测
  - `pages/team-detail/index.vue` - 关注球队
  - `pages/user/index.vue` - 登录按钮

#### 3. **用户主动点击登录**
- **位置**：登录按钮的 click 事件
- **代码**：
```typescript
const goLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};
```

---

## 📁 关键文件速查表

| 文件 | 作用 | 关键代码 |
|------|------|--------|
| `src/store/user.ts` | 登录状态管理 | `useUserStore()`、`isLoggedIn` |
| `src/api/index.ts` | API 请求 + 401 拦截 | `request()`、`code === 401` |
| `src/pages/login/index.vue` | 登录页面 | `userStore.login()`、`userStore.wxLogin()` |
| `src/pages/user/index.vue` | 个人中心（展示/未登录判断） | `v-if="!userStore.isLoggedIn"` |
| `src/pages/index/index.vue` | 首页（初始化用户） | `userStore.init()` |
| `src/utils/navigate.ts` | 页面跳转工具 | `goPage()`（自动选择 switchTab/navigateTo） |

---

## 🔄 完整登录流程

### H5 版本（账号密码）

```
1. 用户点击"登录"按钮 → navigateTo("/pages/login/index")
2. 显示登录表单
3. 用户输入昵称 + 密码
4. 点击"登 录"按钮 → handleSubmit()
5. 调用 userStore.login(nickname, password)
6. POST /api/user/login → 后端验证
7. 后端返回 { code: 200, data: { token, userId, ... } }
8. 保存到 localStorage：
   - user_token = "eyJ..."
   - user_info = { userId, nickname, ... }
9. userStore.isLoggedIn = true
10. uni.navigateBack() → 返回上一页
11. 页面刷新时调用 userStore.init() → 从 localStorage 恢复状态
```

### 微信版本（授权登录）

```
1. 用户点击"微信授权登录"按钮 → handleWxLogin()
2. 检查隐私政策勾选框（必须）
3. 调用 uni.login() → 获取临时 code
4. 调用 userStore.wxLogin(code)
5. POST /api/user/wechat-login { code } → 后端验证 + 服务器签名
6. 后端返回 { code: 200, data: { token, userId, ... } }
7. 保存到 localStorage
8. userStore.isLoggedIn = true
9. uni.redirectTo("/pages/edit-profile/index?mode=first") → 跳转完善资料页
10. 用户补充昵称和头像后返回首页
```

---

## 💾 本地存储

### 存储位置
```javascript
localStorage["user_token"] = "eyJhbGc..." // JWT token
localStorage["user_info"] = JSON.stringify({
  userId: 123,
  nickname: "张三",
  points: 100,
  avatarUrl: "/uploads/avatar.jpg"
})
```

### 初始化时机
- **时机 1**：App 启动时（❌ 目前缺失，只在首页 onMounted 时）
- **时机 2**：首页加载时 → `userStore.init()`
- **时机 3**：个人中心页面切换时 → `onShow()` 时调用 `userStore.init()`

---

## 🔐 用户状态流转

### Pinia Store 状态字段

```typescript
interface UserState {
  isLoggedIn: boolean;  // 是否已登录
  token: string;        // JWT token
  userId: number;       // 用户 ID
  nickname: string;     // 昵称
  points: number;       // 积分
  avatarUrl: string;    // 头像 URL
}
```

### 初始状态
```typescript
{
  isLoggedIn: false,
  token: "",
  userId: 0,
  nickname: "",
  points: 0,
  avatarUrl: "",
}
```

### 登录后状态
```typescript
{
  isLoggedIn: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  userId: 123,
  nickname: "张三",
  points: 100,
  avatarUrl: "/uploads/avatar.jpg",
}
```

---

## 🛑 登出流程

```typescript
const handleLogout = () => {
  userStore.logout();  // 清空所有状态 + 删除 localStorage
  profile.value = {};
  uni.showToast({ title: "已退出登录", icon: "success" });
};
```

### logout() 做的事
1. 清空所有状态字段
2. 删除 `localStorage["user_token"]`
3. 删除 `localStorage["user_info"]`
4. 下次 `userStore.init()` 时会重新初始化为未登录状态

---

## ⚠️ 常见错误

### ❌ 错误 1：跳转到登录页用了 switchTab

```javascript
// 错误做法
uni.switchTab({ url: "/pages/login/index" });  // ❌ Login 不是 TabBar 页

// 正确做法
uni.navigateTo({ url: "/pages/login/index" });  // ✅ navigateTo
```

### ❌ 错误 2：关键 API 忘记加 needAuth=true

```javascript
// 错误做法
const res = await api.get("/api/user/profile");  // ❌ 缺少第二个参数

// 正确做法
const res = await api.get("/api/user/profile", true);  // ✅ true 表示需要认证
```

### ❌ 错误 3：在需要登录的操作中没有检查

```vue
<!-- 错误做法 -->
<view @tap="submitGuess(matchId, 'home')">投票</view>

<!-- 正确做法 -->
<view @tap="handleVote(matchId)">投票</view>

<script>
const handleVote = (matchId) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  submitGuess(matchId, 'home');
};
</script>
```

---

## 🧪 测试登录流程

### 测试 Case 1：首次使用（未登录）

1. 清空浏览器存储：`localStorage.clear()`
2. 刷新页面
3. 验证：`userStore.isLoggedIn === false`
4. 验证：个人中心显示登录提示
5. 点击"登录"按钮
6. 进入登录页面
7. 输入任意昵称 + 密码
8. 点击"登 录"
9. 登录成功后返回首页
10. 验证：`userStore.isLoggedIn === true`

### 测试 Case 2：关闭应用后再打开（已登录）

1. 完成"测试 Case 1"
2. 关闭应用（或刷新页面）
3. 再次打开应用
4. **验证**：首页加载时自动调用 `userStore.init()`
5. **验证**：从 localStorage 恢复 token 和 userInfo
6. **验证**：`userStore.isLoggedIn === true`
7. **验证**：个人中心显示用户信息

### 测试 Case 3：Token 过期（API 返回 401）

1. 登录后获得 token
2. 修改 localStorage 中的 token（改成无效值）
3. 点击需要认证的操作（如"去竞猜"）
4. API 返回 401
5. **验证**：自动跳转到登录页面
6. **验证**：后端返回 401 时，API 层自动触发跳转（无需业务代码处理）

### 测试 Case 4：未登录时进行需要认证的操作

1. 清空登录状态：`localStorage.clear()`
2. 进入竞猜页面
3. 点击"投票"按钮
4. **验证**：在 `submitGuess()` 中检查 `isLoggedIn`
5. **验证**：自动跳转到登录页
6. **验证**：这是业务层主动检查（不是 API 401 拦截）

### 测试 Case 5：关注球队

1. 进入任意球队详情页
2. 点击"+ 关注"按钮
3. 如果未登录：跳转到登录页
4. 如果已登录：调用 `api.post("/api/user/follows", ...)`

---

## 📊 API 端点汇总

### 认证相关

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/user/login` | 账号密码登录 |
| POST | `/api/user/register` | 用户注册 |
| POST | `/api/user/wechat-login` | 微信授权登录 |

### 需要认证（needAuth=true）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/user/profile` | 获取用户信息 |
| GET | `/api/user/follows` | 获取关注列表 |
| POST | `/api/user/follows` | 添加关注 |
| DELETE | `/api/user/follows` | 取消关注 |
| GET | `/api/guess/{matchId}` | 获取竞猜数据 |
| POST | `/api/guess/{matchId}` | 提交竞猜 |
| POST | `/api/vote/champion` | 投票冠军 |
| GET | `/api/subscribe` | 获取订阅提醒 |

### 无需认证

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/banners` | 获取 Banner |
| GET | `/api/matches` | 获取比赛列表 |
| GET | `/api/teams` | 获取球队列表 |
| GET | `/api/teams/{id}` | 获取球队详情 |
| GET | `/api/vote/champion` | 获取冠军投票数据 |

---

## 🔍 调试技巧

### 查看当前登录状态

```javascript
// 浏览器控制台
const userStore = useUserStore();
console.log(userStore.isLoggedIn);     // true/false
console.log(userStore.token);          // JWT token
console.log(userStore.nickname);       // 昵称
```

### 查看本地存储

```javascript
// 浏览器控制台
console.log(localStorage["user_token"]);
console.log(JSON.parse(localStorage["user_info"]));
```

### 清除登录状态

```javascript
// 浏览器控制台
localStorage.clear();
location.reload();
```

### 模拟 401 响应

在 `src/api/index.ts` 中添加临时调试代码：

```typescript
if (data.code === 401 || (options.url === "/api/user/profile" && !getToken())) {
  console.log("⚠️ 检测到 401 或无认证信息，即将跳转到登录页");
  uni.navigateTo({ url: "/pages/login/index" });
  reject(new Error("未登录"));
}
```

