import { v4 as uuidV4 } from 'uuid';
import { NextFunction, Request, Response } from 'express';


export const idempotentMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const transactionId = req.headers['x-transaction-id'] as string || req.body?.transactionId as string;

    if (!transactionId) {
        
        const newTransactionId = uuidV4();

        if(req.body){
            req.body.idempoteny = newTransactionId;
        }

    }
    next();
};

