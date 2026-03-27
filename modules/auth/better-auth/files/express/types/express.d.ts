{{#if database == "prisma"}}
import { Role } from "@prisma/client";
{{/if}}
{{#if database == "mongoose"}}
import { Role } from "../modules/auth/auth.constants";
type AuthRole = (typeof Role)[keyof typeof Role];
{{/if}}

declare global {
    namespace Express {
        interface Request {
          user: {
            id: string;
            name: string;
            email: string;
            {{#if database == "prisma"}}
            role: Role;
            {{/if}}
            {{#if database == "mongoose"}}
            role: AuthRole | string;
            {{/if}}
          };
        }
    }
}

export { };
