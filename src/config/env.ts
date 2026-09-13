import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const DB_SHARD1 = process.env['DB-SHARD1'] || 'postgresql://postgres:postgres@localhost:5433/wallet-shard1';
export const DB_SHARD2 = process.env['DB-SHARD2'] || 'postgresql://postgres:postgres@localhost:5434/wallet-shard2';
