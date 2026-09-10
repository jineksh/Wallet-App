import express, { Express, NextFunction, Request, Response } from 'express';
import { PORT } from './config/env.js';
import router from './routes/index.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';
import { attachCorrelationIdMiddleware } from './middlewares/corelational.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { getCorrelationId } from './utils/requestHelper.js';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachCorrelationIdMiddleware);



app.use('/api', router);
app.use(errorHandler);

export function startServer() {
    app.listen(PORT, async () => {
        try {
            await connectDB();
            logger.info('Server started', {
                port: PORT,
                correlationId: getCorrelationId(),
            });
        } catch (error) {
            logger.error('Server startup failed', {
                error,
                port: PORT,
                correlationId: getCorrelationId(),
            });
            process.exit(1);
        }
    });
}

startServer();
