import { Response } from "express";

interface SuccessPayload<T> {
    success: true;
    data: T;
    message?: string;
}

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

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string): void {
    const body: SuccessPayload<T> = {
        success: true,
        data: serializeForJson(data)
    };

    if (message) body.message = message;

    res.status(statusCode).json(body);
} 