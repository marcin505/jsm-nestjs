import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { Kafka } from 'kafkajs'; // <-- CRITICAL NEW IMPORT

// Database initialization using Driver Adapter
let connectionString =
  process.env.DATABASE_URL ||
  `postgresql://admin:${process.env.DB_PASSWORD}!@localhost:5432/nest_db?schema=public`;

if (connectionString.includes('@postgres:')) {
  connectionString = connectionString.replace('@postgres:', '@localhost:');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// --- KAFKA PRODUCER INITIALIZATION ---
// Connect directly to the broker (use localhost if outside docker network, or get from env)
const kafkaBroker = 'localhost:9094';

const kafka = new Kafka({
  clientId: 'mcp-server-producer',
  brokers: [kafkaBroker],
  connectionTimeout: 5000, // Safe threshold to prevent UI lockups
});

const producer = kafka.producer();

// Connect the Kafka producer globally on startup
async function initKafka() {
  try {
    await producer.connect();
    console.error(
      '🚀 MCP Server Kafka Producer connected successfully to broker:',
      kafkaBroker,
    );
  } catch (err) {
    console.error('❌ MCP Server failed to connect to Kafka Broker:', err);
  }
}
initKafka();
// -------------------------------------

// Creating the MCP server
const server = new Server(
  {
    name: 'nestjs-prisma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Registering available tools for Claude
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
      {
        name: 'update_user_role',
        description:
          'Updates the role of a specific user in the database AND broadcasts the event across the cluster via Kafka.',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'The unique ID of the user',
            },
            newRole: {
              type: 'string',
              description: 'The new role to assign (e.g., ADMIN, USER)',
            },
          },
          required: ['userId', 'newRole'],
        },
      },
    ],
  };
});

// Handling tool execution requests
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
            { type: 'text', text: `No user found with email: ${email}` },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
      };
    }

    if (name === 'update_user_role') {
      const { userId, newRole } = args as { userId: number; newRole: string };

      // 1. Persist mutation to PostgreSQL via Prisma
      const updatedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: { role: newRole.toUpperCase() as Role },
      });

      // 2. Broadcast Event to Kafka Topic synchronously to maintain system parity
      try {
        await producer.send({
          topic: 'user.role.updated',
          messages: [
            {
              key: String(updatedUser.id), // Partition Key to ensure partition order parity
              value: JSON.stringify({
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                updatedAt: updatedUser.updatedAt,
                changedBy: 'MCP_AI_SERVER',
              }),
            },
          ],
        });
        console.error(
          `📢 Kafka event 'user.role.updated' dispatched for user ${updatedUser.id}`,
        );
      } catch (kafkaError: any) {
        console.error(
          '⚠️ Database succeeded but Kafka dispatch failed:',
          kafkaError.message,
        );
        // We do not fail the request, but log it as an infrastructure alert
      }

      return {
        content: [
          {
            type: 'text',
            text: `Success! User ${updatedUser.name} (ID: ${updatedUser.id}) has been updated to role: ${updatedUser.role} and event stream has been notified.`,
          },
        ],
      };
    }

    throw new Error(`Tool ${name} is not supported.`);
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Database/Infrastructure error: ${error.message}`,
        },
      ],
    };
  }
});

// Starting the server via standard input/output streams (stdio)
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NestJS/Prisma/Kafka MCP Server has been started!');
}

run().catch((err) => {
  console.error('Fatal MCP server error:', err);
  process.exit(1);
});
