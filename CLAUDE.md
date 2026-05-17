# CupFlow 世界杯赛事网站 - 前端

## 技术栈
UniApp + Vue3 + Pinia + TypeScript（端口5173）

## 启动命令
```bash
npm run dev:h5        # H5开发
npm run dev:mp-weixin # 微信小程序开发
```

## API 配置
- 环境变量 `VITE_API_BASE_URL`，默认 `http://localhost:3000`
- 统一封装在 `src/api/index.ts`

## 底部 TabBar（5个）
首页 -> 资讯 -> 竞猜 -> 精彩 -> 我的

## 页面清单
| 页面 | 路径 | 功能 |
|---|---|---|
| 首页 | `pages/index` | 最近赛程卡片横滑(5场跨天) + 参赛球队横滑(6支) + 射手榜 + 快捷入口 |
| 足球资讯 | `pages/news` | 标签筛选(经典回顾/球星故事/历届盘点/转会动态/战术解析) + 封面卡片列表 |
| 资讯详情 | `pages/news-detail` | 封面大图/内嵌视频播放器(B站iframe) + 摘要 + 正文 |
| 竞猜投票 | `pages/guess` | 三列进度条样式 |
| 精彩回放 | `pages/highlights` | 分类筛选(进球/扑救/红牌/点球) + 卡片列表 |
| 回放详情 | `pages/highlight-detail` | 比赛信息 + 视频链接 + 文字直播入口 |
| 全部赛程 | `pages/schedule` | 阶段Tab(小组赛/32强/16强/8强/半决赛/决赛) + 按组筛选A-L + 对阵图 |
| 参赛球队 | `pages/teams` | 按大洲分组 + 国旗网格 |
| 球队详情 | `pages/team-detail` | 球队信息 + 关注按钮 |
| 球员详情 | `pages/player-detail` | 球员资料 |
| 文字直播 | `pages/match-live` | 15秒自动刷新 + 评论区 + 点赞 |
| 积分排行 | `pages/rank` | 用户积分排行 |
| 积分榜 | `pages/standings` | 小组赛积分榜 |
| 冠军预测 | `pages/champion` | 球队投票 |
| 个人中心 | `pages/user` | 关注(右上角"去关注") + 竞猜记录(右上角"去竞猜") + onShow刷新 |
| 我的关注 | `pages/my-follows` | 关注列表 |
| 竞猜记录 | `pages/my-guesses` | 竞猜历史 |
| 登录注册 | `pages/login` | 密码至少6位 |

## 状态管理
- `src/store/user.ts` - Pinia，管理登录态/token/昵称

## 已完成的优化
- API地址环境变量化
- tabBar 图标（48x48 透明PNG）
- 首页最近赛程：从今天起取未来5场(跨天)，每张卡片显示X月X日+时间
- 首页参赛球队：横滑展示前6支，右上角"全部球队 >"跳转
- 全部赛程页：对阵图，按组筛选，日期+时间+国旗+比分+状态
- 足球资讯：12条默认数据，5种标签配色，视频内嵌播放
- 个人中心：关注/竞猜底部有"查看全部"，右上角改为"去关注"/"去竞猜"

## 注意事项
- tabBar 页面跳转用 `uni.switchTab`，非tabBar页面用 `uni.navigateTo`
- 详情页参数获取兼容写法: `currentPage.$page?.options?.id || currentPage.options?.id`
- 视频播放H5用iframe嵌入B站播放器，App端复制链接
- 后端仓库: https://github.com/servanter/cupflow-backend
