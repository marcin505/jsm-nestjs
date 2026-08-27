import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// FIXED: Database initialization using Driver Adapter (just like in your NestJS setup)
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://admin:${process.env.DB_PASSWORD}!@localhost:5432/nest_db?schema=public`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Creating the MCP server
const server = new Server(
  {
    name: 'nestjs-prisma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}, // Declaring that our server provides Tools
    },
  },
);

// 3. Registering available tools for Claude
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_all_users',
        description:
          'Fetches a list of all users from the database along with their roles.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_user_by_email',
        description:
          'Searches for a specific user in the database based on their email address.',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'User email address' },
          },
          required: ['email'],
        },
      },
    ],
  };
});

// 4. Handling tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_all_users') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return {
        content: [{ type: 'text', text: JSON.stringify(users, null, 2) }],
      };
    }

    if (name === 'get_user_by_email') {
      const email = (args as { email: string }).email;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return {
          content: [
            {
              type: 'text',
              text: `No user found with email: ${email}`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
      };
    }

    throw new Error(`Tool ${name} is not supported.`);
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Database error: ${error.message}` }],
    };
  }
});

// 5. Starting the server via standard input/output streams (stdio)
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NestJS/Prisma MCP Server has been started!');
}

run().catch((err) => {
  console.error('Fatal MCP server error:', err);
  process.exit(1);
});
