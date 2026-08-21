import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Tworzymy połączenie PostgreSQL za pomocą standardowej paczki 'pg'
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://admin:supersecretpassword@localhost:5432/nest_db?schema=public',
    });

    // 2. Tworzymy adapter wymagany przez najnowszą Prismę 7
    const adapter = new PrismaPg(pool);

    // 3. Przekazujemy gotowy adapter bezpośrednio do PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    // 4. Łączymy się bezpiecznie z Dockerem
    await this.$connect();
  }
}
