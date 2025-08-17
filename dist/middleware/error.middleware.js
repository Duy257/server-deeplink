import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
export const errorHandler = async (c, next) => {
    try {
        await next();
    }
    catch (error) {
        console.error('Error:', error);
        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return c.json({
                success: false,
                message: 'Validation error',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            }, 400);
        }
        // Handle HTTP exceptions
        if (error instanceof HTTPException) {
            return c.json({
                success: false,
                message: error.message,
            }, error.status);
        }
        // Handle MongoDB duplicate key error
        if (error instanceof Error) {
            if (error.message.includes('Email already exists')) {
                return c.json({
                    success: false,
                    message: 'Email already exists',
                }, 409);
            }
        }
        // Default error response
        return c.json({
            success: false,
            message: error instanceof Error ? error.message : 'Internal server error',
        }, 500);
    }
};
// Logger middleware
export const logger = async (c, next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;
    await next();
    const ms = Date.now() - start;
    const status = c.res.status;
    console.log(`${method} ${path} - ${status} - ${ms}ms`);
};
