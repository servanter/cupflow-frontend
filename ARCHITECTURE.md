# CupFlow Frontend - Architecture & Data Flow Diagrams

## 📊 Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VITE DEV SERVER (5173)                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     index.html                            │  │
│  │                  (HTML Entry Point)                       │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   src/main.ts                             │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ createApp()                                        │  │  │
│  │  │  ├─ createSSRApp(App)                             │  │  │
│  │  │  ├─ createPinia()                                 │  │  │
│  │  │  └─ app.use(pinia)                                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   src/App.vue                            │  │
│  │              (Root Component)                            │  │
│  │                                                          │  │
│  │  onLaunch hook:                                         │  │
│  │  └─ Initialize app state                               │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ↓                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Page Components (18 total)                  │  │
│  │                                                          │  │
│  │  TabBar Pages (5):                                      │  │
│  │  ├─ Home (index)      ┐                                │  │
│  │  ├─ News (news)       ├─ Always visible bottom nav     │  │
│  │  ├─ Guess (guess)     │                                │  │
│  │  ├─ Highlights        │                                │  │
│  │  └─ User (user)       ┘                                │  │
│  │                                                          │  │
│  │  Nested Pages (13):                                     │  │
│  │  ├─ news-detail, highlight-detail                      │  │
│  │  ├─ match-live, schedule, teams                        │  │
│  │  ├─ team-detail, player-detail                         │  │
│  │  ├─ my-follows, my-guesses                             │  │
│  │  ├─ login, rank, standings, champion                   │  │
│  │  └─ ...                                                │  │
│  │                                                          │  │
│  │  All pages follow: <template> + <script setup> + <style> │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ↓                           ↓
        ┌──────────────┐          ┌──────────────┐
        │ Backend API  │          │ localStorage │
        │ (localhost   │          │ (Persistent  │
        │  :3000)      │          │  State)      │
        └──────────────┘          └──────────────┘
```

## 🔄 State Management Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      PINIA STORE                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │           useUserStore()                             │ │
│  │                                                      │ │
│  │  State:                                             │ │
│  │  ├─ isLoggedIn: boolean                             │ │
│  │  ├─ token: string        (JWT)                      │ │
│  │  ├─ userId: number                                  │ │
│  │  ├─ nickname: string                                │ │
│  │  └─ points: number                                  │ │
│  │                                                      │ │
│  │  Actions:                                           │ │
│  │  ├─ init()                                          │ │
│  │  │  └─ Load from localStorage                       │ │
│  │  ├─ login(nickname, password)                       │ │
│  │  │  ├─ POST /api/user/login                        │ │
│  │  │  └─ Save token + info                            │ │
│  │  ├─ register(nickname, password)                    │ │
│  │  │  ├─ POST /api/user/register                     │ │
│  │  │  └─ Save token + info                            │ │
│  │  └─ logout()                                        │ │
│  │     ├─ Clear state                                  │ │
│  │     └─ Remove from localStorage                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  Persistence Layer:                                        │
│  └─ localStorage:                                         │
│     ├─ "user_token"  → JWT token (string)               │
│     └─ "user_info"   → User data (JSON)                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
                         ↑
            ┌────────────┴────────────┐
            │                         │
        ┌───────────┐          ┌──────────────┐
        │Components │          │Local Storage │
        │(read)     │          │ (persist)    │
        └───────────┘          └──────────────┘
```

## 🌐 API Integration Layer

