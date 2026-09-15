
import { Ledger, LedgerType } from '../types/ledger';
import logger from '../config/logger.js';


export async function createLedgerEntry(
    userId: bigint,
    transactionId: bigint,
    amount: bigint,
    type: LedgerType,
    tx: any
): Promise<Ledger> {
    logger.info('Repository: creating ledger entry', {
        userId: userId.toString(),
        transactionId: transactionId.toString(),
        amount: amount.toString(),
        type,
    });
    const ledger = await tx.ledger.create({
        data: {
            user_id: userId,
            transaction_id: transactionId,
            amount: amount,
            type: type
        }
    });

    const mapped = mapToLedger(ledger);
    logger.info('Repository: ledger entry created', { ledgerId: mapped.id?.toString(), type });
    return mapped;
}

export async function findById(id: bigint, client: any): Promise<Ledger | null> {
    logger.info('Repository: fetching ledger by id', { ledgerId: id.toString() });
    const ledger = await client.ledger.findUnique({
        where: { id }
    });

    if (!ledger) {
        logger.warn('Repository: ledger record not found by id', { ledgerId: id.toString() });
        return null;
    }
    return mapToLedger(ledger);
}

export async function getHistory(userId: bigint, client: any): Promise<Ledger[]> {
    logger.info('Repository: fetching ledger history', { userId: userId.toString() });
    const ledgers = await client.ledger.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });

    const result = ledgers.map(mapToLedger);
    logger.info('Repository: ledger history fetched', { userId: userId.toString(), count: result.length });
    return result;
}

function mapToLedger(ledger: any): Ledger {
    return {
        id: ledger.id,
        userId: ledger.user_id,
        transactionId: ledger.transaction_id,
        amount: ledger.amount,
        type: ledger.type as LedgerType,
        createdAt: ledger.created_at
    };
}