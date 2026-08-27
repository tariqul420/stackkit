import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { authService } from "./auth.service";
import { IUpdateProfilePayload } from "./auth.schema";

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await authService.getMe(user);
  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IUpdateProfilePayload;
  const user = req.user;

  const result = await authService.updateProfile(user, payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const authController = {
  getMe,
  updateProfile,
};
