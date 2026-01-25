import { Request, Response } from "express";

export function notFound(req: Request, res: Response) {
  res.status(404).json({
    message: `Can't find ${req.originalUrl} on this server!`,
    path: req.originalUrl,
    date: Date(),
  });
}
