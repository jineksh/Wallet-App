import { Router } from 'express';
import { getTransactionHistoryController, transfer } from '../../controllers/txns.ontroller.js';
import { idempotentMiddleware } from '../../middlewares/idempotent.js';

const txnsRouter = Router();

txnsRouter.post('/transfer', idempotentMiddleware, transfer);
txnsRouter.get('/history/:userId', getTransactionHistoryController);

txnsRouter.get('/by-key', async (req, res, next) => {
    try {
        const { key, userId } = req.query;

        if (!key || !userId) {
            throw new Error('key and userId are required');
        }

        const { getTxnsByIdempotency } = await import('../../service/txns.js');
        const result = await getTxnsByIdempotency(String(key), BigInt(String(userId)));

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

export default txnsRouter;
