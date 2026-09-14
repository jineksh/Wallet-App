import { Txns, TxnStatus } from '../types/txns';



export async function createTxns(data: Txns, tx: any): Promise<Txns> {
    const txns = await tx.create({
        data: {
            from_user: data.senderId,
            to_user: data.receiverId,
            amount: data.amount,
            idempotency_key: data.idempotencyKey,
            status: data.status
        }
    });

    return mapToTxns(txns);
}

export async function findTxnsByIdempotencyKey(idempotencyKey: string, tx: any): Promise<Txns | null> {
    const txns = await tx.findFirst({
        where: { idempotency_key: idempotencyKey }
    });

    if (!txns) return null;
    return mapToTxns(txns);
}

export async function updateTxnsStatus(
    idempotencyKey: string,
    status: TxnStatus,
    tx: any
): Promise<Txns | null> {
    const txns = await tx.update({
        where: { idempotency_key: idempotencyKey },
        data: { status }
    });

    if (!txns) return null;
    return mapToTxns(txns);
}

export async function findByTxnId(id: bigint, tx: any): Promise<Txns | null> {
    const txns = await tx.findFirst({
        where: { id }
    });

    if (!txns) return null;
    return mapToTxns(txns);
}

export async function getHistory(userId: bigint, client1: any, client2: any): Promise<Txns[]> {
    const [txns1, txns2] = await Promise.all([
        client1.findMany({
            where: {
                OR: [
                    { from_user: userId },
                    { to_user: userId }
                ]
            }
        }),
        client2.findMany({
            where: {
                OR: [
                    { from_user: userId },
                    { to_user: userId }
                ]
            }
        })
    ]);

    return [...txns1, ...txns2]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(mapToTxns);
}

function mapToTxns(txns: any): Txns {
    return {
        id: txns.id,
        senderId: txns.from_user,
        receiverId: txns.to_user,
        amount: txns.amount,
        idempotencyKey: txns.idempotency_key,
        status: txns.status as TxnStatus,
        createdAt: txns.created_at
    };
}