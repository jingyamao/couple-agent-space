# Couple Agent Space — iOS 重构计划

> 创建时间：2026-05-26
> 目标：将当前 Next.js Web 全栈项目重构为 iOS 原生应用，仅供个人使用

---

## 一、重构策略总览

### 核心思路：前后端分离

当前项目是 Next.js 全栈单体（前端页面 + API 路由在同一项目中）。重构到 iOS 需要将架构拆分为：

```
┌─────────────────────┐     ┌──────────────────────┐
│   iOS 原生客户端     │ ──→ │   后端 API 服务       │
│   SwiftUI + Swift    │     │   Next.js (仅 API)    │
│   Xcode 项目         │     │   或独立 Node.js 服务  │
└─────────────────────┘     └──────────────────────┘
                                     │
                              ┌──────┴──────┐
                              │ PostgreSQL  │
                              │ Alibaba OSS │
                              │ DeepSeek AI │
                              │ Amap API    │
                              └─────────────┘
```

**推荐方案**：保留 Next.js 作为 API 服务，仅剥离前端页面。后端代码几乎零改动，所有精力放在 iOS 客户端。

---

## 二、iOS 技术栈选型

| 层级 | 技术选择 | 说明 |
|------|---------|------|
| **UI 框架** | SwiftUI | 声明式 UI，与项目风格高度契合 |
| **语言** | Swift 5.9+ | iOS 原生开发语言 |
| **最低版本** | iOS 17.0 | 支持最新 SwiftUI 特性 |
| **架构模式** | MVVM | 数据绑定 + 业务逻辑分离 |
| **网络层** | URLSession + async/await | 原生方案，无需第三方 |
| **数据缓存** | SwiftData (iOS 17+) | 本地数据缓存，离线支持 |
| **图片缓存** | 自建或 Nuke | 图片加载与缓存 |
| **密钥管理** | Keychain Services | 安全存储 token |
| **动画** | SwiftUI Animation + Lottie | 匹配原项目的 Framer Motion 效果 |
| **地图** | 高德 iOS SDK | 签到功能的地图展示 |

---

## 三、后端 API 适配清单

### 3.1 认证系统改造（关键变更）

当前使用 Cookie-based Session，iOS 需要改为 Token-based 认证：

```
当前: HttpOnly Cookie → 浏览器自动携带
iOS:  Authorization: Bearer <token> → 手动在 Header 中传递
```

**需要修改的后端文件：**

| 文件 | 改动内容 |
|------|---------|
| `src/lib/auth/session.ts` | 登录/注册接口返回 token 字段 |
| `src/lib/api/guards.ts` | getRequesterId() 增加从 Authorization header 读取 token |
| `src/app/api/auth/login/route.ts` | 响应体增加 `{ token: "..." }` |
| `src/app/api/auth/register/route.ts` | 响应体增加 `{ token: "..." }` |

### 3.2 不需要改动的 API

所有以下 API 无需任何修改，iOS 客户端直接对接：

- 全部 `/api/couples/[coupleId]/*` CRUD 端点（30+ 个）
- `/api/upload` 文件上传
- `/api/weather` 天气/地理编码
- `/api/agents/*` AI Agent
- `/api/health` 健康检查

### 3.3 API 响应格式

所有 API 已经返回标准 JSON，iOS 可直接解析：

```json
// 成功
{ "id": "...", "title": "...", ... }

// 列表
[{ ... }, { ... }]

// 错误
{ "error": { "code": "ERROR_CODE", "message": "中文错误信息" } }
```

---

## 四、iOS 项目结构设计

