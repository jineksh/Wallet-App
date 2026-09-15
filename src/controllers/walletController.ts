import { NextFunction, Request, Response } from 'express';
import { addMoney, createWallet, getWallet } from '../service/wallet.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { badRequest } from '../utils/appError.js';
import logger from '../config/logger.js';

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
    logger.info('Create wallet request received', { userId });

    if (!userId) {
      throw badRequest('userId is required');
    }

    const wallet = await createWallet(userId);
    logger.info('Wallet created successfully', { userId, walletId: wallet?.id });
    return sendSuccess(res, wallet, 201, 'Wallet created successfully');
  } catch (error) {
    logger.error('Create wallet request failed', {
      error: error instanceof Error ? error.message : error,
      userId: getStringValue(req.body?.userId),
    });
    next(error);
  }
}

export async function getWalletController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getStringValue(req.params.userId);
    logger.info('Get wallet request received', { userId });

    if (!userId) {
      throw badRequest('userId is required');
    }

    const wallet = await getWallet(userId);
    logger.info('Wallet fetched successfully', { userId, walletId: wallet?.id });
    return sendSuccess(res, wallet, 200, 'Wallet fetched successfully');
  } catch (error) {
    logger.error('Get wallet request failed', {
      error: error instanceof Error ? error.message : error,
      userId: getStringValue(req.params.userId),
    });
    next(error);
  }
}

export async function addMoneyController(req: Request, res: Response, next: NextFunction) {
  const userId = getStringValue(req.body?.userId);

  const walletId = getStringValue(req.body?.walletId);

  const amount = getStringValue(req.body?.amount);

  const transactionId = undefined;
  try {
    logger.info('Add money request received', { userId, walletId, amount, transactionId });

    const wallet = await addMoney(
      toBigIntValue(userId, 'userId'),
      toBigIntValue(walletId, 'walletId'),
      toBigIntValue(amount, 'amount'),
      transactionId ? toBigIntValue(transactionId, 'transactionId') : undefined
    );

    logger.info('Money added successfully', { userId, walletId, amount, walletIdUpdated: wallet?.id });

    return sendSuccess(res, wallet, 200, 'Money added successfully');

  } catch (error) {
    logger.error('Add money request failed', {
      error: error instanceof Error ? error.message : error,
      userId,
      walletId,
      amount,
      transactionId
    });

    next(error);
  }
}
