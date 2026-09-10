import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { getCorrelationId } from "../utils/requestHelper.js";

const logger = winston.createLogger({
    level: "info",
    defaultMeta: { service: "express-prisma" },
    format: winston.format.combine(
        winston.format.timestamp({ format: "MM-DD-YYYY HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
            const payload = {
                level,
                message,
                timestamp,
                correlationId: getCorrelationId(),
                ...(stack ? { stack } : {}),
                ...meta,
            };

            return JSON.stringify(payload);
        }),
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: "logs/%DATE%-app.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
});

export default logger;