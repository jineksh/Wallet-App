import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { getCorrelationId } from "../utils/requestHelper.js";

const serializeForJson = (value: unknown): unknown => {
    if (typeof value === 'bigint') {
        return value.toString();
    }

    if (Array.isArray(value)) {
        return value.map((item) => serializeForJson(item));
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nestedValue]) => [key, serializeForJson(nestedValue)])
        );
    }

    return value;
};

const logger = winston.createLogger({
    level: "info",
    defaultMeta: { service: "express-prisma" },
    format: winston.format.combine(
        winston.format.timestamp({ format: "MM-DD-YYYY HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
            const payload = serializeForJson({
                level,
                message,
                timestamp,
                correlationId: getCorrelationId(),
                ...(stack ? { stack } : {}),
                ...meta,
            });

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