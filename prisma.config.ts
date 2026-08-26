import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // 1. Najpierw spróbuje przeczytać zmienną (dla CI / lokalnie)
    // 2. Jeśli zmienna jest pusta, użyje adresu produkcyjnego na EC2 jako fallback (po znaku ||)
    url:
      process.env.DATABASE_URL ||
      'postgresql://admin:YourSuperStrongProductionPassword123!@postgres:5432/nest_db?schema=public',
  },
});
