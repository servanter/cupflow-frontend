# CupFlow Frontend - Comprehensive Project Overview

## 1. PROJECT STRUCTURE

```
cupflow-frontend/
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── package-lock.json
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── CLAUDE.md                  # Project documentation
├── .gitignore
├── .git/                      # Git repository
│
└── src/                       # Main source code (188KB)
    ├── main.ts                # App initialization
    ├── App.vue                # Root component
    ├── env.d.ts               # TypeScript type definitions
    │
    ├── api/
    │   └── index.ts           # Centralized API client
    │
    ├── store/
    │   └── user.ts            # Pinia user state store
    │
    ├── pages/                 # 18 pages (tabBar + non-tabBar)
    │   ├── index/
    │   │   └── index.vue      # Home page (tabBar)
    │   ├── news/
    │   │   └── index.vue      # News list (tabBar)
    │   ├── news-detail/
    │   │   └── index.vue      # News detail
    │   ├── guess/
    │   │   └── index.vue      # Betting/Guess (tabBar)
    │   ├── highlights/
    │   │   └── index.vue      # Highlights (tabBar)
    │   ├── highlight-detail/
    │   │   └── index.vue      # Highlight detail
    │   ├── user/
    │   │   └── index.vue      # User profile (tabBar)
    │   ├── my-follows/
    │   │   └── index.vue      # My followed teams
    │   ├── my-guesses/
    │   │   └── index.vue      # My guesses history
    │   ├── login/
    │   │   └── index.vue      # Login/Register
    │   ├── schedule/
    │   │   └── index.vue      # All matches schedule
    │   ├── teams/
    │   │   └── index.vue      # All teams
    │   ├── team-detail/
    │   │   └── index.vue      # Team detail
    │   ├── player-detail/
    │   │   └── index.vue      # Player detail
    │   ├── match-live/
    │   │   └── index.vue      # Live match updates
    │   ├── rank/
    │   │   └── index.vue      # User rankings
    │   ├── standings/
    │   │   └── index.vue      # Group standings
    │   └── champion/
    │       └── index.vue      # Champion prediction
    │
    └── static/
        └── tab/               # TabBar icons (48x48px PNGs)
            ├── home.png
            ├── home-active.png
            ├── news.png
            ├── news-active.png
            ├── guess.png
            ├── guess-active.png
            ├── highlight.png
            ├── highlight-active.png
            ├── user.png
            └── user-active.png
```

## 2. TECHNOLOGY STACK

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Vue | 3.4.21 |
| **Cross-platform** | UniApp | 3.0.0-5000720260410001 |
| **State Management** | Pinia | 2.1.7 |
| **Language** | TypeScript | 5.3.3 |
| **Build Tool** | Vite | 5.2.0 |
| **Package Manager** | npm | (lockfile present) |

### Key Features:
- **UniApp** - Cross-platform framework supporting:
  - H5 (web)
  - MP-Weixin (WeChat mini-program)
  - App+ (native apps)
- **Vue 3 Composition API** - Modern reactive patterns
- **TypeScript** - Full type safety
- **SSR Support** - Server-side rendering capable

## 3. KEY CONFIGURATION FILES

### package.json
```json
{
  "name": "cupflow-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev:h5": "uni",                    // H5 dev server on :5173
    "build:h5": "uni build",            // Build for web
    "dev:mp-weixin": "uni -p mp-weixin",// WeChat mini-program dev
    "build:mp-weixin": "uni build -p mp-weixin"
  },
  "dependencies": {
    "@dcloudio/uni-*": "3.0.0-*",       // UniApp core packages
    "pinia": "2.1.7",                   // State management
    "vue": "^3.4.21"                    // Vue framework
  }
}
```

### tsconfig.json
- **Target**: ESNext
- **Module**: ESNext (bundler module resolution)
- **Strict mode**: Enabled
- **Path alias**: `@/*` → `src/*`
- **JSX**: preserve (for Vue)
- **Source maps**: Enabled for debugging

### vite.config.ts
```typescript
- Uses @dcloudio/vite-plugin-uni for UniApp compilation
- Path alias: @ → src/
- No additional webpack config needed
```

## 4. MAIN ENTRY POINTS & INITIALIZATION

### src/main.ts (App Bootstrap)
```typescript
// Creates Vue SSR app with Pinia store
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);
  return { app };
}
```

