import { v4 as uuidV4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';

export const idempotentMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const transactionId = req.headers['x-transaction-id'] as string || req.body?.transactionId as string;

    if (!transactionId) {
        req.body.idempotencyKey = uuidV4();
    } else {
        req.body.idempotencyKey = transactionId;
    }

    next();
};