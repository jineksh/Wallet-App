import { executeInTransaction } from '../utils/txns.js';
import { getPrismaClient, ShardId } from '../config/db.js';
import * as walletRepository from '../repository/wallet.js';
import { conflict, notFound ,badRequest} from '../utils/appError.js';
import * as ledgerRepository from '../repository/ledger.js';

function getShardId(userId: bigint): ShardId {
    return userId % 2n === 0n ? ShardId.SHARD_1 : ShardId.SHARD_2;
}

export async function createWallet(userId: string) {

    const UserId = BigInt(userId);

    const shardId = getShardId(UserId);

    return await executeInTransaction(shardId, async (tx: any) => {
        const existingWallet = await walletRepository.findByUserId(UserId, tx);
        if (existingWallet) {
            throw conflict('Wallet already exists');
        }

        return await walletRepository.createWallet(UserId, tx);
    });
}

export async function getWallet(userId: string) {
    const UserId = BigInt(userId);
    const shardId = getShardId(UserId);
    const client = getPrismaClient(shardId);

    const wallet = await walletRepository.findByUserId(UserId, client);
    if (!wallet) throw notFound('Wallet not found');

    return wallet;
}

export async function updateWalletBalance(
    userId: bigint,
    walletId: bigint,
    newBalance: bigint
) {
    const shardId = getShardId(userId);

    return await executeInTransaction(shardId, async (tx: any) => {
        const wallet = await walletRepository.findByUserIdWithLock(userId, tx);
        if (!wallet) throw notFound('Wallet not found');

        return await walletRepository.updateWalletBalance(
            walletId,
            newBalance,
            wallet.version,
            tx
        );
    });
}


export async function addMoney(
    userId : bigint,
    walletId : bigint,
    amount : bigint,
    transactionId : bigint

){


    const shardId = getShardId(userId);

    return await executeInTransaction(shardId, async (tx : any)=>{

        const wallet = await walletRepository.findByUserIdWithLock(userId, tx);
        if(!wallet) throw notFound('Wallet not found');

        const newBalance = wallet.balance + amount;

        const updatedWallet =  await walletRepository.updateWalletBalance(
            walletId,
            newBalance,
            wallet.version,
            tx
        );

        if(!updatedWallet) throw new Error('Failed to update wallet balance');

        await ledgerRepository.createLedgerEntry(
            userId,
            transactionId,
            amount,
            'CREDIT',
            tx
        );

        return updatedWallet;

    


    })

}


export async function deductMoney(
    userId : bigint,
    walletId : bigint,
    amount : bigint,
    transactionId : bigint
){

    const shardId = getShardId(userId);
     if(amount <= 0n) throw badRequest('Amount must be greater than 0');

    return await executeInTransaction(shardId, async (tx : any)=>{

        const wallet = await walletRepository.findByUserIdWithLock(userId, tx);
        if(!wallet) throw notFound('Wallet not found');

        if(wallet.balance < amount){
            throw conflict('Insufficient balance');
        }

        const newBalance = wallet.balance - amount;

        const updatedWallet = await walletRepository.updateWalletBalance(
            walletId,
            newBalance,
            wallet.version,
            tx
        );

        if(!updatedWallet) throw new Error('Failed to update wallet balance');

        await ledgerRepository.createLedgerEntry(
            userId,
            transactionId,
            amount,
            'DEBIT',
            tx
        );

        return updatedWallet;


    })
}