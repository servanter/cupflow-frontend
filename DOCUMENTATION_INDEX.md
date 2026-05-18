# CupFlow Frontend - Documentation Index

Welcome! This project has comprehensive documentation. Here's where to start:

## 📚 Documentation Files

### 1. **QUICK_REFERENCE.md** ⭐ START HERE
**Best for:** Quick lookups, onboarding, common patterns
- At-a-glance overview
- Development commands
- Authentication flow
- Navigation rules
- Component patterns
- Configuration details
- Debugging tips

**Read this first (5-10 minutes)**

---

### 2. **PROJECT_OVERVIEW.md** 
**Best for:** Deep understanding of the entire project
- Complete project structure
- Technology stack breakdown
- Configuration files explained
- Entry points & initialization
- All 18 pages described
- State management (Pinia)
- API integration patterns
- UI/styling conventions
- Notable patterns & conventions
- Build & deployment

**Read this for comprehensive knowledge (20-30 minutes)**

---

### 3. **ARCHITECTURE.md**
**Best for:** Understanding data flow and system design
- Application architecture diagram
- State management architecture
- API integration layer diagram
- Data flow examples (login, etc.)
- Page navigation flow
- Authentication & route protection
- Lifecycle timing by page type

**Read this to understand "how it all works together" (15-20 minutes)**

---

### 4. **CLAUDE.md**
**Original project documentation - maintained by team**
- Tech stack
- Startup commands
- API configuration
- Page checklist
- State management overview
- Completed optimizations
- Important notes

**Reference for original project setup**

---

## 🚀 Quick Start Path

### I'm new to this project
1. Read **QUICK_REFERENCE.md** (overview)
2. Run `npm install && npm run dev:h5`
3. Explore pages in your browser at http://localhost:5173
4. Read **ARCHITECTURE.md** (understand the structure)

### I need to add a new page
1. Check **QUICK_REFERENCE.md** → Component Pattern section
2. Copy structure from similar page in `src/pages/`
3. Reference **PROJECT_OVERVIEW.md** → Pages & Components Overview
4. Use API patterns from **PROJECT_OVERVIEW.md** → API Integration

### I need to understand authentication
1. **QUICK_REFERENCE.md** → Authentication Flow
2. **ARCHITECTURE.md** → Data Flow Example: User Login
3. **PROJECT_OVERVIEW.md** → State Management (PINIA)

### I need to debug something
1. **QUICK_REFERENCE.md** → Debugging Tips
2. **ARCHITECTURE.md** → relevant diagram
3. **PROJECT_OVERVIEW.md** → detailed section

### I'm deploying to production
1. **QUICK_REFERENCE.md** → Quick Start (build commands)
2. **PROJECT_OVERVIEW.md** → Build & Deployment section
3. Set `VITE_API_BASE_URL` environment variable to your API server

---

## 📖 By Use Case

### Want to understand a specific page?
→ Search **PROJECT_OVERVIEW.md** for the page name
- Explains what it does
- Shows key features
- Lists API calls
- Describes navigation patterns

### Want to understand state management?
→ **PROJECT_OVERVIEW.md** → Section 7: STATE MANAGEMENT (PINIA)
- State structure
- Available actions
- Persistence mechanism
- Usage examples

### Want to understand API patterns?
→ **PROJECT_OVERVIEW.md** → Section 8: API INTEGRATION PATTERNS
- Base URL configuration
- Request function signature
- Response format
- Error handling
- All endpoints list
- Request lifecycle

### Want to understand navigation?
→ **ARCHITECTURE.md** → Page Navigation Flow diagram
→ **QUICK_REFERENCE.md** → Navigation Rules

### Want to understand authentication?
→ **ARCHITECTURE.md** → Authentication & Route Protection
→ **QUICK_REFERENCE.md** → Authentication Flow
→ **PROJECT_OVERVIEW.md** → State Management

### Want to understand styling/UI?
→ **PROJECT_OVERVIEW.md** → Section 9: UI/STYLING CONVENTIONS
- Design system colors
- Unit system (rpx)
- Component patterns
- Scoped styles approach

---

