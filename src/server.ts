import express, { Express } from 'express';
import { PORT } from './config/env.js';
import  router  from './routes/index.js';
import connectDB from './config/db.js';

const app: Express = express();

app.use('/api', router);

export  function startServer() {
    app.listen(PORT, async () => {
        await connectDB();
        console.log(`[server]: Running on port ${PORT}`)
    });
}


startServer();
