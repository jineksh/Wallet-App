import { getPrismaClient, ShardId } from '../config/db.js';

export async function executeInTransaction<T>(
    shardId: ShardId,
    fn: (tx: any) => Promise<T>
): Promise<T> {
    const client = getPrismaClient(shardId);

    return client.$transaction(fn, {
        isolationLevel: 'RepeatableRead',
    });
}