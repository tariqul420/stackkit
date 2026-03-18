import { envVars } from "../../config/env";
import { cloudinaryUpload, deleteFileFromCloudinary } from "../../config/media";
import {
  MediaSignInput,
  MediaUploadDeleteInput,
  MediaUploadPresignInput,
} from "./media.type";

const signMedia = async (payload: MediaSignInput) => {
  const { publicId, transformation } = payload;

  const options = transformation ? { transformation } : undefined;

  const url = cloudinaryUpload.url(publicId, options);

  return { url };
};

const createMediaPresign = async (payload: MediaUploadPresignInput) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = { timestamp };

  if (payload.folder) paramsToSign.folder = payload.folder;
  if (payload.publicId) paramsToSign.public_id = payload.publicId;
  if (payload.resourceType && payload.resourceType !== "auto")
    paramsToSign.resource_type = payload.resourceType;

  const resourceType = payload.resourceType || "auto";

  // Unsigned flow: return upload_preset if configured
  if (payload.unsigned) {
    const upload_preset =
      envVars.CLOUDINARY.CLOUDINARY_UPLOAD_PRESET ?? undefined;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

    return {
      uploadUrl,
      upload_preset,
      unsigned: true,
      folder: payload.folder,
      publicId: payload.publicId,
      resourceType: payload.resourceType,
    };
  }

  const signature = cloudinaryUpload.utils.api_sign_request(
    paramsToSign,
    envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  return {
    uploadUrl,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    timestamp,
    signature,
    folder: payload.folder,
    publicId: payload.publicId,
    resourceType: payload.resourceType,
    unsigned: false,
  };
};

const deleteMediaUploads = async (payload: MediaUploadDeleteInput) => {
  const keys = payload.keys ?? [];
  const urls = payload.urls ?? [];

  const deleted: string[] = [];
  const failed: string[] = [];

  for (const key of keys) {
    try {
      // try destroy across possible types
      const tryTypes: Array<"image" | "video" | "raw"> = [
        "image",
        "video",
        "raw",
      ];
      let ok = false;
      for (const t of tryTypes) {
        try {
          await cloudinaryUpload.uploader.destroy(key, { resource_type: t });
          ok = true;
          break;
        } catch {
          // try next
        }
      }
      if (ok) deleted.push(key);
      else failed.push(key);
    } catch {
      failed.push(key);
    }
  }

  for (const url of urls) {
    try {
      await deleteFileFromCloudinary(url);
      deleted.push(url);
    } catch {
      failed.push(url);
    }
  }

  return { deleted, failed };
};

export const mediaService = {
  signMedia,
  createMediaPresign,
  deleteMediaUploads,
};
