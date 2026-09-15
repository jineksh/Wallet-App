import { executeInTransaction } from '../utils/txns.js';
import { getPrismaClient } from '../config/db.js';
import * as walletRepository from '../repository/wallet.js';
import { conflict, notFound } from '../utils/appError.js';
import * as ledgerRepository from '../repository/ledger.js';
import { getShardId } from '../utils/shardReslover.js';
import logger from '../config/logger.js';



export async function createWallet(userId: string) {

    const UserId = BigInt(userId);
    logger.info('Starting wallet creation', { userId: UserId.toString() });

    const shardId = getShardId(UserId);

    return await executeInTransaction(shardId, async (tx: any) => {

        const existingWallet = await walletRepository.findByUserId(UserId, tx);

        if (existingWallet) {
            logger.warn('Wallet already exists', { userId: UserId.toString() });
            throw conflict('Wallet already exists');
        }

        const wallet = await walletRepository.createWallet(UserId, tx);
        logger.info('Wallet created in DB', { userId: UserId.toString(), walletId: wallet.id.toString() });
        return wallet;
    });
}

export async function getWallet(userId: string) {
    const UserId = BigInt(userId);
    logger.info('Fetching wallet', { userId: UserId.toString() });

    const shardId = getShardId(UserId);

    const client = getPrismaClient(shardId);

    const wallet = await walletRepository.findByUserId(UserId, client);

    if (!wallet) {
        logger.warn('Wallet not found', { userId: UserId.toString() });
        throw notFound('Wallet not found');
    }

    logger.info('Wallet fetched', { userId: UserId.toString(), walletId: wallet.id.toString() });
    return wallet;
}

export async function updateWalletBalance(
    userId: bigint,
    walletId: bigint,
    newBalance: bigint
) {
    const shardId = getShardId(userId);
    logger.info('Updating wallet balance', { userId: userId.toString(), walletId: walletId.toString(), newBalance: newBalance.toString() });

    return await executeInTransaction(shardId, async (tx: any) => {

        const wallet = await walletRepository.findByUserIdWithLock(userId, tx);

        if (!wallet) {
            logger.warn('Wallet balance update failed - wallet not found', { userId: userId.toString() });
            throw notFound('Wallet not found');
        }

        const updatedWallet = await walletRepository.updateWalletBalance(
            walletId,
            newBalance,
            wallet.version,
            tx
        );

        logger.info('Wallet balance updated', { userId: userId.toString(), walletId: walletId.toString(), newBalance: newBalance.toString() });
        return updatedWallet;
    });
}


export async function addMoney(
    userId: bigint,
    walletId: bigint,
    amount: bigint,
    transactionId?: bigint

) {


    const shardId = getShardId(userId);
    logger.info('Adding money to wallet', {
        userId: userId.toString(),
        walletId: walletId.toString(),
        amount: amount.toString(),
        transactionId: transactionId?.toString() // optional chaining lagao
    });
    return await executeInTransaction(shardId, async (tx: any) => {

        const wallet = await walletRepository.findByUserIdWithLock(userId, tx);
        if (!wallet) {
            logger.warn('Add money failed - wallet not found', { userId: userId.toString() });
            throw notFound('Wallet not found');
        }

        const newBalance = wallet.balance + amount;

        const updatedWallet = await walletRepository.updateWalletBalance(
            walletId,
            newBalance,
            wallet.version,
            tx
        );

        if (!updatedWallet) {
            logger.error('Add money failed - balance update returned null', { userId: userId.toString(), walletId: walletId.toString() });
            throw new Error('Failed to update wallet balance');
        }

        if (transactionId) {
            await ledgerRepository.createLedgerEntry(
                userId,
                transactionId,
                amount,
                'CREDIT',
                tx
            );
        }

        logger.info('Money added to wallet successfully', { userId: userId.toString(), walletId: walletId.toString(), newBalance: newBalance.toString() });
        return updatedWallet;




    })

}

export async function debit(
    userId: bigint,
    amount: bigint,
    transactionId: bigint,
    tx: any
) {
    logger.info('Debiting wallet', { userId: userId.toString(), amount: amount.toString(), transactionId: transactionId.toString() });
    const wallet = await walletRepository.findByUserIdWithLock(userId, tx);

    if (!wallet) {
        logger.warn('Debit failed - wallet not found', { userId: userId.toString() });
        throw notFound("Wallet not found");
    }

    if (wallet.balance < amount) {
        logger.warn('Debit failed - insufficient balance', { userId: userId.toString(), currentBalance: wallet.balance.toString(), amount: amount.toString() });
        throw conflict("Insufficient balance");
    }

    const newBalance = wallet.balance - amount;

    const updatedWallet = await walletRepository.updateWalletBalance(wallet.id, newBalance, wallet.version, tx);

    if (!updatedWallet) {
        logger.error('Debit failed - wallet balance update returned null', { userId: userId.toString() });
        throw new Error("Failed to update wallet balance");
    }

    await ledgerRepository.createLedgerEntry(
        userId,
        transactionId,
        amount,
        'DEBIT',
        tx
    );

    logger.info('Wallet debited successfully', { userId: userId.toString(), newBalance: newBalance.toString() });
    return updatedWallet;
}


export async function credit(
    userId: bigint,
    amount: bigint,
    transactionId: bigint,
    tx: any
) {
    logger.info('Crediting wallet', { userId: userId.toString(), amount: amount.toString(), transactionId: transactionId.toString() });
    const wallet = await walletRepository.findByUserIdWithLock(userId, tx);

    if (!wallet) {
        logger.warn('Credit failed - wallet not found', { userId: userId.toString() });
        throw notFound("Wallet not found");
    }

    const newBalance = wallet.balance + amount;

    const updatedWallet = await walletRepository.updateWalletBalance(wallet.id, newBalance, wallet.version, tx);

    if (!updatedWallet) {
        logger.error('Credit failed - wallet balance update returned null', { userId: userId.toString() });
        throw new Error("Failed to update wallet balance");
    }

    await ledgerRepository.createLedgerEntry(
        userId,
        transactionId,
        amount,
        'CREDIT',
        tx
    );

    logger.info('Wallet credited successfully', { userId: userId.toString(), newBalance: newBalance.toString() });
    return updatedWallet;
}