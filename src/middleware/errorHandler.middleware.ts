import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.errors.js';
import { ZodError } from 'zod';
interface ErrorResponse {
  success: false;
  message: string;
  stack?: string;
  errors?: any;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  
  if (err instanceof ZodError){
     statusCode = 400;
     message = JSON.parse(err.message)
     isOperational = false
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Handle Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // Handle Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
  };

//   // Include stack trace in development
//   if (process.env.NODE_ENV === 'development') {
//     errorResponse.stack = err.stack;
//     errorResponse.errors = err;
//   }

  // Log error (in production, use proper logging service)
  console.error('ERROR 💥:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    isOperational,
  });

  res.status(statusCode).json(errorResponse);
};