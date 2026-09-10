import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydb';