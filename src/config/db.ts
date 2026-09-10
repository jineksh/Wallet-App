import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from './env';

const adapter = new PrismaPg({
    connectionString: DATABASE_URL
});


export const prisma = new PrismaClient({ adapter });


async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('[DATABASE] : Connected to the database');
    } catch (error) {
        console.error('[DATABASE] : Error connecting to the database:', error);
        throw error;
    }
}


export default connectToDatabase;