## 🎯 Key Concepts

### Framework Choice
- **UniApp**: Cross-platform (H5 web + WeChat mini-program)
- **Vue 3**: Modern reactive framework with Composition API
- **TypeScript**: Full type safety with strict mode
- **Vite**: Lightning-fast build tool

### Architecture Layers
```
UI Layer          → 18 page components (Vue SFCs)
State Layer       → Pinia store (user authentication)
API Layer         → Centralized client with error handling
Transport Layer   → uni.request() (UniApp abstraction)
Backend API       → REST endpoints on localhost:3000
Persistence       → localStorage (browser/app storage)
```

### Key Files
```
src/
├── api/index.ts              ← All HTTP requests flow through here
├── store/user.ts             ← Authentication state & actions
├── pages/*/index.vue         ← 18 page components
├── App.vue                   ← Root component
└── main.ts                   ← App bootstrap with Pinia
```

### Development Flow
1. Write page component in `src/pages/*/index.vue`
2. Use `api.get()` / `api.post()` for data fetching
3. Store auth state in `useUserStore()`
4. Navigate with `uni.switchTab()` or `uni.navigateTo()`
5. All styles are scoped (no conflicts)

---

## ❓ FAQ

**Q: How do I add a new page?**
A: Create `src/pages/mypage/index.vue` following the pattern in QUICK_REFERENCE.md

**Q: How do I make an API call?**
A: Use `api.get()` or `api.post()` - see API Integration section

**Q: How do I check if user is logged in?**
A: Use `userStore.isLoggedIn` from `useUserStore()`

**Q: How do I handle authentication?**
A: Pinia store handles it. See STATE MANAGEMENT section

**Q: What's the difference between switchTab and navigateTo?**
A: switchTab() for TabBar pages, navigateTo() for others - see Navigation Rules

**Q: How do I deploy?**
A: Set `VITE_API_BASE_URL` and run `npm run build:h5`

**Q: Where are styles?**
A: In `<style scoped>` blocks in each component - all scoped, no conflicts

**Q: How do I use a state variable?**
A: Use `const data = ref([])` in script setup

---

## 🔗 External Resources

- **UniApp**: https://uniapp.dcloud.io/
- **Vue 3**: https://vuejs.org/
- **Pinia**: https://pinia.vuejs.org/
- **Vite**: https://vitejs.dev/
- **Backend Repo**: https://github.com/servanter/cupflow-backend

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Framework | UniApp + Vue 3 |
| Language | TypeScript (strict) |
| Pages | 18 components |
| State Management | Pinia |
| Size (src/) | 188KB |
| Build Tool | Vite 5.2.0 |
| Platforms | H5 (web) + MP-Weixin (WeChat) |
| Dev Port | 5173 |
| API Base | localhost:3000 (configurable) |

---

## 🎓 Learning Path

**5 minutes:**
- Read: QUICK_REFERENCE.md
- Know: Basic commands, architecture overview

**30 minutes:**
- Read: PROJECT_OVERVIEW.md
- Understand: All pages, API patterns, state management

**1 hour:**
- Read: ARCHITECTURE.md
- Understand: Data flows, lifecycle, auth flow

**2+ hours:**
- Explore: Actual code in `src/pages/`
- Practice: Run dev server, click around
- Modify: Edit a page component and see changes

---

## ✅ Checklist for New Contributors

- [ ] Read QUICK_REFERENCE.md
- [ ] Run `npm install`
- [ ] Run `npm run dev:h5`
- [ ] Open http://localhost:5173
- [ ] Explore all 5 TabBar pages
- [ ] Read PROJECT_OVERVIEW.md for your assigned page
- [ ] Read ARCHITECTURE.md to understand data flow
- [ ] Ask questions before coding
- [ ] Follow component pattern from QUICK_REFERENCE.md
- [ ] Always use centralized API (src/api/index.ts)
- [ ] Write tests if adding complex logic
- [ ] Update CLAUDE.md if adding new pages

---

**Last Updated:** May 18, 2026
**Documentation Version:** 1.0.0

For questions, refer to the specific section or check the actual code in `src/`.
