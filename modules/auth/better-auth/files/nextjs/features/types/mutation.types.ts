// Convenience re-exports for auth mutation payloads and responses
export { type IForgotPayload } from "../validators/forgot.validator";
export { type IRegisterPayload } from "../validators/register.validator";
export { type IResetPayload } from "../validators/reset.validator";
export { type IVerifyPayload } from "../validators/verify.validator";
export { type ILoginPayload };
import type { ILoginPayload } from "../validators/login.validator";

export {
  type ILoginResponse,
  type OAuthLoginPayload,
  type OAuthPayloadResponse,
  type SocialProvider,
} from "./auth.type";

export type LoginVariables = ILoginPayload & { redirectPath?: string };
