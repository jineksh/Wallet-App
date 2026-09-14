export type LedgerType = 'CREDIT' | 'DEBIT';

export interface Ledger {
    id: bigint;
    userId: bigint;
    transactionId: bigint;
    amount: bigint;
    type: LedgerType;
    createdAt: Date;
}