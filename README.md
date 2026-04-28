# Couple Agent Space

情侣专属的私密生活协作系统，包含共同首页、纪念日、情侣日记、心情打卡、愿望清单、相册、时间胶囊，以及关系助手 AI Agent。

## 技术栈

| 层级 | 选型 |
| --- | --- |
| 前端 | Next.js App Router、React、TypeScript |
| 样式 | Tailwind CSS v4 |
| 组件 | 本地 shadcn 风格组件、lucide-react、Framer Motion |
| 后端 | Next.js Route Handlers |
| 数据库 | PostgreSQL、Prisma ORM v7 |
| AI | AI SDK、OpenAI provider、本地 fallback |

## 本地启动

```bash
npm install
createdb couple_agent_dev
npm run db:generate
npm run db:migrate
npm run dev
```

访问：`http://localhost:3000`

## 环境变量

复制 `.env.example` 为 `.env`，并按需修改：

```bash
DATABASE_URL="postgresql://jiangyuming@localhost:5432/couple_agent_dev?schema=public"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

没有 `OPENAI_API_KEY` 时，关系助手 Agent 会使用本地 fallback，方便开发阶段直接体验。

## 认证

系统已内置邮箱密码认证：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

认证成功后服务端会设置 HttpOnly Cookie，业务 API 会优先从会话中识别当前用户。开发环境保留 `x-user-id` / `?userId=` 作为调试旁路，生产环境会自动关闭。

## AI Agent

当前 Agent 支持 DeepSeek OpenAI-compatible 接口：

```bash
AI_PROVIDER="deepseek"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-v4-pro"
DEEPSEEK_API_KEY=""
DEEPSEEK_THINKING_TYPE="enabled"
DEEPSEEK_REASONING_EFFORT="high"
```

`DEEPSEEK_API_KEY` 只放在本地 `.env` 或部署平台密钥中，不提交到 Git。手动验证 DeepSeek 调用：

```bash
npm run test:agent:deepseek
```

这个脚本只发起一次短输入请求，用于确认 provider 与 Agent 链路可用。

## 数据库

本地开发默认使用 Homebrew PostgreSQL 当前系统用户连接：

```bash
DATABASE_URL="postgresql://jiangyuming@localhost:5432/couple_agent_dev?schema=public"
```

如果数据库已存在，`createdb couple_agent_dev` 会提示重复，可直接跳过。生产环境可以使用：

```bash
npm run db:deploy
```

## 重要文档

- [需求分析](./docs/requirements-analysis.md)
- [开发计划](./docs/development-roadmap.md)
- [API 说明](./docs/api.md)
- [GitHub 工作流](./docs/github-workflow.md)
