import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/ catch-async";
import { sendResponse } from "../../shared/utils/send-response";

const health = catchAsync(async (_req: Request, res: Response) => {

  sendResponse(res, {
    status: 200,
    success: true,
    message: "Health test route is working!",
    data: {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
});

export const healthController = {
  health,
};
