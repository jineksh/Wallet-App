import { executeInTransaction } from '../utils/txns.js';
import { getShardId } from '../utils/shardReslover.js';
import * as txnsRepository from '../repository/txns.js';
import { TxnStatus } from '../types/txns.js';
import {getShard1Client, getShard2Client} from '../config/db.js';


/**
 * find shard id based on userId
 * @param userId 
 * @returns ShardId
 * cheak with idempotency key if transaction is already processed or not
 * if yes then return the transaction status
 * if not then create a new transaction in pending state and return it
 * 
 */


export async function createTxns(from_user: bigint, to_user: bigint, idempotencyKey: string, amount: bigint) {

    const shardId = getShardId(from_user);

    return await executeInTransaction(shardId, async (tx: any) => {
        const existingTxn = await txnsRepository.findTxnsByIdempotencyKey(idempotencyKey, tx);

        if (existingTxn) {
            return existingTxn;
        }

        const newTxn = await txnsRepository.createTxns({
            senderId: from_user,
            receiverId: to_user,
            amount: amount,
            idempotencyKey: idempotencyKey,
            status: TxnStatus.PENDING,
        }, tx);

        return newTxn;
    });

}

/**
 * determine the shard id based on the from_user and update the transaction status in the corresponding shard
 */

export async function updateTxnsStatus(idempotencyKey: string, status: TxnStatus,from_user: bigint) {

    const shardId = getShardId(from_user);

    return await executeInTransaction(shardId, async (tx: any) => {
        const updatedTxn = await txnsRepository.updateTxnsStatus(idempotencyKey, status, tx);

        if (!updatedTxn) {
            throw new Error('Transaction not found');
        }
        
        return updatedTxn;
    });

}


export async function getHistory(userId: bigint) {

    const shard1 = getShard1Client();
    const shard2 = getShard2Client();

    const history = await txnsRepository.getHistory(userId, shard1, shard2);

    return history;
}








