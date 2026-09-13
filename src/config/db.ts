import { PrismaClient as Shard1Client } from "../../generated/prisma/shard1/client.js";
import { PrismaClient as Shard2Client } from "../../generated/prisma/shard2/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { DB_SHARD1, DB_SHARD2 } from "./env.js";


export enum ShardId {
    SHARD_1 = 1,
    SHARD_2 = 2,
}


// Singleton
let shard1Client: Shard1Client | null = null;
let shard2Client: Shard2Client | null = null;

function getShard1Client(): Shard1Client {
    if (!shard1Client) {
        const adapter = new PrismaPg({
            connectionString: DB_SHARD1
        });
        shard1Client = new Shard1Client({ adapter });
    }
    return shard1Client;
}

function getShard2Client(): Shard2Client {
    if (!shard2Client) {
        const adapter = new PrismaPg({
            connectionString: DB_SHARD2
        });
        shard2Client = new Shard2Client({ adapter });
    }
    return shard2Client;
}

export function getPrismaClient(shardId: ShardId) {
    return shardId === ShardId.SHARD_1
        ? getShard1Client()
        : getShard2Client();
}

export async function connectClients(): Promise<void> {
    await getShard1Client().$connect();
    await getShard2Client().$connect();
    console.log('All shards connected');
}

export async function closeClients(): Promise<void> {
    if (shard1Client) {
        await shard1Client.$disconnect();
        shard1Client = null;
    }
    if (shard2Client) {
        await shard2Client.$disconnect();
        shard2Client = null;
    }
}