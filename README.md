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
npm run db:generate
npm run dev
```

访问：`http://localhost:3000`

## 环境变量

复制 `.env.example` 为 `.env`，并按需修改：

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/couple_agent_dev?schema=public"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
```

没有 `OPENAI_API_KEY` 时，关系助手 Agent 会使用本地 fallback，方便开发阶段直接体验。

## 重要文档

- [需求分析](./docs/requirements-analysis.md)
- [开发计划](./docs/development-roadmap.md)
- [GitHub 工作流](./docs/github-workflow.md)
