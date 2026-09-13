export async function createLedgerEntry(
    userId: bigint,
    transactionId: bigint,
    amount: bigint,
    type: 'CREDIT' | 'DEBIT',
    tx: any
) {
    return await tx.ledger.create({
        data: {
            user_id: userId,
            transaction_id: transactionId,
            amount: amount,
            type: type
        }
    });
}