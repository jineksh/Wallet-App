// prisma.config.shard2.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/shard2/schema2.prisma",
  migrations: {
    path: "prisma/shard2/migrations",
  },
  datasource: {
    url: process.env.DB_SHARD2!,
  },
});