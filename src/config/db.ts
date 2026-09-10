import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from './env.js';
import logger from './logger.js';

const adapter = new PrismaPg({
    connectionString: DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });

async function connectToDatabase() {
    try {
        await prisma.$connect();
        logger.info('Database connected', {
            databaseUrl: DATABASE_URL.replace(/:[^@]*@/, ':***@'),
        });
    } catch (error) {
        logger.error('Database connection failed', { error });
        throw error;
    }
}

export default connectToDatabase;
