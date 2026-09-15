import { Txns, TxnStatus } from '../types/txns';
import logger from '../config/logger.js';


export async function createTxns(data: Txns, tx: any): Promise<Txns> {
    logger.info('Repository: creating transaction record', {
        senderId: data.senderId.toString(),
        receiverId: data.receiverId.toString(),
        idempotencyKey: data.idempotencyKey,
    });


    const txns = await tx.transaction.create({
        data: {
            from_user: data.senderId,
            to_user: data.receiverId,
            amount: data.amount,
            idempotency_key: data.idempotencyKey,
            status: data.status
        }
    });

    const mapped = mapToTxns(txns);
    logger.info('Repository: transaction record created', { idempotencyKey: mapped.idempotencyKey, status: mapped.status });
    return mapped;
}

export async function findTxnsByIdempotencyKey(idempotencyKey: string, client: any): Promise<Txns | null> {
    logger.info('Repository: fetching transaction by idempotency key', { idempotencyKey });
    const txns = await client.transaction.findFirst({
        where: { idempotency_key: idempotencyKey }
    });

    if (!txns) {
        logger.warn('Repository: transaction not found by idempotency key', { idempotencyKey });
        return null;
    }
    return mapToTxns(txns);
}

export async function updateTxnsStatus(
    idempotencyKey: string,
    status: TxnStatus,
    tx: any
): Promise<Txns | null> {
    logger.info('Repository: updating transaction status', { idempotencyKey, status });
    const txns = await tx.transaction.update({
        where: { idempotency_key: idempotencyKey },
        data: { status }
    });

    if (!txns) {
        logger.warn('Repository: transaction status update produced no result', { idempotencyKey, status });
        return null;
    }
    return mapToTxns(txns);
}

export async function findByTxnId(id: bigint, tx: any): Promise<Txns | null> {
    logger.info('Repository: fetching transaction by id', { transactionId: id.toString() });
    const txns = await tx.findFirst({
        where: { id }
    });

    if (!txns) {
        logger.warn('Repository: transaction not found by id', { transactionId: id.toString() });
        return null;
    }
    return mapToTxns(txns);
}

export async function getHistory(userId: bigint, client1: any, client2: any): Promise<Txns[]> {
    logger.info('Repository: fetching transaction history', { userId: userId.toString() });
    const [txns1, txns2] = await Promise.all([
        client1.findMany({
            where: {
                OR: [
                    { from_user: userId },
                    { to_user: userId }
                ]
            }
        }),
        client2.findMany({
            where: {
                OR: [
                    { from_user: userId },
                    { to_user: userId }
                ]
            }
        })
    ]);

    const result = [...txns1, ...txns2]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(mapToTxns);

    logger.info('Repository: transaction history assembled', { userId: userId.toString(), count: result.length });
    return result;
}

function mapToTxns(txns: any): Txns {
    return {
        id: txns.id,
        senderId: txns.from_user,
        receiverId: txns.to_user,
        amount: txns.amount,
        idempotencyKey: txns.idempotency_key,
        status: txns.status as TxnStatus,
        createdAt: txns.created_at
    };
}