import { NextFunction, Request, Response } from "express";

const health = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      message: "API is healthy!",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch (error) {
    next(error);
  }
};

export const healthController = {
  health,
};
