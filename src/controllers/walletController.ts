import { NextFunction, Request, Response } from 'express';
import { addMoney, createWallet, getWallet } from '../service/wallet.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { badRequest } from '../utils/appError.js';

export async function createWalletController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body ?? {};

    if (userId === undefined || userId === null || userId === '') {
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
    const { userId } = req.params;  

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
    const { userId, walletId, amount, transactionId } = req.body ?? {};

    if (userId === undefined || userId === null || userId === '') {
      throw badRequest('userId is required');
    }

    if (walletId === undefined || walletId === null || walletId === '') {
      throw badRequest('walletId is required');
    }

    if (amount === undefined || amount === null || amount === '') {
      throw badRequest('amount is required');
    }

    if (transactionId === undefined || transactionId === null || transactionId === '') {
      throw badRequest('transactionId is required');
    }

    const wallet = await addMoney(
      BigInt(userId),
      BigInt(walletId),
      BigInt(amount),
      BigInt(transactionId)
    );

    return sendSuccess(res, wallet, 200, 'Money added successfully');
  } catch (error) {
    next(error);
  }
}
