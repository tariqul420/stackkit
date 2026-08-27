{{#if database == "prisma"}}
import { prisma } from "../../database/prisma";
{{/if}}
{{#if database == "mongoose"}}
import { Types } from "mongoose";
import { getAuthCollections } from "../../lib/auth/auth.helper";
{{/if}}
import status from "http-status";
import { AppError } from "../../shared/errors/app-error";
import type { IRequestUser } from "./profile.type";

const getMe = async (user: IRequestUser) => {
  {{#if database == "prisma"}}
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.id },
  });
  {{/if}}
  {{#if database == "mongoose"}}
  const { users } = await getAuthCollections();
  const isUserExists = await users.findOne({ _id: new Types.ObjectId(user.id) });
  {{/if}}

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return isUserExists;
};

const updateProfile = async (
  user: IRequestUser,
  payload: { name?: string; image?: string },
) => {
  {{#if database == "prisma"}}
  const isUserExists = await prisma.user.findUnique({
    where: { id: user.id },
  });
  {{/if}}
  {{#if database == "mongoose"}}
  const { users } = await getAuthCollections();
  const isUserExists = await users.findOne({ _id: new Types.ObjectId(user.id) });
  {{/if}}

  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (isUserExists.isDeleted || isUserExists.status === "DELETED") {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  {{#if database == "prisma"}}
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: payload.name || isUserExists.name,
      image: payload.image || isUserExists.image,
      updatedAt: new Date(),
    },
  });
  {{/if}}
  {{#if database == "mongoose"}}
  await users.updateOne(
    { _id: new Types.ObjectId(user.id) },
    {
      $set: {
        name: payload.name || isUserExists.name,
        image: payload.image || isUserExists.image,
        updatedAt: new Date(),
      },
    },
  );
  const updated = await users.findOne({ _id: new Types.ObjectId(user.id) });
  {{/if}}

  return updated;
};

export const profileService = {
  getMe,
  updateProfile,
};
