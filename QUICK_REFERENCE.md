# CupFlow Frontend - Quick Reference Guide

## 🎯 At a Glance

| Aspect | Details |
|--------|---------|
| **Framework** | UniApp + Vue 3 + TypeScript |
| **Build Tool** | Vite 5.2.0 |
| **State Management** | Pinia 2.1.7 |
| **Platforms** | Web (H5) + WeChat Mini-program |
| **Language** | TypeScript (strict mode) |
| **Pages** | 18 pages (5 TabBar + 13 non-TabBar) |
| **Size** | 188KB (src only) |
| **Dev Port** | 5173 (http://localhost:5173) |
| **API Base** | http://localhost:3000 (configurable) |

## 📁 Directory Structure

```
src/
├── api/index.ts              ← Centralized API client
├── store/user.ts             ← Pinia authentication store
├── pages/                    ← 18 page components
│   ├── index/                ← HOME (TabBar)
│   ├── news/                 ← NEWS (TabBar)
│   ├── guess/                ← GUESS (TabBar)
│   ├── highlights/           ← HIGHLIGHTS (TabBar)
│   ├── user/                 ← USER PROFILE (TabBar)
│   └── [13 more pages]       ← Nested/detail pages
├── static/tab/               ← 10 TabBar icons (PNG)
├── App.vue                   ← Root component
├── main.ts                   ← App bootstrap
└── env.d.ts                  ← Type definitions
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development
npm run dev:h5                 # Web dev server
npm run dev:mp-weixin          # WeChat mini-program

# Production build
npm run build:h5               # Web
npm run build:mp-weixin        # WeChat

# With custom API endpoint
VITE_API_BASE_URL=https://api.example.com npm run build:h5
```

## 🎨 Design System

**Colors:**
- Primary: `#1a73e8` (Blue)
- Background: `#f5f5f5` (Light Gray)
- Text: `#333` (Dark), `#666` (Secondary)
- Border: `#e8e8e8`

**Units:**
- `rpx` (responsive pixels) - 750px = 100%
- Scales automatically based on screen width

## 🔐 Authentication Flow

```
1. User fills login form (nickname + password)
   ↓
2. Form validation (required fields, password length)
   ↓
3. Call userStore.login() → POST /api/user/login
   ↓
4. Response: { code: 200, data: { token, userId, nickname, points } }
   ↓
5. Store token + info in localStorage
   ↓
6. Set userStore.isLoggedIn = true
   ↓
7. Redirect back or to dashboard

Logout:
- Clear all state
- Remove from localStorage
- Redirect to home
```

## 📡 API Integration

**Pattern:**
```typescript
import api from "@/api";

// GET request
const res = await api.get<T>("/api/endpoint", needAuth?);

// POST request
const res = await api.post<T>("/api/endpoint", { data }, needAuth?);

// Response structure
interface ApiResponse<T> {
  code: 200 | 401 | 500 | ...,
  message?: string,
  data?: T
}
```

**Auto-handling:**
- 401 → Auto-redirect to login
- Network error → Show toast "网络错误"
- All responses wrapped in Promise

## 🛣️ Navigation Rules

```typescript
// Use switchTab() for TabBar pages
uni.switchTab({ url: "/pages/index/index" });

// Use navigateTo() for non-TabBar pages
uni.navigateTo({ url: "/pages/news-detail/index?id=123" });

// Retrieve query params
const id = currentPage.$page?.options?.id || currentPage.options?.id;

// Go back
uni.navigateBack();
```

**TabBar Pages (5):**
1. `/pages/index/index` - Home
2. `/pages/news/index` - News
3. `/pages/guess/index` - Guess
4. `/pages/highlights/index` - Highlights
5. `/pages/user/index` - User Profile

## 🔄 Lifecycle Hooks

```typescript
// For TabBar pages (refresh on each tab switch)
onShow(() => {
  fetchData();  // Runs every time tab is shown
});

// For non-TabBar or initial setup
onMounted(() => {
  initData();   // Runs once on page creation
});

// App startup
onLaunch(() => {
  initializeApp();
});
```

## 💾 State Management

**Store:** `src/store/user.ts`

**State:**
```typescript
{
  isLoggedIn: boolean,
  token: string,
  userId: number,
  nickname: string,
  points: number
}
```

**Actions:**
- `init()` - Restore from localStorage
- `login(nickname, password)` - User login
- `register(nickname, password)` - User registration
- `logout()` - Clear everything

**Usage:**
```typescript
import { useUserStore } from "@/store/user";
const userStore = useUserStore();

userStore.init();               // On app launch
if (userStore.isLoggedIn) { ... } // Check auth
await userStore.login(...);     // Perform login
userStore.logout();             // Perform logout
```

## 📝 Component Pattern

All pages follow this pattern:

```vue
<template>
  <!-- UI -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import api from "@/api";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const data = ref([]);

onMounted(() => {
  fetchData();
});

const fetchData = async () => {
  const res = await api.get("/api/...");
  if (res.code === 200) {
    data.value = res.data || [];
  }
};

const navigate = () => {
  uni.navigateTo({ url: "/pages/..." });
};
</script>

<style scoped>
/* Component-specific styles */
</style>
```

## 🧪 Common Patterns

### Form Validation
```typescript
if (!form.nickname || !form.password) {
  uni.showToast({ title: "请填写完整", icon: "none" });
  return;
}
```

### List with "See More"
```typescript
const preview = computed(() => data.value.slice(0, 2));
const hasMore = computed(() => data.value.length > 2);
```

### Dynamic CSS Classes
```typescript
const statusClass = (status: string) => {
  if (status === "进行中") return "status-live";
  if (status === "已结束") return "status-end";
  return "status-upcoming";
};
```

### Toast Messages
```typescript
uni.showToast({ 
  title: "Success message", 
  icon: "success"  // or "none", "error"
});
```

### Horizontal Scroll
```vue
<scroll-view scroll-x class="horizontal-list">
  <view v-for="item in items" :key="item.id" class="item">
    {{ item }}
  </view>
</scroll-view>
```

## 📋 Page Features Summary

| Page | Type | Purpose | Auth | Key Features |
|------|------|---------|------|--------------|
| Home | TabBar | Dashboard | No | Match cards, teams, scorers, quick links |
| News | TabBar | News feed | No | Tag filters, card list, video badges |
| Guess | TabBar | Betting | Yes | Prediction voting, progress bars |
| Highlights | TabBar | Clips | No | Category filter, video links |
| User | TabBar | Profile | Yes | User info, follows, guesses, logout |
| Schedule | Regular | All matches | No | Stage/group tabs, match details |
| Teams | Regular | Team list | No | Continent grouping, team grid |
| Login | Regular | Auth | No | Toggle login/register, form validation |
| Match Live | Regular | Live updates | No | 15s refresh, comments, likes |
| News Detail | Regular | Article | No | Cover, video (iframe), content |

## 🔧 Configuration Files

**package.json:**
- Scripts: `dev:h5`, `build:h5`, `dev:mp-weixin`, `build:mp-weixin`
- Dependencies: Vue 3.4.21, Pinia 2.1.7, UniApp 3.0.0-*
- Dev dependencies: TypeScript, Vite, vue-tsc

**tsconfig.json:**
- Target: ESNext
- Module: ESNext
- Strict: true
- Path alias: `@/*` → `src/*`

**vite.config.ts:**
- Plugin: `@dcloudio/vite-plugin-uni`
- Alias: `@` → `src/`

## ⚠️ Important Notes

1. **Always use centralized API**: All requests through `src/api/index.ts`
2. **Authentication context**: Check `userStore.isLoggedIn` before using user features
3. **Navigation type matters**: `switchTab()` for TabBar, `navigateTo()` for others
4. **Lifecycle timing**: Use `onShow()` for TabBar pages, `onMounted()` for others
5. **Token management**: Auto-handled by store, persisted in localStorage
6. **Error handling**: 401 auto-redirects to login, network errors show toast
7. **TypeScript strict**: All code must pass strict type checking
8. **Scoped styles**: All styles are component-scoped (no globals)

## 🐛 Debugging Tips

```typescript
// Check auth state
console.log(userStore.isLoggedIn, userStore.token);

// Check API response
const res = await api.get("/api/...");
console.log(res.code, res.data);

// Log page lifecycle
onMounted(() => console.log("Page mounted"));
onShow(() => console.log("Page shown"));

// Check localStorage (dev tools)
uni.getStorageSync("user_token");
JSON.parse(uni.getStorageSync("user_info"));
```

## 📚 Related Resources

- Backend repo: https://github.com/servanter/cupflow-backend
- UniApp docs: https://uniapp.dcloud.io/
- Vue 3 docs: https://vuejs.org/
- Pinia docs: https://pinia.vuejs.org/
- Vite docs: https://vitejs.dev/

---

**Last Updated:** May 18, 2026
**Project Version:** 1.0.0
