import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { MediaUploadDeleteInput, MediaUploadPresignInput } from "./media.schema";
import { mediaService } from "./media.service";

const signMedia = catchAsync(async (req: Request, res: Response) => {
  const publicId = req.params.publicId as string;
  const transformation = req.query.transformation as string | undefined;

  const result = await mediaService.signMedia({ publicId, transformation });

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Cloudinary URL generated",
    data: result,
  });
});

const createPresign = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as MediaUploadPresignInput;
  const result = await mediaService.createMediaPresign(payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Presigned upload created",
    data: result,
  });
});

const deleteUploads = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as MediaUploadDeleteInput;
  const result = await mediaService.deleteMediaUploads(payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Uploads deleted",
    data: result,
  });
});

export const mediaController = {
  signMedia,
  createPresign,
  deleteUploads,
};
