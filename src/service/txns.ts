import { executeInTransaction } from '../utils/txns.js';
import { getShardId } from '../utils/shardReslover.js';
import * as txnsRepository from '../repository/txns.js';
import { TxnStatus } from '../types/txns.js';
import { getPrismaClient, getShard1Client, getShard2Client } from '../config/db.js';
import logger from '../config/logger.js';


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
    logger.info('Creating transaction record', { from_user: from_user.toString(), to_user: to_user.toString(), idempotencyKey, amount: amount.toString() });

    return await executeInTransaction(shardId, async (tx: any) => {
        const existingTxn = await txnsRepository.findTxnsByIdempotencyKey(idempotencyKey, tx);

        if (existingTxn) {
            logger.info('Returning existing transaction by idempotency key', { idempotencyKey, status: existingTxn.status });
            return existingTxn;
        }

        const newTxn = await txnsRepository.createTxns({
            senderId: from_user,
            receiverId: to_user,
            amount: amount,
            idempotencyKey: idempotencyKey,
            status: TxnStatus.PENDING,
        }, tx);

        logger.info('Transaction record created', { idempotencyKey, transactionId: newTxn.id?.toString(), status: newTxn.status });
        return newTxn;
    });

}

/**
 * determine the shard id based on the from_user and update the transaction status in the corresponding shard
 */

export async function updateTxnsStatus(idempotencyKey: string, status: TxnStatus, from_user: bigint) {

    const shardId = getShardId(from_user);
    logger.info('Updating transaction status', { idempotencyKey, status, from_user: from_user.toString() });

    return await executeInTransaction(shardId, async (tx: any) => {
        const updatedTxn = await txnsRepository.updateTxnsStatus(idempotencyKey, status, tx);

        if (!updatedTxn) {
            logger.warn('Transaction status update failed - transaction not found', { idempotencyKey });
            throw new Error('Transaction not found');
        }

        logger.info('Transaction status updated', { idempotencyKey, status, transactionId: updatedTxn.id?.toString() });
        return updatedTxn;
    });



}

export async function getTxnsByIdempotency(key: string, userId: bigint) {

    const shardId = getShardId(userId);


    logger.info('Looking up transaction by idempotency key', { key, userId: userId.toString() });
    const txns = await executeInTransaction(shardId, async (tx) => {
        return await txnsRepository.findTxnsByIdempotencyKey(key, tx);
    })

    logger.info('Transaction lookup result', { key, found: !!txns, status: txns?.status });
    return txns;


}


export async function getHistory(userId: bigint) {

    const shard1 = getShard1Client();
    const shard2 = getShard2Client();

    logger.info('Fetching transaction history', { userId: userId.toString() });
    const history = await txnsRepository.getHistory(userId, shard1, shard2);

    logger.info('Transaction history fetched', { userId: userId.toString(), count: Array.isArray(history) ? history.length : 0 });
    return history;
}








