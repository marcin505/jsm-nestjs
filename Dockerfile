# 1. Use an official Node.js runtime as a parent image (alpine is lightweight and fast)
FROM node:20-alpine
WORKDIR /usr/src/jsm-nestjs

# 2. Copy dependency files including yarn.lock and the prisma directory
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# 3. Install dependencies using Yarn matching the exact lockfile versions
RUN yarn install --frozen-lockfile

# 4. Copy the rest of your application's source code
COPY . .

# 5. Generate Prisma Client types (critical step before building NestJS)
RUN npx prisma generate

# 6. Build the application for production
RUN yarn build

# 7. Expose the port the app runs on
EXPOSE 3000

# 8. Start the application using node directly for maximum production performance
CMD ["node", "dist/main"]