### src/App.vue (Root Component)
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
  font-family: system fonts...
}
</style>
```

### index.html (HTML Entry)
- Basic HTML5 template
- App div: `<div id="app">`
- Script loader: `/src/main.ts`
- SSR placeholders: <!--preload-links-->, <!--app-context-->, <!--app-html-->

## 5. ROUTING & NAVIGATION

### TabBar Configuration (5 Tabs)
Implemented via UniApp pages configuration. 5 main pages with tabBar:
1. **首页 (Home)** - `pages/index/index.vue`
2. **资讯 (News)** - `pages/news/index.vue`
3. **竞猜 (Guess)** - `pages/guess/index.vue`
4. **精彩 (Highlights)** - `pages/highlights/index.vue`
5. **我的 (User)** - `pages/user/index.vue`

### Navigation Patterns
```typescript
// For TabBar pages: use switchTab
uni.switchTab({ url: "/pages/guess/index" });

// For non-TabBar pages: use navigateTo
uni.navigateTo({ url: `/pages/match-live/index?id=${matchId}` });

// Go back
uni.navigateBack();

// Pass query params
// Retrieve: currentPage.$page?.options?.id || currentPage.options?.id
```

### Page Hierarchy
```
TabBar Pages (5)
├── Home (index)
│   ├── → Match Live (match-live)
│   ├── → All Schedule (schedule)
│   ├── → All Teams (teams) → Team Detail (team-detail) → Player Detail (player-detail)
│   ├── → Player Detail (player-detail)
│   └── → Highlights/Rank/Standings/Champion (via quick links)
├── News (news)
│   └── → News Detail (news-detail)
├── Guess (guess)
│   └── → (accepts POST requests)
├── Highlights (highlights)
│   └── → Highlight Detail (highlight-detail)
│       └── → Match Live (match-live)
└── User (user) [Requires login]
    ├── → My Follows (my-follows)
    ├── → My Guesses (my-guesses)
    ├── → Login (login)
    └── → (Profile menu links)

Other Pages:
├── Login (login)
├── Schedule (schedule) - Detailed match list with filters
├── Teams (teams) - All teams grouped by continent
├── Team Detail (team-detail)
├── Player Detail (player-detail)
├── Match Live (match-live) - 15s auto-refresh, comments
├── Rank (rank) - User rankings
├── Standings (standings) - Group standings
└── Champion (champion) - Champion prediction voting
```

## 6. PAGES & COMPONENTS OVERVIEW

### Page Patterns (All use `<script setup lang="ts">`)

#### A. Home Page (index/index.vue)
- **Sections**:
  1. Hero banner (2026 FIFA World Cup)
  2. Upcoming matches (horizontal scroll, 5 next matches)
  3. Hot teams (horizontal scroll, 6 teams preview)
  4. Top scorers (vertical list, 5 players)
  5. Quick entry buttons (4 emoji shortcuts)
- **API Calls**:
  - `GET /api/matches/today` - Upcoming matches
  - `GET /api/teams` - All teams (slice first 6)
  - `GET /api/players/top-scorers?limit=5` - Top scorers
- **Navigation**: `uni.navigateTo()` or `uni.switchTab()`
- **Lifecycle**: `onMounted()` + `userStore.init()`

#### B. News Page (news/index.vue)
- **Features**:
  - Filter bar with 5 tags (scroll-x)
  - News card list with cover, title, summary, tag, date
  - Video badge indicator
- **Tags**: 经典回顾, 球星故事, 历届盘点, 转会动态, 战术解析
- **API**: `GET /api/news?tag={tag}`
- **Styling**: Tag-specific colors via CSS classes

#### C. Login Page (login/index.vue)
- **Features**:
  - Toggle between login/register mode
  - Form: nickname, password, (confirmPassword for register)
  - Validation: nickname required, password ≥6 chars
- **Integration**: `useUserStore()` for login/register actions
- **Flow**: Submit → userStore action → success → navigateBack()

#### D. User Profile (user/index.vue)
- **States**:
  - Not logged in: Show login button
  - Logged in: User info + menu + follows + guesses
- **Sections**:
  1. User header (avatar = nickname[0], nickname, points, rank)
  2. Quick menu (guess, follow teams, rankings)
  3. My follows preview (first 2, with "查看全部" link)
  4. My guesses preview (first 2, with "查看全部" link)
  5. Logout button
- **API**: `GET /api/user/profile` (inferred)
- **Lifecycle**: `onShow()` instead of `onMounted()` to refresh on tabBar switch
- **Data Refresh**: Automatic when tab is shown

#### E. Schedule Page (schedule/index.vue)
- **Features**:
  - Stage tabs (小组赛/32强/16强/8强/半决赛/决赛)
  - Group filter (A-L)
  - Match cards with: date, time, flags, team names, score, status
- **Display**: Grid or list showing all matches for selected stage/group

#### F. Teams Page (teams/index.vue)
- **Features**:
  - Grouped by continent
  - Grid display with flag + name + continent
  - Clickable to team-detail

#### G. Match Live (match-live/index.vue)
- **Features**:
  - Auto-refresh every 15 seconds
  - Match info display
  - Live comment section
  - Like/heart button
- **API**: Polling pattern

#### H. News Detail (news-detail/index.vue)
- **Features**:
  - Cover image (large)
  - Embedded Bilibili video iframe (H5) or link copy (App)
  - Article summary
  - Full content/body

#### I. Highlights Detail (highlight-detail/index.vue)
- **Features**:
  - Match info
  - Video link
  - Text live link
  - Classification badges

#### J. Other Pages
- **my-follows**: Vertical list of followed teams with unfollow button
- **my-guesses**: Historical guesses with status (✓ correct, ✗ wrong, ⏳ pending)
- **player-detail**: Player stats and info
- **team-detail**: Team info with follow button
- **rank**: Leaderboard of users by points
- **standings**: Group stage points table
- **champion**: Team voting interface for champion prediction
- **guess**: Betting interface (3-column progress bar layout)

## 7. STATE MANAGEMENT (PINIA)

### Store Structure

#### src/store/user.ts
**Store Name**: `useUserStore()`

**State**:
```typescript
interface UserState {
  isLoggedIn: boolean;      // Auth status
  token: string;            // JWT/bearer token
  userId: number;           // User ID
  nickname: string;         // Display name
  points: number;           // Loyalty points
}
```

**Actions**:
- `init()` - Restore state from localStorage on app launch
  - Checks `user_token` and `user_info` (JSON)
- `login(nickname, password)` - POST login, set state + storage
  - Endpoint: `POST /api/user/login`
  - Stores: `user_token`, `user_info` (JSON)
- `register(nickname, password)` - POST register, set state + storage
  - Endpoint: `POST /api/user/register`
- `logout()` - Clear state and storage

**Persistence**:
- Token: `uni.getStorageSync("user_token")`
- Info: `uni.getStorageSync("user_info")` (JSON object)

**Usage Pattern**:
```typescript
import { useUserStore } from "@/store/user";
const userStore = useUserStore();

