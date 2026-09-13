import { Router } from 'express';
import { createWalletController, getWalletController, addMoneyController } from '../../controllers/walletController.js';

const walletRouter = Router();

walletRouter.post('/', createWalletController);
walletRouter.get('/:userId', getWalletController);
walletRouter.post('/add-money', addMoneyController);

export default walletRouter;
