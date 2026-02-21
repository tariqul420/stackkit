import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { AppError } from "../errors/app-error";
import { cookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
{{#if database == "prisma"}}
import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../database/prisma";
{{/if}}
{{#if database == "mongoose"}}
import { Role, UserStatus } from "../../modules/auth/auth.constants";
import { getAuthCollections } from "../../modules/auth/auth.helper";
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
      //Session Token Verification
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new Error("Unauthorized access! No session token provided.");
      }

      if (sessionToken) {
        {{#if database == "prisma"}}
          const sessionExists = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });
        {{/if}}
        {{#if database == "mongoose"}}
        const { sessions, users } = await getAuthCollections();
        const sessionExists = await sessions.findOne({
          token: sessionToken,
          expiresAt: { $gt: new Date() },
        });

        if (sessionExists) {
          sessionExists.user = await users.findOne({
            id: sessionExists.userId,
          });
        }
        {{/if}}

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;

          const now = new Date();
          const expiresAt = new Date(sessionExists.expiresAt);
          const createdAt = new Date(sessionExists.createdAt);

          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());

            console.log("Session Expiring Soon!!");
          }

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

          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
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
        }

        const accessToken = cookieUtils.getCookie(req, "accessToken");

        if (!accessToken) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access! No access token provided.",
          );
        }
      }

      //Access Token Verification
      const accessToken = cookieUtils.getCookie(req, "accessToken");

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! No access token provided.",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access! Invalid access token.",
        );
      }

      if (
        authRoles.length > 0 &&
        !authRoles.includes(verifiedToken.data!.role)
      ) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource.",
        );
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
