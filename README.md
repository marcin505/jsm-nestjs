# NestJS CRUD API & Dockerized Model Context Protocol (MCP) Environment

A production-ready NestJS platform integrated with Prisma ORM, PostgreSQL, GitHub Actions, and an isolated, containerized Model Context Protocol (MCP) server built with the official Anthropic SDK. This architecture enables secure, structured database context-retrieval and tool execution directly inside containerized AI agent workflows.

---

## 🛠️ Tech Stack & Ecosystem

- **Backend Framework:** NestJS (TypeScript)
- **Database Layer:** PostgreSQL 15
- **Data Access:** Prisma ORM featuring custom driver adapters (`@prisma/adapter-pg`) and connection pooling (`pg` `Pool`)
- **CI/CD Pipeline:** GitHub Actions (`NestJS CI`)
- **Containerization & Orchestration:** Docker & Docker Compose
- **AI Tooling & Context Layer:** Model Context Protocol (MCP) SDK, Anthropic MCP Inspector

---

## 🚀 How to Run the Docker Compose Infrastructure

The environment features a fully automated multi-container configuration spanning 4 microservices:

1. `nest_api` (The core application server)
2. `nest_postgres` (The database storage layer)
3. `prisma_studio` (Graphical database workspace inspector)
4. `nest_mcp_server` (Production-grade tool pipeline runner)

### 1. Initialize Local Environment Variables

Create a `.env` file in the root directory and append your secure credentials:

```env
DB_USER=
DB_PASSWORD=
DB_NAME=nest_db
DATABASE_URL=postgresql://{DB_USER}:{DB_PASSWORD}@postgres:5432/nest_db?schema=public
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
```

## 🤖 AI Tooling & Context Engineering (Model Context Protocol)

This repository includes a custom **Model Context Protocol (MCP)** server built with the official Anthropic TypeScript SDK. It creates a secure abstraction layer that connects LLM clients (like Claude Desktop) directly to our local PostgreSQL database through the existing Prisma ORM setup.

### 🛠️ Available MCP Tools

- `get_all_users` – Fetches a secure list of registered users (IDs and emails only) to provide operational insights.
- `get_database_stats` – Returns live record counters across core entities to monitor database health and seed states.
- `update_user_role` - updates user role, prompt example: "promote Bruce Wayne to Admin"

### 🚀 Local Setup & Integration

#### 1. Prerequisites

Ensure your local PostgreSQL container is up and running via Docker Compose:

```bash
docker compose up -d postgres
```

#### 2. Configure Claude Desktop

Add the following configuration to your `claude_desktop_config.json` file.

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

The `nest_mcp_server` utilizes interactive flag overrides (`stdin_open: true`, `tty: true`, `command: tail -f /dev/null`) to preserve persistent execution boundaries for local AI tooling proxies.

---

## 🧪 Graphical Auditing & Testing via MCP Inspector

To test the Model Context Protocol features without external IDE clients, use the official **Anthropic MCP Inspector web client**.

### 1. Boot up the Inspection Dashboard

Open a new shell directory inside your main node root environment and execute the official JSON-RPC bridge runner:

```bash
npx @modelcontextprotocol/inspector node dist-mcp/mcp-server.js
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
