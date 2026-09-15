import { NextFunction, Request, Response } from 'express';
import sagaManager from '../Saga/Orchestrator/sagaOrchestator.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { badRequest } from '../utils/appError.js';

export async function transfer(req: Request, res: Response, next: NextFunction) {
    try {
        const { from_user, to_user, amount, idempotencyKey } = req.body ?? {};

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

        return sendSuccess(res, result?.transaction ?? result, 200, 'Transfer processed successfully');
    } catch (error) {
        next(error);
    }
}