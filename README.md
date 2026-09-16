# NestJS CRUD API & Dockerized Model Context Protocol (MCP) Environment with Apache Kafka

A production-ready NestJS platform integrated with Prisma ORM, PostgreSQL, GitHub Actions, an isolated, containerized Model Context Protocol (MCP) server built with the official Anthropic SDK, and an asynchronous **Apache Kafka (KRaft mode)** messaging backbone. This architecture enables secure, structured database context-retrieval, real-time distributed event streaming, and tool execution directly inside containerized AI agent workflows.

---

## 🛠️ Tech Stack & Ecosystem

- **Backend Framework:** NestJS v10 (TypeScript, Hybrid Application Architecture)
- **Database Layer:** PostgreSQL 15
- **Data Access:** Prisma ORM featuring custom driver adapters (`@prisma/adapter-pg`) and connection pooling (`pg` `Pool`)
- **Message Broker & Streaming:** Apache Kafka v3.7.0 (ZooKeeperless **KRaft mode**) using `kafkajs` streams
- **CI/CD Pipeline:** GitHub Actions (`NestJS CI`)
- **Containerization & Orchestration:** Docker & Docker Compose
- **AI Tooling & Context Layer:** Model Context Protocol (MCP) SDK, Claude Code CLI (`.mcp.json` project-scoped server), Anthropic MCP Inspector

---

## 🚀 How to Run the Docker Compose Infrastructure

The environment features a fully automated multi-container configuration spanning 5 microservices:

1. `api` (The core application server)
2. `postgres` (The database storage layer)
3. `kafka` (The Apache Kafka KRaft broker serving internal `9092` and host-exposed `9094` networks)
4. `prisma_studio` (Graphical database workspace inspector)
5. `mcp-server` (Production-grade tool pipeline runner)

### 1. Initialize Local Environment Variables

Create a `.env` file in the root directory and append your secure credentials:

```env
DB_USER=admin
DB_PASSWORD=
DB_NAME=nest_db
DATABASE_URL=postgresql://{user}:{password}@postgres:5432/nest_db?schema=public

# Apache Kafka Configuration
KAFKA_BROKER=kafka:9092
```

### 2. Launch the Microservice Stack

Execute the standard orchestration engine deployment:

```bash
docker compose up --build -d
```

### 3. Verify Container Runtime Status

Ensure all services are operational:

```bash
docker ps
docker logs -f nest_api
```

_Expected confirmation log:_ `📥 Konsument Kafki jest w 100% aktywny i gotowy na eventy!`

---

## 🤖 AI Tooling & Context Engineering (Model Context Protocol)

This repository includes a custom **Model Context Protocol (MCP)** server built with the official Anthropic TypeScript SDK. It creates a secure abstraction layer that connects MCP clients — the **Claude Code CLI**, **Claude Desktop**, or the **MCP Inspector** — directly to our local PostgreSQL database through the existing Prisma ORM setup.

### 🛠️ Available MCP Tools

The server (`src/mcp/mcp-server.ts`) exposes three tools over the **stdio** transport:

| Tool                | Input                               | Description                                                                                                                        |
| ------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `get_all_users`     | _(none)_                            | Fetches all users from the database along with their roles, ordered by `createdAt` descending.                                     |
| `get_user_by_email` | `email: string`                     | Searches for a specific user by email address. Returns a plain-text notice when no match exists.                                   |
| `update_user_role`  | `userId: number`, `newRole: string` | Updates the role of a specific user (`ADMIN`, `USER`, …) **AND broadcasts a `user.role.updated` event** to Kafka over port `9094`. |

Example prompts once the server is connected:

- _"List all users in the database and show me their roles."_
- _"Find the user with email bruce@wayne.com."_
- _"Promote user 3 to ADMIN."_

### 🔌 Transport & Connection Model

- The server speaks **JSON-RPC over stdio** — the client spawns the process and communicates through `stdin`/`stdout`. There is no HTTP port to expose.
- Diagnostics are written to `stderr` (`console.error`) so they never corrupt the protocol stream on `stdout`.
- Database access reuses the same Prisma driver-adapter setup as the API (`@prisma/adapter-pg` over a `pg` `Pool`).
- `DATABASE_URL` is read from the environment (or `.env` via `dotenv/config`). If the URL points at the Docker service host (`@postgres:`), the server rewrites it to `@localhost:` so the same connection string works both inside and outside Compose.
- **Multi-Channel Kafka Gateway:** The Kafka broker exposes port `9092` for internal docker containers (NestJS), and port `9094` for host machine slots (the local MCP server process), ensuring that AI mutations instantly publish to the system event stream.

