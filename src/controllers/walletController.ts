import { NextFunction, Request, Response } from 'express';
import { addMoney, createWallet, getWallet } from '../service/wallet.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { badRequest } from '../utils/appError.js';

function getStringValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return String(value);
}

function toBigIntValue(value: unknown, fieldName: string): bigint {
  const stringValue = getStringValue(value);

  if (stringValue === undefined || stringValue === '') {
    throw badRequest(`${fieldName} is required`);
  }

  try {
    return BigInt(stringValue);
  } catch {
    throw badRequest(`${fieldName} must be a valid number`);
  }
}

export async function createWalletController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getStringValue(req.body?.userId);

    if (!userId) {
      throw badRequest('userId is required');
    }

    const wallet = await createWallet(userId);
    return sendSuccess(res, wallet, 201, 'Wallet created successfully');
  } catch (error) {
    next(error);
  }
}

export async function getWalletController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getStringValue(req.params.userId);

    if (!userId) {
      throw badRequest('userId is required');
    }

    const wallet = await getWallet(userId);
    return sendSuccess(res, wallet, 200, 'Wallet fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function addMoneyController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getStringValue(req.body?.userId);
    const walletId = getStringValue(req.body?.walletId);
    const amount = getStringValue(req.body?.amount);
    const transactionId = getStringValue(req.body?.transactionId);

    if (!userId) {
      throw badRequest('userId is required');
    }

    if (!walletId) {
      throw badRequest('walletId is required');
    }

    if (!amount) {
      throw badRequest('amount is required');
    }

    if (!transactionId) {
      throw badRequest('transactionId is required');
    }

    const wallet = await addMoney(
      toBigIntValue(userId, 'userId'),
      toBigIntValue(walletId, 'walletId'),
      toBigIntValue(amount, 'amount'),
      toBigIntValue(transactionId, 'transactionId')
    );

    return sendSuccess(res, wallet, 200, 'Money added successfully');
  } catch (error) {
    next(error);
  }
}
