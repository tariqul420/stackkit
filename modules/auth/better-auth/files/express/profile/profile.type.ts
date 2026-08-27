{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "../../lib/auth/auth.constants";
type MongooseRole = (typeof Role)[keyof typeof Role];
{{/if}}

export interface IRequestUser {
  id: string;
  {{#if database == "prisma"}}
  role: Role | string;
  {{/if}}
  {{#if database == "mongoose"}}
  role: MongooseRole | string;
  {{/if}}
  email: string;
}