### 🚀 Local Setup & Integration

#### 1. Prerequisites

Ensure your local PostgreSQL container is up and running via Docker Compose:

```bash
docker compose up -d postgres kafka
```

Generate the Prisma Client so the MCP server can query the schema:

```bash
npx prisma generate
```

#### 2. Choose how to run the server

**Option A — run from TypeScript source (no build step, used by `.mcp.json`):**

```bash
npx ts-node src/mcp/mcp-server.ts
```

**Option B — compile once and run the JavaScript bundle:**

```bash
yarn build:mcp          # emits dist-mcp/mcp-server.js
node dist-mcp/mcp-server.js
```

Option A is convenient during development; Option B starts faster and is what Claude Desktop is configured against below.

---

## 🖥️ Integration with the Claude Code CLI

Claude Code discovers MCP servers from configuration files resolved at three scopes: **project** (`.mcp.json`, committed to the repo and shared with the team), **local** (private to you, on this machine only), and **user** (available across all your projects).

### Project scope (already committed)

This repository ships a `.mcp.json` at the root, so the server is available to anyone who clones it:

```json
{
  "mcpServers": {
    "nestjs-prisma": {
      "type": "stdio",
      "command": "npx",
      "args": ["ts-node", "src/mcp/mcp-server.ts"],
      "env": {}
    }
  }
}
```

`env` is intentionally empty — the server picks up `DATABASE_URL` from the project `.env` file, which keeps credentials out of version control. The `command` is relative to the project root, so start `claude` from `F:\DevProjects\jsm-nestjs`.

The first time Claude Code sees a project-scoped server it asks for approval before launching it. Accept the prompt to enable `nestjs-prisma`.

### Registering the server from the command line

If you prefer the CLI over hand-editing JSON:

```bash
# Project scope — writes to .mcp.json in the repo root
claude mcp add nestjs-prisma --scope project -- npx ts-node src/mcp/mcp-server.ts

# Local scope — private to your machine, e.g. pointing at the compiled bundle
claude mcp add nestjs-prisma --scope local -- node dist-mcp/mcp-server.js

# Pass an explicit connection string instead of relying on .env
claude mcp add nestjs-prisma --scope local \
  --env DATABASE_URL=postgresql://user:password@localhost:5432/nest_db?schema=public \
  -- node dist-mcp/mcp-server.js
```

Everything after `--` is the command Claude Code spawns; the `--env` flags belong before it.

### Managing and verifying servers

```bash
claude mcp list              # show configured servers and their connection status
claude mcp get nestjs-prisma # inspect one server's resolved configuration
claude mcp remove nestjs-prisma --scope project
```

Inside an interactive `claude` session:

- `/mcp` — lists connected servers, their tools, and lets you re-authenticate or reconnect.
- `claude --debug` — surfaces the server's `stderr` output, including `NestJS/Prisma MCP Server has been started!`, Kafka producer connection logs, and any `Fatal MCP server error:` traces.

### Calling the tools

Once connected, the tools are namespaced as `mcp__nestjs-prisma__<tool>`:

- `mcp__nestjs-prisma__get_all_users`
- `mcp__nestjs-prisma__get_user_by_email`
- `mcp__nestjs-prisma__update_user_role`

You normally just ask in natural language ("show me every user and their role") and Claude Code selects the tool. To pre-approve them and avoid a permission prompt on each call, add them to `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__nestjs-prisma__get_all_users",
      "mcp__nestjs-prisma__get_user_by_email"
    ]
  }
}
```

`update_user_role` writes to the database and dispatches network payloads to Kafka, so leaving it out of the allowlist keeps a confirmation step in front of every mutation.

### Troubleshooting

