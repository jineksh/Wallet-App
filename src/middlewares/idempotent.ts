import { v4 as uuidV4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger.js';

export const idempotentMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const transactionId = req.headers['x-transaction-id'] as string || req.body?.transactionId as string;

    if (!transactionId) {
        req.body.idempotencyKey = uuidV4();
        logger.info('Generated idempotency key', { key: req.body.idempotencyKey });
    } else {
        req.body.idempotencyKey = transactionId;
        logger.info('Using provided idempotency key', { key: req.body.idempotencyKey });
    }

    next();
};