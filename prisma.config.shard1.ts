// prisma.config.shard1.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";
import { DB_SHARD1 } from "./src/config/env.js";
export default defineConfig({
  schema: "prisma/shard1/schema1.prisma",
  migrations: {
    path: "prisma/shard1/migrations",
  },
  datasource: {
    url: DB_SHARD1,
  },
});