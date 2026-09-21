# ============================================================
# Stage 1: Build (Cài dependencies, sinh Prisma và build TypeScript)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt OpenSSL (cho Prisma) và build tools (cho bcrypt trên Alpine)
RUN apk add --no-cache openssl python3 make g++

# Copy danh sách thư viện
COPY package*.json ./

# Cài đặt toàn bộ dependencies (gồm cả devDependencies để lấy tsc)
RUN npm ci

# Copy schema Prisma và sinh Prisma Client
COPY prisma ./prisma
RUN npx prisma generate

# Copy cấu hình TypeScript và toàn bộ mã nguồn
COPY tsconfig.json ./
COPY src ./src

# Biên dịch TypeScript ra thư mục dist/
RUN npm run build

# ============================================================
# Stage 2: Production Runner (Image siêu nhẹ cho production)
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Cài OpenSSL cho Prisma
RUN apk add --no-cache openssl

# Thiết lập biến môi trường mặc định
ENV NODE_ENV=production
ENV PORT=8080
# Lắng nghe trên 0.0.0.0 để container nhận được request từ máy ngoài
ENV HOST_NAME=0.0.0.0

# Copy package files để cài production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy prisma schema và sinh Prisma Client cho môi trường runner
COPY prisma ./prisma
RUN npx prisma generate

# Lấy mã JavaScript đã biên dịch từ Stage 1
COPY --from=builder /app/dist ./dist

# Copy thư mục static assets (ảnh, uploads) và tài liệu Swagger
COPY src/public ./src/public
COPY src/swagger ./src/swagger

EXPOSE 8080

# Tự động đẩy schema vào database và khởi chạy server
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
