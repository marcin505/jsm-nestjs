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

## 🏗️ How Prisma ORM Works in This Project

Prisma acts as an advanced data abstraction and migration suite. In this ecosystem, it decouples raw database clients from application business logic through three primary steps:

1. **Schema-Driven Modeling (`prisma.schema`):** Models like `User` and `Country` are declared declaratively alongside database drivers and TypeScript client generation structures.
2. **Type-Safe Client Generation:** Running `npx prisma generate` compiles the schema definitions into deeply type-safe TypeScript interfaces, ensuring no runtime reference crashes can happen during database queries.
3. **Advanced Driver Adapters:** Rather than utilizing direct engine binaries, this setup utilizes `@prisma/adapter-pg` tied to a native `pg` connection pool. This architecture ensures optimal scalability and resource sharing between the core NestJS API runtime and the isolated MCP server instance.

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

## 💻 Manual CLI Interactivity & Raw JSON-RPC Verification

Since the Model Context Protocol standard communicates via standard streams (`stdio`), you can trigger tools directly via a raw terminal pipe payload without dependencies.

### 1. Query Registered Tool Context Tables (Method `tools/list`)

```bash
node dist-mcp/mcp-server.js
```

Paste this raw message frame directly into the terminal space and hit **Enter**:

```json
{ "jsonrpc": "2.0", "method": "tools/list", "id": 1 }
```

### 2. Request Live Database Payloads (Method `tools/call`)

```bash
node dist-mcp/mcp-server.js
```

Paste the request frame to invoke database client lookups manually:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": { "name": "get_all_users", "arguments": {} },
  "id": 2
}
```

### 3. Print Prettified Terminal Payloads

To strip stream warnings and print perfectly aligned JSON arrays natively inside your Windows terminal, pipe input data streams like this:

```powershell
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"get_all_users","arguments":{}},"id":2}' | node dist-mcp/mcp-server.js | node -e "process.stdin.on('data', d => { const txt = d.toString(); const jsonStart = txt.indexOf('{'); if(jsonStart === -1) return; const res = JSON.parse(txt.substring(jsonStart)); console.log(JSON.stringify(JSON.parse(res.result.content.text), null, 2)) })"
```

---

## 📈 Production AI IDE Client Integration

To map this containerized platform architecture to production developer extensions like **Continue** or **Roo Code**, update your global environment configuration profile settings (`config.json`):

```json
"mcpServers": {
  "nestjs-prisma-mcp-server": {
    "command": "docker",
    "args": [
      "exec",
      "-i",
      "nest_mcp_server",
      "node",
      "dist-mcp/mcp-server.js"
    ]
  }
}
```

---

## 🤖 Continuous Integration (`NestJS CI`)

The repository features an automated validation matrix on every code push via GitHub Actions:

- Spins up a background service container running PostgreSQL 15.
- Confirms setup node workspace environments match strict compilation runtimes (`node v24`).
- Validates Prisma data schemas and migrations against real database endpoints (`db push`).
- Executes build compilations to enforce zero TypeScript errors.

---

_Developed as an independent architectural milestone verifying containerized AI tool connectivity frameworks._
