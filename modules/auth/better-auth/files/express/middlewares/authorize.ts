import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { AppError } from "../errors/app-error";
{{#if database == "prisma"}}
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../database/prisma";
{{/if}}
{{#if database == "mongoose"}}
import { Types } from "mongoose";
import { Role, UserStatus } from "../../lib/auth/auth.constants";
import { getAuthCollections } from "../../lib/auth/auth.helper";
{{/if}}

{{#if database == "prisma"}}
export const authorize = (...authRoles: Role[]) =>
{{/if}}
{{#if database == "mongoose"}}
type AuthRole = (typeof Role)[keyof typeof Role];

export const authorize = (...authRoles: AuthRole[]) =>
{{/if}}
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = req.cookies["better-auth.session_token"];

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No session token provided.",
        );
      }

      {{#if database == "prisma"}}
      const session = await prisma.session.findFirst({
        where: {
          token: sessionToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session || !session.user) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid or expired session.",
        );
      }

      const user = session.user;

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const createdAt = new Date(session.createdAt);

      const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
      const timeRemaining = expiresAt.getTime() - now.getTime();
      const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

      if (percentRemaining < 20) {
        res.setHeader("X-Session-Refresh", "true");
        res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
        res.setHeader("X-Time-Remaining", timeRemaining.toString());
      }
      {{/if}}
      {{#if database == "mongoose"}}
      const { sessions, users } = await getAuthCollections();
      const session = await sessions.findOne({
        token: sessionToken,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid or expired session.",
        );
      }

      const user = await users.findOne({
        _id: new Types.ObjectId(session.userId),
      });

      if (!user) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! User not found.",
        );
      }

      if (session.expiresAt && session.createdAt) {
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        const createdAt = new Date(session.createdAt);

        const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
        const timeRemaining = expiresAt.getTime() - now.getTime();
        const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

        if (percentRemaining < 20) {
          res.setHeader("X-Session-Refresh", "true");
          res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
          res.setHeader("X-Time-Remaining", timeRemaining.toString());
        }
      }
      {{/if}}

      if (
        user.status === UserStatus.BLOCKED ||
        user.status === UserStatus.DELETED
      ) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! User is not active.",
        );
      }

      if (user.isDeleted) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! User is deleted.",
        );
      }

      {{#if database == "prisma"}}
      if (authRoles.length > 0 && !authRoles.includes(user.role)) {
      {{/if}}
      {{#if database == "mongoose"}}
      if (
        authRoles.length > 0 &&
        !authRoles.includes(user.role as AuthRole)
      ) {
      {{/if}}
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
