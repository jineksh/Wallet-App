import { Router } from 'express';
import { createWalletController, getWalletController, addMoneyController } from '../../controllers/walletController.js';
import { idempotentMiddleware } from '../../middlewares/idempotent.js';

const walletRouter = Router();

walletRouter.post('/', createWalletController);
walletRouter.get('/:userId', getWalletController);
walletRouter.post('/add-money', idempotentMiddleware, addMoneyController);

export default walletRouter;