// Check logged in
if (userStore.isLoggedIn) { ... }

// Get user data
console.log(userStore.nickname, userStore.points);

// Login
await userStore.login("user", "pass123");
```

## 8. API INTEGRATION PATTERNS

### Centralized API Client (src/api/index.ts)

**Base URL Configuration**:
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
```
- Environment variable: `VITE_API_BASE_URL`
- Fallback: `http://localhost:3000`

**Request Function**:
```typescript
function request<T>(options: RequestOptions): Promise<ApiResponse<T>>
// Options: { url, method, data, needAuth }
// Response: { code, message?, data? }
```

**Response Format**:
```typescript
interface ApiResponse<T> {
  code: number;        // 200 success, 401 unauthorized, etc.
  message?: string;    // Error message
  data?: T;            // Actual payload
}
```

**Error Handling**:
- Code 401: Auto-redirect to login page
- Network error: Show "网络错误" toast
- Response error: Reject promise

**Authentication**:
- Stored token from `getStorageSync("user_token")`
- Header: `Authorization: Bearer {token}` (if `needAuth: true`)
- Opt-in per request basis

**HTTP Methods**:
```typescript
api.get<T>(url, needAuth?) → Promise<ApiResponse<T>>
api.post<T>(url, data, needAuth?) → Promise<ApiResponse<T>>
api.put<T>(url, data, needAuth?) → Promise<ApiResponse<T>>
api.delete<T>(url, needAuth?) → Promise<ApiResponse<T>>
```

**API Endpoints Used** (inferred from code):
```
GET  /api/matches/today           - Upcoming matches
GET  /api/teams                   - All teams
GET  /api/players/top-scorers     - Top scorers
GET  /api/news?tag={tag}          - News list (optional tag filter)
POST /api/user/login              - User login
POST /api/user/register           - User registration
GET  /api/user/profile            - User profile (follows, guesses, stats)
GET  /api/user/follows            - Followed teams
GET  /api/user/guesses            - Guess history
POST /api/guess                   - Submit a guess
POST /api/user/follow/{teamId}    - Follow team (inferred)
POST /api/user/unfollow/{teamId}  - Unfollow team (inferred)
POST /api/champion-vote           - Vote for champion
GET  /api/highlights              - Highlights list
GET  /api/rank                    - User rankings
GET  /api/standings               - Group standings
```

