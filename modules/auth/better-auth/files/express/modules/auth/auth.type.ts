{{#if database == "prisma"}}
import { Role } from "@prisma/client";

export interface IRequestUser {
  id: string;
  role: Role | string;
  email: string;
}
{{/if}}
{{#if database == "mongoose"}}
import { Role } from './auth.constants';
export interface IRequestUser {
  id: string;
  role: typeof Role | string;
  email: string;
}
{{/if}}

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
