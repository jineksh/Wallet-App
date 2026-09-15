import { Router } from 'express';
import { transfer } from '../../controllers/txns.ontroller.js';

const txnsRouter = Router();

txnsRouter.post('/transfer', transfer);


export default txnsRouter;
