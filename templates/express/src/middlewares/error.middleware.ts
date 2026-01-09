import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const errorMessage = err?.message || 'Internal server error!';

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    errors: errorMessage,
  });
};
