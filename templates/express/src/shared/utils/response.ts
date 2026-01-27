import { Response } from "express";

export function success(
  res: Response,
  data: any,
  message = "Success",
  meta?: any,
) {
  return res.json({ success: true, message, data, meta });
}

export function fail(
  res: Response,
  status = 500,
  message = "Error",
  details?: any,
) {
  return res.status(status).json({ success: false, message, details });
}
