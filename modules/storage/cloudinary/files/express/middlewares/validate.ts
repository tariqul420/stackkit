import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../errors/app-error";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodType, part: RequestPart = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(", ");
      next(new AppError(400, message || "Validation failed"));
      return;
    }

    req[part] = result.data;
    next();
  };