**Request Lifecycle**:
1. Call `api.get()`, `api.post()`, etc.
2. Adds auth header if `needAuth: true`
3. Makes `uni.request()` call
4. Parses response as `ApiResponse<T>`
5. If code 401 → navigate to login
6. Otherwise → resolve with full response

## 9. UI/STYLING CONVENTIONS

### Design System
- **Primary Color**: `#1a73e8` (blue)
- **Background**: `#f5f5f5` (light gray)
- **Text Primary**: `#333`
- **Text Secondary**: `#666`
- **Border**: `#e8e8e8`

### Unit System
- **rpx** - Responsive pixel (UniApp default, 750px = 100%)
- Example: `30rpx` = responsive 30px
- Converts to actual px based on screen width

### Common Component Patterns

#### Cards
```vue
<view class="section">
  <view class="section-header">
    <text class="section-title">Title</text>
    <text class="section-more">More ></text>
  </view>
  <!-- Content -->
</view>
```

#### Horizontal Scroll
```vue
<scroll-view scroll-x class="match-scroll">
  <view class="match-card" v-for="item in items">
    <!-- Item -->
  </view>
</scroll-view>
```

#### List Items
```vue
<view class="list">
  <view class="item" v-for="item in items">
    <!-- Content -->
  </view>
</view>
```

### Scoped Styles
- All components use `<style scoped>` for isolation
- No global CSS conflicts
- Component-specific color schemes (e.g., `tag-0`, `tag-1`, `tag-2` for news tags)

## 10. NOTABLE PATTERNS & CONVENTIONS

### 1. **Composition API with Setup**
```typescript
<script setup lang="ts">
import { ref, onMounted } from "vue";
const data = ref([]);
onMounted(() => { fetchData(); });
</script>
```
- No `<script>` setup boilerplate needed
- Reactive refs for state
- Direct function binding to templates

### 2. **UniApp Lifecycle Hooks**
```typescript
// Prefer onShow() for tabBar pages to refresh on tab switch
onShow(() => {
  fetchData(); // Runs every time tab becomes visible
});

// onMounted() runs once on page creation
onMounted(() => {
  initData();
});

// onLaunch() runs on app startup
onLaunch(() => {
  console.log("App started");
});
```

### 3. **Navigation Differentiation**
```typescript
// TabBar pages (5 pages)
uni.switchTab({ url: "/pages/index/index" });

// Non-tabBar pages
uni.navigateTo({ url: "/pages/news-detail/index?id=123" });

// Back button
uni.navigateBack();
```

### 4. **Date Formatting**
```typescript
const formatMatchDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};
```
- Custom formatter per component
- Returns Chinese date format (e.g., "5月18日")

### 5. **Conditional Navigation**
```typescript
const navigateTo = (url: string) => {
  if (url.includes("guess") || url.includes("news")) {
    uni.switchTab({ url });  // TabBar page
  } else {
    uni.navigateTo({ url });  // Non-tabBar page
  }
};
```
- Smart detection based on URL pattern

### 6. **User Store Initialization**
```typescript
// Home page
onMounted(() => {
  userStore.init();  // Restore from storage
  fetchUpcomingMatches();
});

// User page
onShow(() => {
  userStore.init();
  if (userStore.isLoggedIn) {
    fetchProfile();
  }
});
```
- `init()` always called on relevant pages
- Restores session even after app restart

### 7. **List Previews with "See All" Link**
```typescript
// Show first 2 items, link to full page
const previewFollows = computed(() => 
  (profile.value.follows || []).slice(0, 2)
);

// In template
<view v-if="profile.follows.length > 2">
  <text @tap="navigateTo('/pages/my-follows/index')">
    查看全部关注 ({{ profile.follows.length }})
  </text>
</view>
```

### 8. **Computed Selectors**
```typescript
const statusClass = (status: string) => {
  if (status === "进行中") return "status-live";
  if (status === "已结束") return "status-end";
  return "status-upcoming";
};
```
- Used for dynamic CSS class binding
- Centralized status logic

### 9. **Async Error Handling**
```typescript
try {
  await userStore.login(nickname, password);
  uni.showToast({ title: "登录成功", icon: "success" });
  setTimeout(() => uni.navigateBack(), 1000);
} catch (err: any) {
  uni.showToast({ title: err.message || "失败", icon: "none" });
}
```
- Try-catch pattern
- Toast for user feedback
- Delayed navigation for feedback

### 10. **Flexible Image Display**
```vue
<image 
  v-if="item.cover_url"
  :src="item.cover_url"
  class="card-cover"
  mode="aspectFill"
/>
```
- Conditional rendering for optional images
- Mode: `aspectFit`, `aspectFill`, etc.

