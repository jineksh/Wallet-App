
import { Ledger, LedgerType } from '../types/ledger';


export async function createLedgerEntry(
    userId: bigint,
    transactionId: bigint,
    amount: bigint,
    type: LedgerType,
    tx: any
): Promise<Ledger> {
    const ledger = await tx.ledger.create({
        data: {
            user_id: userId,
            transaction_id: transactionId,
            amount: amount,
            type: type
        }
    });

    return mapToLedger(ledger);
}

export async function findById(id: bigint, client: any): Promise<Ledger | null> {
    const ledger = await client.ledger.findUnique({
        where: { id }
    });

    if (!ledger) return null;
    return mapToLedger(ledger);
}

export async function getHistory(userId: bigint, client: any): Promise<Ledger[]> {
    const ledgers = await client.ledger.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });

    return ledgers.map(mapToLedger);
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