/**
 * @deprecated LEGACY SQLite/Prisma Configuration
 * The authoritative CampusNoa production database is MongoDB Atlas powered by Mongoose.
 * See src/config/mongo.js for the active database connection.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error']
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
