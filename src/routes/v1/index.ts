import { Router } from 'express';
import healthRouter from './health.js';
import userRouter from './user.js';
import walletRouter from './wallet.js';

const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/users', userRouter);
v1Router.use('/wallets', walletRouter);

export default v1Router;
