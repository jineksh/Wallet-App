export enum TxnStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export interface Txns {
    id?: bigint;
    senderId: bigint;
    receiverId: bigint;
    amount: bigint;
    idempotencyKey: string;
    status: TxnStatus;
    createdAt?: Date;
}