export async function createWallet(userId: bigint, tx: any) {
    return await tx.wallet.create({
        data: {
            user_id: userId,
            balance: 0,
            version: 1
        }
    });
}

export async function findById(walletId: bigint, client: any) {
    return await client.wallet.findUnique({
        where: { id: walletId }
    });
}

export async function findByUserIdWithLock(userId: bigint, tx: any) {
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

    return result[0] ?? null;
}

export async function findByUserId(userId: bigint, client: any) {
    return await client.wallet.findUnique({
        where: { user_id: userId }
    });
}

export async function updateWalletBalance(walletId : bigint, newBalance: bigint, expectedVersion: number, tx: any) {
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