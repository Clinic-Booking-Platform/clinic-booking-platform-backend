"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
require("dotenv/config");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma || new client_1.PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"] });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