```
CoupleAgentSpace/
├── App/
│   ├── CoupleAgentSpaceApp.swift          # App 入口
│   └── AppState.swift                     # 全局状态管理
│
├── Core/
│   ├── Networking/
│   │   ├── APIClient.swift                # 网络请求层
│   │   ├── APIEndpoint.swift              # 所有端点定义
│   │   ├── APIError.swift                 # 错误处理
│   │   └── MultipartFormData.swift        # 文件上传
│   │
│   ├── Auth/
│   │   ├── AuthManager.swift              # 认证管理
│   │   ├── KeychainService.swift          # Token 安全存储
│   │   └── SessionManager.swift           # Session 管理
│   │
│   ├── Storage/
│   │   ├── ImageCache.swift               # 图片缓存
│   │   └── OSSUploader.swift              # 阿里云 OSS 上传
│   │
│   └── Utils/
│       ├── DateUtils.swift                # 日期工具
│       └── ThemeManager.swift             # 主题管理
│
├── Models/
│   ├── User.swift
│   ├── Couple.swift
│   ├── DiaryEntry.swift
│   ├── MoodCheckIn.swift
│   ├── Anniversary.swift
│   ├── Wish.swift
│   ├── Photo.swift
│   ├── TimeCapsule.swift
│   ├── CheckIn.swift
│   ├── Notification.swift
│   └── AgentMemory.swift
│
├── ViewModels/
│   ├── Auth/
│   │   ├── LoginViewModel.swift
│   │   └── RegisterViewModel.swift
│   ├── Dashboard/
│   │   └── DashboardViewModel.swift
│   ├── Diary/
│   │   └── DiaryListViewModel.swift
│   ├── Mood/
│   │   └── MoodListViewModel.swift
│   ├── Anniversary/
│   │   └── AnniversaryListViewModel.swift
│   ├── Wish/
│   │   └── WishListViewModel.swift
│   ├── Album/
│   │   └── AlbumViewModel.swift
│   ├── CheckIn/
│   │   └── CheckInViewModel.swift
│   ├── Settings/
│   │   └── SettingsViewModel.swift
│   └── Agent/
│       └── AgentViewModel.swift
│
├── Views/
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   └── RegisterView.swift
│   ├── Main/
│   │   └── MainTabView.swift              # 主 Tab 导航
│   ├── Dashboard/
│   │   ├── DashboardView.swift
│   │   ├── CoupleHeroView.swift
│   │   ├── StatsGridView.swift
│   │   ├── QuickActionsView.swift
│   │   ├── AnniversaryCountdownView.swift
│   │   └── AgentPanelView.swift
│   ├── Diary/
│   │   ├── DiaryListView.swift
│   │   ├── DiaryCardView.swift
│   │   └── DiaryFormView.swift
│   ├── Mood/
│   │   ├── MoodListView.swift
│   │   ├── MoodCardView.swift
│   │   └── MoodFormView.swift
│   ├── Anniversary/
│   │   ├── AnniversaryListView.swift
│   │   ├── AnniversaryCardView.swift
│   │   └── AnniversaryFormView.swift
│   ├── Wish/
│   │   ├── WishListView.swift
│   │   ├── WishCardView.swift
│   │   └── WishFormView.swift
│   ├── Album/
│   │   ├── AlbumView.swift
│   │   ├── PhotoLightboxView.swift
│   │   └── PhotoUploadView.swift
│   ├── CheckIn/
│   │   ├── CheckInListView.swift
│   │   ├── CheckInCardView.swift
│   │   └── CheckInFormView.swift
│   ├── Settings/
│   │   ├── SettingsView.swift
│   │   ├── ProfileEditView.swift
│   │   └── CoupleSetupView.swift
│   └── Components/                        # 通用 UI 组件
│       ├── CASButton.swift
│       ├── CASCard.swift
│       ├── CASTextField.swift
│       ├── CASTextEditor.swift
│       ├── CASSelector.swift
│       ├── CASBadge.swift
│       ├── CASAvatar.swift
│       ├── CASProgress.swift
│       ├── CASToast.swift
│       ├── CASDialog.swift
│       ├── ClickHeartsModifier.swift
│       └── FloatingParticlesView.swift
│
├── Theme/
│   ├── Theme.swift
│   ├── Color+Theme.swift
│   └── Font+Theme.swift
│
└── Resources/
    └── Assets.xcassets
```

