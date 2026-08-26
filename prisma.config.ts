import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Wklejamy pełny adres URL jako zwykły tekst w pojedynczych cudzysłowach:
    url: 'postgresql://admin:YourSuperStrongProductionPassword123!@postgres:5432/nest_db?schema=public',
  },
});