```
┌────────────────────────────────────────────────────────────────┐
│                   src/api/index.ts                             │
│                 (Centralized API Client)                       │
│                                                                 │
│  Configuration:                                                │
│  └─ BASE_URL = env.VITE_API_BASE_URL || "http://localhost:3000"
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ request<T>(options): Promise<ApiResponse<T>>           │   │
│  │                                                        │   │
│  │ Input:                                                │   │
│  │ ├─ url: string                                        │   │
│  │ ├─ method?: "GET"|"POST"|"PUT"|"DELETE"              │   │
│  │ ├─ data?: any                                         │   │
│  │ └─ needAuth?: boolean                                 │   │
│  │                                                        │   │
│  │ Processing:                                           │   │
│  │ ├─ Add headers:                                       │   │
│  │ │  ├─ "Content-Type": "application/json"              │   │
│  │ │  └─ "Authorization": "Bearer {token}" (if auth)     │   │
│  │ ├─ Call uni.request()                                 │   │
│  │ └─ Parse ApiResponse<T>                               │   │
│  │                                                        │   │
│  │ Response Handling:                                    │   │
│  │ ├─ code 200        → resolve(data)                    │   │
│  │ ├─ code 401        → navigate to login                │   │
│  │ ├─ network error   → show toast + reject              │   │
│  │ └─ other errors    → reject                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Exported Methods:                                             │
│  ├─ api.get<T>(url, needAuth?)                                │
│  ├─ api.post<T>(url, data, needAuth?)                         │
│  ├─ api.put<T>(url, data, needAuth?)                          │
│  └─ api.delete<T>(url, needAuth?)                             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
                         ↓ uni.request()
                         │
        ┌────────────────┴─────────────────┐
        │                                  │
    ┌───────────────┐            ┌──────────────────┐
    │   Success     │            │ Error Handler    │
    │  (code: 200)  │            │ (401/network)    │
    │      │        │            │      │           │
    │      ↓        │            │      ↓           │
    │  Return data  │            │ Toast + Redirect │
    │      │        │            │      │           │
    └──────┼────────┘            └──────┼───────────┘
           │                            │
           └────────────┬───────────────┘
                        ↓
                   Components
```

## 📄 Data Flow Example: User Login

```
User Interface
        │
        ↓
┌─────────────────────────────────────────┐
│  pages/login/index.vue                  │
│                                         │
│  1. User fills form:                    │
│     ├─ nickname (v-model)               │
│     └─ password (v-model)               │
│                                         │
│  2. Click submit button                 │
│     ├─ Pre-submit validation            │
│     └─ Call handleSubmit()              │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  handleSubmit()                         │
│  ├─ Validate fields exist               │
│  └─ Call userStore.login()              │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  useUserStore.login(nickname, password) │
│                                         │
│  1. POST /api/user/login                │
│     └─ { nickname, password }           │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  api.post("/api/user/login", data)      │
│                                         │
│  1. Add header:                         │
│     └─ "Content-Type": "application/json"
│                                         │
│  2. Call uni.request()                  │
│     └─ Method: POST                     │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  Backend API (http://localhost:3000)    │
│                                         │
│  POST /api/user/login                   │
│  ├─ Validate credentials                │
│  ├─ Generate JWT token                  │
│  └─ Return { code, data }               │
└────────────┬────────────────────────────┘
             │
             ↓ Response
┌─────────────────────────────────────────┐
│  Response:                              │
│  {                                      │
│    code: 200,                           │
│    data: {                              │
│      token: "jwt...",                   │
│      userId: 123,                       │
│      nickname: "user",                  │
│      points: 0                          │
│    }                                    │
│  }                                      │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  Update Pinia Store                     │
│  ├─ token = res.data.token              │
│  ├─ isLoggedIn = true                   │
│  ├─ userId = res.data.userId            │
│  ├─ nickname = res.data.nickname        │
│  └─ points = res.data.points            │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  Persist to localStorage                │
│  ├─ setStorageSync("user_token", token) │
│  ├─ setStorageSync("user_info",         │
│  │    JSON.stringify(res.data))         │
│  └─ Show success toast                  │
└────────────┬────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────┐
│  Navigate Back                          │
│  └─ navigateBack()                      │
└─────────────────────────────────────────┘
```

## 📱 Page Navigation Flow

