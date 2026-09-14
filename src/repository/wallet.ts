import { Wallet } from '../types/wallet';

export async function createWallet(userId: bigint, tx: any): Promise<Wallet> {
    const wallet = await tx.wallet.create({
        data: {
            user_id: userId,
            balance: 0,
            version: 1
        }
    });

    return mapToWallet(wallet);
}

export async function findById(walletId: bigint, client: any): Promise<Wallet | null> {
    const wallet = await client.wallet.findUnique({
        where: { id: walletId }
    });

    if (!wallet) return null;
    return mapToWallet(wallet);
}

export async function findByUserIdWithLock(userId: bigint, tx: any): Promise<Wallet | null> {
    const result = await tx.$queryRaw<Array<{
        id: bigint,
        user_id: bigint,
        balance: bigint,
        version: number,
        created_at: Date,
        updated_at: Date
    }>>`
        SELECT id, user_id, balance, version, created_at, updated_at
        FROM wallets
        WHERE user_id = ${userId}
        FOR UPDATE
    `;

    if (!result[0]) return null;
    return mapToWallet(result[0]);
}

export async function findByUserId(userId: bigint, client: any): Promise<Wallet | null> {
    const wallet = await client.wallet.findUnique({
        where: { user_id: userId }
    });

    if (!wallet) return null;
    return mapToWallet(wallet);
}

export async function updateWalletBalance(walletId: bigint, newBalance: bigint, expectedVersion: number, tx: any): Promise<Wallet | null> {
    const updatedWallet = await tx.wallet.updateMany({
        where: {
            id: walletId,
            version: expectedVersion
        },
        data: {
            balance: newBalance,
            version: expectedVersion + 1
        }
    });

    if (updatedWallet.count === 0) {
        throw new Error('Version mismatch or wallet not found');
    }

    return await findById(walletId, tx);
}

function mapToWallet(wallet: any): Wallet {
    return {
        id: wallet.id,
        userId: wallet.user_id,
        balance: wallet.balance,
        version: wallet.version,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at
    };
}