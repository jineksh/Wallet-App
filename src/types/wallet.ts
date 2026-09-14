export interface Wallet {
    id: bigint;
    userId: bigint;
    balance: bigint;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}
