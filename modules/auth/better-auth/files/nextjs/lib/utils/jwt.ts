import jwt, { JwtPayload } from "jsonwebtoken";

const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return {
      success: true,
      data: decoded,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Token verification failed",
      error,
    };
  }
};

export const jwtUtils = {
  verifyToken,
};