```
                     ┌─────────────────────────┐
                     │   App Start             │
                     │   onLaunch()            │
                     └────────────┬────────────┘
                                  │
                                  ↓
                     ┌─────────────────────────┐
                     │  Home (index)           │
                     │  TabBar Page            │
                     │ ├─ Matches             │
                     │ ├─ Teams               │
                     │ ├─ Scorers             │
                     │ └─ Quick Links         │
                     └────┬──────────┬─────────┘
                          │          │
         ┌────────────────┘│          │
         │                 │          │
         ↓                 ↓          ↓
    [Match Live]    [Schedule]   [Teams] ←─┐
    (match-live)    (schedule)   (teams)    │
         │                │          │      │
         │                └──┬───────┘      │
         │                   │              │
         ↓                   ↓              ↓
    [Comments]        [Team Detail]   switchTab()
                       (team-detail)  (if TabBar page)
                            │
                            ↓
                       [Player Detail]
                       (player-detail)


              News (news) - TabBar Page
                   │
                   ├─ filterTag()
                   │  └─ fetchNews()
                   │
                   ↓
              [News Detail]
              (news-detail)
              ├─ Cover image
              ├─ Video (iframe)
              └─ Content


         Highlights (highlights) - TabBar Page
                   │
                   ├─ filterTag()
                   │
                   ↓
            [Highlight Detail]
            (highlight-detail)
                   │
                   ├─ Video link
                   ├─ Match link
                   └─ → [Match Live]


         Guess (guess) - TabBar (requires auth)
              [Submit Prediction]
                   │
                   └─ [My Guesses] (my-guesses)


         User (user) - TabBar (requires auth)
                   │
        ┌──────────┼──────────┬────────────────┐
        │          │          │                │
        ↓          ↓          ↓                ↓
   [My Follows] [My Guesses] [Rank]      [Standings]
   (my-follows) (my-guesses) (rank)      (standings)
        │                                      │
        └───────────────┬──────────────────────┘
                        │
                        ↓
                   [Champion]
                   (champion)
```

## 🔐 Authentication & Route Protection

```
User Tries to Access Page
        │
        ↓
┌──────────────────────────────┐
│ Check Page Type              │
├──────────────────────────────┤
│ Protected Pages (need auth): │
│ ├─ /pages/guess/            │
│ ├─ /pages/user/             │
│ ├─ /pages/my-follows/       │
│ └─ /pages/my-guesses/       │
│                              │
│ Public Pages:                │
│ └─ All others               │
└──┬───────────────────────────┘
   │
   ├─ If Public         ├─ If Protected
   │                    │
   ↓                    ↓
┌─────────────┐  ┌─────────────────────────────┐
│ Allow Access│  │ Check userStore.isLoggedIn  │
└─────────────┘  └──┬──────────────────┬───────┘
                    │                  │
              Yes (true)           No (false)
                    │                  │
                    ↓                  ↓
            ┌─────────────┐     ┌────────────────┐
            │Allow Access │     │Redirect to    │
            └─────────────┘     │ Login Page    │
                                └────────────────┘
                                      │
                                      ↓
                        ┌──────────────────────────────┐
                        │ User Logs In                 │
                        │ └─ userStore.login()         │
                        │    └─ Store token           │
                        │       & redirect back        │
                        └──────────────────────────────┘
```

## 🔄 Lifecycle Timing by Page Type

```
TabBar Pages (Home, News, Guess, Highlights, User):
└─ onLaunch (app start)
   └─ once
└─ onShow (every tab switch)
   ├─ Page visible again
   ├─ Refresh data
   └─ Multiple times
└─ onHide (tab switched away)
   └─ Cleanup if needed

Non-TabBar Pages (Details, Schedule, etc.):
└─ onMounted (page enter)
   ├─ once per navigation
   └─ Fetch data
└─ onUnmount (page leave)
   └─ Cleanup


Example Flow:
Home (onMounted)
  └─ fetch matches ✓
[User clicks → News Tab]
Home (onHide)
  └─ cleanup
News (onShow - first time)
  └─ fetch news ✓
[News click → News Detail]
News Detail (onMounted)
  └─ fetch article ✓
[Back button]
News Detail (onUnmount)
News (onShow - return from detail)
  └─ data still there (no refetch)
[Switch away from News]
News (onHide)
[Back to News Tab]
News (onShow - from other tab)
  └─ refresh news data (onShow runs again) ✓
```

---

This architecture demonstrates:
- ✅ Clean separation of concerns
- ✅ Centralized state management (Pinia)
- ✅ Consistent API integration layer
- ✅ Proper lifecycle management
- ✅ Scalable page structure
- ✅ Type-safe throughout (TypeScript)
