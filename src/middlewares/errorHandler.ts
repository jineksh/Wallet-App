import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";
import { ApiError } from "../utils/appError.js";
import { getCorrelationId } from "../utils/requestHelper.js";

function serializeForJson<T>(value: T): T {
    if (typeof value === 'bigint') {
        return value.toString() as unknown as T;
    }

    if (Array.isArray(value)) {
        return value.map((item) => serializeForJson(item)) as unknown as T;
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
                key,
                serializeForJson(nestedValue)
            ])
        ) as T;
    }

    return value;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    if (err instanceof ApiError) {
        logger.warn('API error handled', {
            statusCode: err.statusCode,
            message: err.message,
            details: err.details,
            correlationId: getCorrelationId(),
        });

        const body: Record<string, unknown> = {
            success: false,
            message: err.message,
        };

        if (err.details) body.details = serializeForJson(err.details);
        res.status(err.statusCode).json(body);
        return;
    }

    logger.error('Unhandled application error', {
        message: err.message,
        stack: err.stack,
        correlationId: getCorrelationId(),
    });

    const body: Record<string, unknown> = {
        success: false,
        message: "Something went wrong",
    };

    res.status(500).json(body);
}