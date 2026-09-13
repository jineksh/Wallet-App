import express, { Express } from 'express';
import { PORT } from './config/env.js';
import router from './routes/index.js';
import { closeClients } from './config/db.js';  // ← ye change karo
import logger from './config/logger.js';
import { attachCorrelationIdMiddleware } from './middlewares/corelational.js';
import { errorHandler } from './middlewares/errorHandler.js';
import {connectClients} from './config/db.js';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachCorrelationIdMiddleware);

app.use('/api', router);
app.use(errorHandler);

export function startServer() {
    const server = app.listen(PORT, async() => {
        await connectClients();

        logger.info(`Server started on port ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
        logger.info("Shutting down...");
        await closeClients();  
        server.close(() => {
            logger.info("Server closed");
            process.exit(0);
        });
    });
}

startServer();