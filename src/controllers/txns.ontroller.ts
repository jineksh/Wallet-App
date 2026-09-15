import { NextFunction, Request, Response } from 'express';
import sagaManager from '../Saga/Orchestrator/sagaOrchestator.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { badRequest } from '../utils/appError.js';
import logger from '../config/logger.js';
import { getHistory } from '../service/txns.js';

export async function transfer(req: Request, res: Response, next: NextFunction) {
    try {
        const { from_user, to_user, amount, idempotencyKey } = req.body ?? {};
        logger.info('Transfer request received', { from_user, to_user, amount, idempotencyKey });

        if (from_user === undefined || from_user === null || from_user === '') {
            throw badRequest('from_user is required');
        }

        if (to_user === undefined || to_user === null || to_user === '') {
            throw badRequest('to_user is required');
        }

        if (idempotencyKey === undefined || idempotencyKey === null || idempotencyKey === '') {
            throw badRequest('idempotencyKey is required');
        }

        if (amount === undefined || amount === null || amount === '') {
            throw badRequest('amount is required');
        }

        let parsedFromUser: bigint;
        let parsedToUser: bigint;
        let parsedAmount: bigint;

        try {
            parsedFromUser = BigInt(from_user);
            parsedToUser = BigInt(to_user);
            parsedAmount = BigInt(amount);
        } catch {
            throw badRequest('from_user, to_user, and amount must be valid numeric values');
        }

        if (parsedAmount <= 0n) {
            throw badRequest('amount must be greater than zero');
        }

        const result = await sagaManager.transfer(
            parsedFromUser,
            parsedToUser,
            parsedAmount,
            String(idempotencyKey)
        );

        logger.info('Transfer processed successfully', {
            from_user: parsedFromUser.toString(),
            to_user: parsedToUser.toString(),
            amount: parsedAmount.toString(),
            idempotencyKey: String(idempotencyKey),
        });

        return sendSuccess(res, result?.transaction ?? result, 200, 'Transfer processed successfully');
    } catch (error) {
        logger.error('Transfer request failed', {
            error: error instanceof Error ? error.message : error,
            from_user: req.body?.from_user,
            to_user: req.body?.to_user,
            amount: req.body?.amount,
            idempotencyKey: req.body?.idempotencyKey,
        });
        next(error);
    }
}

export async function getTransactionHistoryController(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId ?? req.query.user_id;

        if (userId === undefined || userId === null || userId === '') {
            throw badRequest('userId is required');
        }

        const parsedUserId = BigInt(String(userId));
        const history = await getHistory(parsedUserId);

        return sendSuccess(res, history, 200, 'Transaction history fetched successfully');
    } catch (error) {
        next(error);
    }
}