### 11. **Badge/Status Indicators**
```vue
<text class="match-status" :class="statusClass(match.status)">
  {{ match.status }}
</text>
```
- Dynamic class + dynamic text
- CSS classes: `status-live`, `status-end`, `status-upcoming`

### 12. **Form Validation**
```typescript
if (!form.value.nickname || !form.value.password) {
  uni.showToast({ title: "请填写完整", icon: "none" });
  return;
}

if (!isLogin.value && form.value.password !== form.value.confirmPassword) {
  uni.showToast({ title: "两次密码不一致", icon: "none" });
  return;
}
```
- Pre-submit validation
- Toast-based error messages
- Simple patterns (required, match)

### 13. **Tab Selection Pattern**
```typescript
const currentTag = ref("");

const filterTag = (tag: string) => {
  currentTag.value = tag;
  fetchNews();  // Re-fetch with new tag
};

<!-- In template -->
<text 
  :class="{ active: currentTag === tag }" 
  @tap="filterTag(tag)"
>
  {{ tag }}
</text>
```
- State tracks current selection
- Active class for visual feedback
- Auto-refetch on change

## 11. BUILD & DEPLOYMENT

### Development Servers
```bash
npm run dev:h5           # H5 web: http://localhost:5173
npm run dev:mp-weixin    # WeChat mini-program
```

### Build Commands
```bash
npm run build:h5         # Production H5 build
npm run build:mp-weixin  # Production WeChat build
```

### Environment Configuration
```
VITE_API_BASE_URL=http://api.example.com npm run build:h5
```
- Override default API endpoint via env var
- Useful for staging/production deployments

### Output Targets
- **H5**: Web browser (responsive)
- **MP-Weixin**: WeChat mini-program
- **App+**: Native iOS/Android (via UniApp compilation)

## 12. TYPE SAFETY & TYPESCRIPT

### Type Definitions
- **env.d.ts**: Vue component module types
- **tsconfig.json**: Strict mode enabled
- **Generic API responses**: `ApiResponse<T>`
- **Pinia state interface**: `UserState`

### No Third-party Type Issues
- UniApp types from `@dcloudio/types`
- Vue 3 types built-in
- Pinia types included
- Node types from `@types/node`

## 13. PROJECT HEALTH

### File Count
- 25 total files (src + config)
- 18 page components
- 1 root component
- 1 API client
- 1 store module
- Total size: ~188KB (src/)

### Code Quality
- ✅ TypeScript (strict mode)
- ✅ Scoped styles (no conflicts)
- ✅ Composition API (modern Vue)
- ✅ SSR ready (createSSRApp)
- ✅ Pinia store (scalable state)
- ✅ Centralized API (DRY principle)
- ✅ Error handling (try-catch, toasts)
- ✅ Form validation (pre-submit)

### Documentation
- ✅ CLAUDE.md exists (comprehensive)
- ✅ Inline comments in code
- ✅ Clear naming conventions
- ✅ Consistent patterns

## 14. KNOWN CONSIDERATIONS

1. **No Hard-coded API Calls**: All use centralized `api` module
2. **No Global State Pollution**: Only `userStore` in Pinia (scalable)
3. **No CSS Conflicts**: All styles are scoped
4. **Type Safety**: Full TypeScript coverage
5. **Mobile-First**: Uses rpx units for responsive design
6. **Cross-Platform**: UniApp handles H5 and WeChat mini-program
7. **Auth Pattern**: Bearer token in Authorization header
8. **Error Handling**: 401 auto-redirect, network error toasts
9. **UI Consistency**: Card-based layouts, icon buttons, scrollable sections
10. **Performance**: Computed properties for derived state, proper lifecycle hooks

---

## Summary

**cupflow-frontend** is a well-structured **UniApp + Vue 3 + TypeScript** cross-platform web/mini-program application for FIFA World Cup coverage and predictions. It demonstrates:

- **Modern Frontend Stack**: Vue 3 Composition API, TypeScript strict mode
- **Clean Architecture**: Centralized API, Pinia store, component isolation
- **Type Safety**: Full TypeScript with strict compiler settings
- **Responsive Design**: RPX units for mobile-first approach
- **Platform Support**: H5 (web) and MP-Weixin (WeChat mini-program)
- **User Features**: Authentication, guessing, team following, live updates, rankings
- **Best Practices**: Error handling, form validation, proper lifecycle hooks, DRY principles

The codebase is production-ready with clear conventions and scalable architecture.
