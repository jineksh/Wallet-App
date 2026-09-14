import { ShardId } from '../types/shard.js';

export function getShardId(userId: bigint): ShardId {
    return userId % 2n === 0n ? ShardId.SHARD_1 : ShardId.SHARD_2;
}