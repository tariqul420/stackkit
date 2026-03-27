{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "./auth.constants";
{{/if}}

export interface IRequestUser {
  id: string;
  role: Role | string;
  email: string;
}

export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export type NeedsVerification = {
  needsVerification: true;
  email: string;
};

export type SocialProvider =
  | "google"
  | "github"
  | "facebook"
  | "twitter"
  | "discord"
  | "linkedin"
  | "apple";
