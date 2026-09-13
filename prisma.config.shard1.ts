// prisma.config.shard1.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/shard1/schema1.prisma",
  migrations: {
    path: "prisma/shard1/migrations",
  },
  datasource: {
    url: process.env.DB_SHARD1!,
  },
});