import { Wallet } from '../types/wallet';
import logger from '../config/logger.js';

export async function createWallet(userId: bigint, tx: any): Promise<Wallet> {
    logger.info('Repository: creating wallet record', { userId: userId.toString() });
    const wallet = await tx.wallet.create({
        data: {
            user_id: userId,
            balance: 0,
            version: 1
        }
    });

    logger.info('Repository: wallet record created', { userId: userId.toString(), walletId: wallet.id.toString() });
    return mapToWallet(wallet);
}

export async function findById(walletId: bigint, client: any): Promise<Wallet | null> {
    logger.info('Repository: fetching wallet by id', { walletId: walletId.toString() });
    const wallet = await client.wallet.findUnique({
        where: { id: walletId }
    });

    if (!wallet) {
        logger.warn('Repository: wallet not found by id', { walletId: walletId.toString() });
        return null;
    }
    return mapToWallet(wallet);
}

export async function findByUserIdWithLock(userId: bigint, tx: any): Promise<Wallet | null> {
    logger.info('Repository: acquiring wallet row lock', { userId: userId.toString() });
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

    if (!result[0]) {
        logger.warn('Repository: wallet lock query returned no wallet', { userId: userId.toString() });
        return null;
    }
    return mapToWallet(result[0]);
}

export async function findByUserId(userId: bigint, client: any): Promise<Wallet | null> {
    logger.info('Repository: fetching wallet by user id', { userId: userId.toString() });
    const wallet = await client.wallet.findUnique({
        where: { user_id: userId }
    });

    if (!wallet) {
        logger.warn('Repository: wallet not found by user id', { userId: userId.toString() });
        return null;
    }
    return mapToWallet(wallet);
}

export async function updateWalletBalance(walletId: bigint, newBalance: bigint, expectedVersion: number, tx: any): Promise<Wallet | null> {
    logger.info('Repository: updating wallet balance', {
        walletId: walletId.toString(),
        newBalance: newBalance.toString(),
        expectedVersion,
    });
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
        logger.error('Repository: wallet balance update failed due to version mismatch or missing wallet', {
            walletId: walletId.toString(),
            expectedVersion,
        });
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