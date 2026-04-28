# API 说明

当前后端采用 Next.js Route Handlers，所有响应统一以 `{ "data": ... }` 包装成功结果。情侣空间内接口需要提供成员用户 ID，推荐放在请求头：

```http
x-user-id: <userId>
```

也可以在查询参数中使用 `?userId=<userId>`；创建类接口通常在 JSON body 中传入 `ownerId`、`authorId`、`creatorId` 或 `uploaderId`。

## 基础接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 应用与数据库健康检查 |
| POST | `/api/agents/relationship` | 关系助手 Agent，支持 fallback 与调用日志 |

## 用户与情侣空间

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/users` | 查询用户列表，支持 `id` 或 `email` |
| POST | `/api/users` | 创建或更新用户 |
| GET | `/api/users/:userId` | 获取用户详情 |
| PATCH | `/api/users/:userId` | 更新用户资料 |
| DELETE | `/api/users/:userId` | 删除用户 |
| GET | `/api/couples` | 查询当前用户加入的情侣空间 |
| POST | `/api/couples` | 创建情侣空间 |
| POST | `/api/couples/join` | 通过邀请码加入空间 |
| GET | `/api/couples/:coupleId` | 获取空间详情 |
| PATCH | `/api/couples/:coupleId` | 更新空间名称和开始日期 |
| DELETE | `/api/couples/:coupleId` | 删除空间，仅创建者可操作 |
| GET | `/api/couples/:coupleId/dashboard` | 首页聚合数据 |

## 情侣空间资源

| 资源 | 路径 | 能力 |
| --- | --- | --- |
| 纪念日 | `/api/couples/:coupleId/anniversaries` | 列表、创建、详情、更新、删除 |
| 日记 | `/api/couples/:coupleId/diaries` | 列表、创建、详情、更新、删除，支持私密可见性 |
| 心情 | `/api/couples/:coupleId/moods` | 列表、创建、更新、删除 |
| 愿望 | `/api/couples/:coupleId/wishes` | 列表、创建、详情、更新、删除 |
| 照片记录 | `/api/couples/:coupleId/photos` | 列表、创建、更新、删除，当前保存外部 URL 元数据 |
| 时间胶囊 | `/api/couples/:coupleId/time-capsules` | 列表、创建、详情、更新、删除、开启 |

## 快速创建测试数据

```bash
curl -X POST http://localhost:3000/api/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@example.com","name":"A"}'
```

创建情侣空间：

```bash
curl -X POST http://localhost:3000/api/couples \
  -H 'Content-Type: application/json' \
  -d '{"ownerId":"<userId>","title":"我们的空间","startedAt":"2024-08-03"}'
```