---

## 五、分阶段实施计划

### 第一阶段：基础架构搭建（约 1 周）

| 任务 | 详细说明 | 产出 |
|------|---------|------|
| 1.1 创建 Xcode 项目 | SwiftUI App，配置 Bundle ID、Deployment Target iOS 17 | 可运行的空项目 |
| 1.2 主题系统 | 移植 CSS 变量到 SwiftUI Color，实现蓝/粉双主题 | Theme.swift |
| 1.3 网络层 | URLSession wrapper，支持 GET/POST/PATCH/DELETE，Bearer Token | APIClient.swift |
| 1.4 认证系统 | Keychain token 存储，AuthManager，登录/注册/登出 | AuthManager.swift |
| 1.5 数据模型层 | Codable structs 对应全部 14 个 Prisma 模型 | Models/ 目录 |
| 1.6 通用 UI 组件库 | Button、Card、TextField、Badge、Avatar、Dialog、Toast | Components/ 目录 |
| 1.7 后端认证适配 | guards.ts 增加 Bearer token，登录/注册返回 token | 2 个文件改动 |

### 第二阶段：核心页面开发（约 2 周）

| 任务 | 详细说明 | 依赖 |
|------|---------|------|
| 2.1 登录/注册页面 | 邮箱密码表单，密码验证，错误提示 | 1.4 |
| 2.2 情侣空间创建/加入 | 创建空间、输入邀请码加入 | 1.4 |
| 2.3 主 Tab 导航 | BottomTabBar（首页、日记、心情、相册、更多） | 1.2 |
| 2.4 Dashboard 首页 | 情侣头像 + 天数、统计卡片、快捷操作、纪念日倒计时 | 2.3 |
| 2.5 日记模块 | 列表（网格卡片）、创建/编辑、可见性控制、删除 | 2.3 |
| 2.6 心情打卡模块 | 列表、创建（情绪、精力、压力滑块、关怀偏好） | 2.3 |
| 2.7 纪念日模块 | 列表、创建/编辑、倒计时、提醒天数配置 | 2.3 |

### 第三阶段：高级功能（约 1.5 周）

| 任务 | 详细说明 | 依赖 |
|------|---------|------|
| 3.1 愿望清单模块 | CRUD、状态筛选、内联状态切换、预算显示 | 2.3 |
| 3.2 相册模块 | 瀑布流展示、图片上传（OSS）、全屏查看、删除 | 1.3 |
| 3.3 签到模块 | GPS 定位（CoreLocation）、反向地理编码、图片附件 | MapKit |
| 3.4 设置页面 | 个人资料编辑、头像上传、邀请码、成员列表 | 2.2 |
| 3.5 AI Agent 面板 | 意图选择、对话输入、AI 回复展示、草稿确认 | 1.3 |
| 3.6 装饰特效 | 点击爱心动画、漂浮粒子背景 | SwiftUI |

### 第四阶段：iOS 原生增强（约 1 周）

| 任务 | 详细说明 | 说明 |
|------|---------|------|
| 4.1 本地通知 | 纪念日到期提醒（无需 APNs，本地即可） | UNUserNotificationCenter |
| 4.2 Widget 小组件 | 桌面：在一起天数、纪念日倒计时 | WidgetKit |
| 4.3 Face ID / Touch ID | 生物识别解锁应用 | LocalAuthentication |
| 4.4 深色模式 | 第三套主题，跟随系统 | iOS 原生支持 |
| 4.5 Haptic Feedback | 操作反馈震动 | CoreHaptics |

### 第五阶段：测试与安装（约 3 天）

| 任务 | 详细说明 |
|------|---------|
| 5.1 真机调试 | iPhone 连接 Xcode，直接安装运行 |
| 5.2 性能优化 | 图片懒加载、内存优化 |
| 5.3 两台设备测试 | 分别在两台 iPhone 上安装测试 |

