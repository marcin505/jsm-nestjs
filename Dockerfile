# Stage 1: Build the application
FROM node:22-alpine AS builder
WORKDIR /usr/src/jsm-nestjs

COPY package.json yarn.lock ./

# Install dependencies first (better docker caching)
RUN yarn install --frozen-lockfile

# Copy all source files (this includes the prisma directory automatically)
COPY . .

# Generate Prisma Client types
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build the TypeScript project
RUN yarn build

# Stage 2: Run the production application
FROM node:22-alpine
WORKDIR /usr/src/jsm-nestjs

COPY package.json yarn.lock ./
COPY --from=builder /usr/src/jsm-nestjs/node_modules ./node_modules
COPY --from=builder /usr/src/jsm-nestjs/dist ./dist
COPY --from=builder /usr/src/jsm-nestjs/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]