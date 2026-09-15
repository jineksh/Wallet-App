import { Router } from 'express';
import healthRouter from './health.js';
import userRouter from './user.js';
import walletRouter from './wallet.js';
import txnsRouter from './txns.js';

const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/users', userRouter);
v1Router.use('/wallets', walletRouter);
v1Router.use('/transactions', txnsRouter);


export default v1Router;