| Symptom                                       | Likely cause                                                                          | Resolution                                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Server shows as `failed` in `claude mcp list` | Postgres is not running (`docker compose up -d postgres`) or `DATABASE_URL` is unset. | Ensure infrastructure containers are active.                                                                                         |
| `Cannot find module '@prisma/client'`         | Prisma Client was never generated.                                                    | Run `npx prisma generate`.                                                                                                           |
| Connection refused on port 5432               | The URL points at the Docker-internal host.                                           | The server rewrites `@postgres:` to `@localhost:`, but any other hostname is used verbatim.                                          |
| Tools do not appear                           | The project-scope approval prompt was declined.                                       | Reset choices with `claude mcp reset-project-choices`.                                                                               |
| `UNKNOWN_TOPIC_OR_PARTITION`                  | Client queried topic before initialization.                                           | The system features a built-in **Kafka Admin Client wrapper** that auto-provisions necessary topics (`user.created`, etc.) on start. |

---

## 🖥️ Integration with Claude Desktop

Claude Desktop uses its own configuration file rather than `.mcp.json`.

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
  "mcpServers": {
    "nestjs-prisma-mcp-server": {
      "command": "node",
      "args": [
        "F:\\DevProjects\\jsm-nestjs\\dist-mcp\\mcp-server.js"
      ],
      "env": {
        "NODE_ENV": "development",
        "DATABASE_URL": "postgresql://{user}:{password}@postgres:5432/nest_db?schema=public"
      }
    }
  }
```

Claude Desktop does not inherit your shell's working directory, so use **absolute paths** and run `yarn build:mcp` before starting it. Restart the desktop app after editing the config.

The `nest_mcp_server` container utilizes interactive flag overrides (`stdin_open: true`, `tty: true`, `command: tail -f /dev/null`) to preserve persistent execution boundaries for local AI tooling proxies.

---

## 🧪 Graphical Auditing & Testing via MCP Inspector

To test the Model Context Protocol features without external IDE clients, use the official **Anthropic MCP Inspector web client**.

### 1. Boot up the Inspection Dashboard

Open a new shell directory inside your main node root environment and execute the official JSON-RPC bridge runner:

```bash
# against the compiled bundle (requires `yarn build:mcp` first)
npx @modelcontextprotocol/inspector node dist-mcp/mcp-server.js

# or straight from the TypeScript source
npx @modelcontextprotocol/inspector npx ts-node src/mcp/mcp-server.ts
```

### 2. Access the Local Diagnostics Console

Open your preferred browser engine and navigate to the assigned port interface:

```text
http://127.0.0.1:6274
```

- The dashboard automatically flags an integrated **Connected** indicator matrix.
- Navigate into the **Tools** exploration surface tab.
- Locate the custom database lookup hooks: `get_all_users` or `get_user_by_email`.
- Click **Call tool** to audit real-time database context-retrieval schema parsing payloads.

---

## 🤖 Continuous Integration (`NestJS CI`)

The repository features an automated validation matrix executed on every code push via GitHub Actions (`.github/workflows/nestjs-ci.yml`):

- **Isolated Infrastructure:** Automatically spins up a secure PostgreSQL 15 sidecar service container with proactive `pg_isready` healthcheck gating.
- **Modern Node Runtime:** Enforces environment compilation constraints utilizing native Node.js `v24` runtimes across all workflow actions.
- **Automated Schema Verification:** Validates data models natively by applying schema states (`prisma db push`) directly against the live test database container.
- **Compilation Guardrails:** Runs `npx prisma generate` followed by `yarn build` to ensure zero runtime code degradation or TypeScript contract drift before code deployment.

---

## 🏗️ How Prisma ORM Works in This Project

Prisma acts as an advanced data abstraction and migration suite. In this ecosystem, it decouples raw database clients from application business logic through three primary steps:

1. **Schema-Driven Modeling (`prisma.schema`):** Models like `User` and `Country` are declared declaratively alongside database drivers and TypeScript client generation structures.
2. **Type-Safe Client Generation:** Running `npx prisma generate` compiles the schema definitions into deeply type-safe TypeScript interfaces, ensuring no runtime reference crashes can happen during database queries.
3. **Advanced Driver Adapters:** Rather than utilizing direct engine binaries, this setup utilizes `@prisma/adapter-pg` tied to a native `pg` connection pool. This architecture ensures optimal scalability and resource sharing between the core NestJS API runtime and the isolated MCP server instance.

---

_Developed as an independent architectural milestone verifying containerized AI tool connectivity frameworks._
