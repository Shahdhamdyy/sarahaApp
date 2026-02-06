import { env } from "../../../../config/env.service.js"


export const ErrorResponse = ({ status = 400, message = "Something went wrong", extra = undefined } = {}) => {
    throw new Error(message, { cause: { status, extra } });
};

export const BadRequestException = ({ message = "BadRequestException", extra = undefined } = {}) => {
    return ErrorResponse({
        status: 400,
        message,
        extra
    });
};

export const NotFoundException = ({ message = "NotFoundException", extra = undefined } = {}) => {
    return ErrorResponse({
        status: 404,
        message,
        extra
    });
};

export const ConflictException = ({ message = "ConflictException", extra = undefined } = {}) => {
    return ErrorResponse({
        status: 409,
        message,
        extra
    });
};

export const UnauthorizedException = ({ message = "UnauthorizedException", extra = undefined } = {}) => {
    return ErrorResponse({
        status: 401,
        message,
        extra
    });
};

export const ForbiddenException = ({ message = "ForbiddenException", extra = undefined } = {}) => {
    return ErrorResponse({
        status: 403,
        message,
        extra
    });
};
export const globalErrorHandler = (error, req, res, next) => {
    const status = error.status
        ? error.status
        : error.cause
            ? error.cause.status
            : 500;

    const mood = env.mood == 'dev';
    const defaultMessage = 'Something went wrong';
    const displayErrorMessage = error.message || defaultMessage;
    const extra = error.extra || {};

    res.status(status).json({
        status,
        stack: mood ? error.stack : null,
        errorMessage: mood ? displayErrorMessage : defaultMessage,

    });
};



// NotFoundException()
// ↓
// ErrorResponse()
// ↓
// throw Error
// ↓
// Express catches it
// ↓
// globalErrorHandler
// ↓
// error.cause.status
// ↓
// res.status(404)