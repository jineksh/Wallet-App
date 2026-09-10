import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";
import { ApiError } from "../utils/appError.js";
import { getCorrelationId } from "../utils/requestHelper.js";

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

        if (err.details) body.details = err.details;
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