---

## 六、关键模块移植对照表

| Web (当前) | iOS (目标) | 复杂度 | 说明 |
|-----------|-----------|--------|------|
| `use-auth.tsx` (React Context) | `AuthManager` (@Observable) | 中 | Token 替代 Cookie |
| `use-couple.tsx` (React Context) | `CoupleManager` (@Observable) | 低 | 直接 API 调用 |
| `use-theme.tsx` (localStorage) | `ThemeManager` (@AppStorage) | 低 | SwiftUI 原生 |
| `api-client.ts` (fetch) | `APIClient` (URLSession) | 低 | async/await 天然适配 |
| `Dialog` (createPortal) | `.sheet` / `.alert` | 低 | SwiftUI 原生 |
| `ImageUpload` (FormData) | PHPicker + multipart | 中 | 需手动构建 body |
| `ClickHearts` (Web Animations) | SwiftUI Canvas + TimelineView | 中 | 自定义粒子系统 |
| `FloatingParticles` (Canvas 2D) | SwiftUI Canvas | 中 | 类似思路 |
| `Masonry Layout` (CSS columns) | LazyVGrid 自适应 | 中 | 计算列数 |
| `framer-motion` 动画 | SwiftUI .animation | 中 | 效果可实现 |
| `glass-morphism` (CSS) | .ultraThinMaterial | 低 | 原生支持 |
| `Geolocation API` | CoreLocation | 低 | 原生定位 |
| `navigator.clipboard` | UIPasteboard | 低 | 一行代码 |
| `date-fns` | DateFormatter + Calendar | 低 | 原生 API |
| `Zod` 验证 | Codable + 手动校验 | 低 | 类型安全 |

---

## 七、后端改动清单（仅 2 个文件，约 30 行代码）

### 改动 1：`src/lib/api/guards.ts`

在 `getRequesterId()` 中增加 Bearer token 读取：

```typescript
// 现有逻辑：检查 Cookie
// 新增逻辑：如果没有 Cookie，检查 Authorization header
const authHeader = request.headers.get("authorization");
if (authHeader?.startsWith("Bearer ")) {
  const token = authHeader.slice(7);
  // 用 token 查询 AuthSession（同现有 cookie 逻辑）
}
```

### 改动 2：`src/lib/auth/session.ts`

登录/注册响应增加 token 字段：

```typescript
// createSession() 除了 Set-Cookie，还在 JSON body 中返回 token
return Response.json({ user, token }, { headers });
```

---

## 八、时间估算（个人使用简化版）

| 阶段 | 时间 | 累计 |
|------|------|------|
| 第一阶段：基础架构 | 1 周 | 1 周 |
| 第二阶段：核心页面 | 2 周 | 3 周 |
| 第三阶段：高级功能 | 1.5 周 | 4.5 周 |
| 第四阶段：iOS 原生增强 | 1 周 | 5.5 周 |
| 第五阶段：测试安装 | 3 天 | ~6 周 |

利用 Claude Code 辅助编码可压缩到 3-4 周。

---

## 九、与 App Store 上架版本的差异

由于本项目仅供个人使用，以下内容可跳过：

| 上架要求 | 个人使用 | 说明 |
|---------|---------|------|
| Apple Developer 付费账号 ($99/年) | 免费 Apple ID 即可 | 免费账号每 7 天重签一次 |
| APNs 推送证书 | 本地通知即可 | UNUserNotificationCenter |
| App Store 审核规范 | 不需要 | 无审核限制 |
| 隐私政策页面 | 不需要 | 仅供自用 |
| App Store 截图 | 不需要 | 无需上架 |
| 代码签名证书 | Xcode 自动管理 | 免费账号自动签名 |
| TestFlight 分发 | 直接 Xcode 安装 | USB 连接即可 |
