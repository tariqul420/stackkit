import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { mediaService } from "./media.service";
import {
  MediaSignInput,
  mediaSignSchema,
  mediaUploadDeleteSchema,
  mediaUploadPresignSchema,
} from "./media.type";

const signMedia = catchAsync(async (req: Request, res: Response) => {
  const publicId = req.params.publicId as string;
  const transformation = (req.query.transformation as string) || undefined;

  const payload = mediaSignSchema.parse({
    publicId,
    transformation,
  }) as MediaSignInput;
  const result = await mediaService.signMedia(payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Cloudinary URL generated",
    data: result,
  });
});

const createPresign = catchAsync(async (req: Request, res: Response) => {
  const payload = mediaUploadPresignSchema.parse(req.body);
  const result = await mediaService.createMediaPresign(payload);

  sendResponse(res, {
    status: status.OK,
    success: true,
    message: "Presigned upload created",
    data: result,
  });
});

const deleteUploads = catchAsync(async (req: Request, res: Response) => {
  const payload = mediaUploadDeleteSchema.parse(req.body);
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
