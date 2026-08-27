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

// POPRAWIONE: Inicjalizacja bazy danych za pomocą Driver Adaptera (tak jak w Twoim NestJS)
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://admin:${process.env.DB_PASSWORD}!@localhost:5432/nest_db?schema=public`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Tworzenie serwera MCP
const server = new Server(
  {
    name: 'nestjs-prisma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}, // Deklarujemy, że nasz serwer dostarcza narzędzia (Tools)
    },
  },
);

// 3. Rejestracja dostępnych narzędzi dla Claude
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_all_users',
        description:
          'Pobiera listę wszystkich użytkowników z bazy danych wraz z ich rolami.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_user_by_email',
        description:
          'Wyszukuje konkretnego użytkownika w bazie na podstawie adresu email.',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'Adres email użytkownika' },
          },
          required: ['email'],
        },
      },
    ],
  };
});

// 4. Obsługa żądań wykonania narzędzi
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
              text: `Nie znaleziono użytkownika z mailem: ${email}`,
            },
          ],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(user, null, 2) }],
      };
    }

    throw new Error(`Narzędzie ${name} nie jest obsługiwane.`);
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Błąd bazy danych: ${error.message}` }],
    };
  }
});

// 5. Uruchomienie serwera przez standardowe potoki wejścia/wyjścia (stdio)
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Serwer MCP NestJS/Prisma został uruchomiony!');
}

run().catch((err) => {
  console.error('Fatalny błąd serwera MCP:', err);
  process.exit(1);
});
