const { PrismaClient } = require('@prisma/client');

// Use a global variable to prevent creating multiple PrismaClient instances during dev/hot-reloading
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;
