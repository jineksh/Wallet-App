// prisma.config.shard2.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";
import { DB_SHARD2 } from "./src/config/env.js";

export default defineConfig({
  schema: "prisma/shard2/schema2.prisma",
  migrations: {
    path: "prisma/shard2/migrations",
  },
  datasource: {
    url: DB_SHARD2,
  },
});