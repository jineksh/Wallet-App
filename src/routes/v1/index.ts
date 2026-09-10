import { Router } from 'express';
import healthRouter from './health.js';
import userRouter from './user.js';

const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/users', userRouter);

export default v1Router;
