export type SocialProvider =
  | "google"
  | "github"
  | "facebook"
  | "twitter"
  | "discord";

export interface ILoginResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: {
    needPasswordChange: boolean;
    email: string;
    name: string;
    role: string;
    image: string;
    status: string;
    isDeleted: boolean;
    emailVerified: boolean;
  };
}

export interface IUserResponse {
  needPasswordChange: boolean;
  email: string;
  name: string;
  role: string;
  image: string;
  status: string;
  isDeleted: boolean;
  emailVerified: boolean;
}

export type OAuthLoginPayload = {
  provider: SocialProvider;
  callbackURL: string;
  signInEndpoint: string;
};

export type OAuthPayloadResponse = {
  success: boolean;
  message: string;
  data: OAuthLoginPayload;
};
