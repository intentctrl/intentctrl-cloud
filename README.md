# IntentCtrl Cloud

Self-hostable chat API platform with LLM integration. No auth management, no billing — just a simple shared token to secure your endpoints.

## Architecture

```
intentctrl-cloud/
├── apps/
│   ├── api/          Fastify server (REST + streaming)
│   └── dashboard/    Next.js dashboard (chat management UI)
├── packages/
│   ├── db/           Drizzle ORM schema + PostgreSQL client
│   ├── types/        Shared Zod schemas and TypeScript types
│   ├── eslint-config/
│   └── typescript-config/
```

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Copy and edit env vars
cp .env.example apps/api/.env
cp .env.example apps/dashboard/.env.local

# 3. Install dependencies
pnpm install

# 4. Generate & run database migrations
pnpm db:generate
pnpm db:migrate

# 5. Start both API + Dashboard
pnpm dev
```

API runs on `http://localhost:4000`, Dashboard on `http://localhost:3000`.

## API Endpoints

All endpoints require the `X-API-Key` header (except `/api/health`).

| Method   | Path                                     | Description                           |
| -------- | ---------------------------------------- | ------------------------------------- |
| `GET`    | `/api/health`                            | Health check (no token)               |
| `POST`   | `/api/chat/sessions`                     | Create a chat session                 |
| `POST`   | `/api/chat/:sessionId`                   | Send message (streaming LLM response) |
| `GET`    | `/api/chat/sessions`                     | List sessions (paginated)             |
| `GET`    | `/api/chat/sessions/:sessionId`          | Get session + messages                |
| `GET`    | `/api/chat/sessions/:sessionId/messages` | Get only messages                     |
| `DELETE` | `/api/chat/sessions/:sessionId`          | Delete session                        |

### Create a session

```json
POST /api/chat/sessions
X-API-Key: your-secret-key

{ "visitorId": "user-abc", "externalUserId": "optional-external-id" }
```

### Send a message (streaming)

```json
POST /api/chat/:sessionId
X-API-Key: your-secret-key

{
  "message": {
    "id": "msg-1",
    "role": "user",
    "parts": [{ "type": "text", "text": "Hello!" }]
  },
  "pageContent": "Optional context about the page",
  "tools": [],
  "dataContext": {},
  "permissions": {}
}
```

Returns a `text/event-stream` SSE response.

## Environment Variables

| Variable              | Required | Default                     | Description                     |
| --------------------- | -------- | --------------------------- | ------------------------------- |
| `PORT`                | No       | `4000`                      | API server port                 |
| `DATABASE_URL`        | Yes      | —                           | PostgreSQL connection string    |
| `API_KEY`             | Yes      | —                           | Shared API key for all requests |
| `LLM_API_KEY`         | Yes      | —                           | LLM provider API key            |
| `LLM_BASE_URL`        | No       | `http://localhost:11434/v1` | LLM API base URL                |
| `LLM_MODEL`           | No       | `gpt-4o-mini`               | Model name                      |
| `NEXT_PUBLIC_API_URL` | Yes      | —                           | Dashboard → API URL             |
| `NEXT_PUBLIC_API_KEY` | Yes      | —                           | Dashboard → API key             |

## License

MIT
