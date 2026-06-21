import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
}

const verifyToken = (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return {
            success: true,
            data: decoded
        }
    } catch (error: unknown) {
        const isExpired = error instanceof jwt.TokenExpiredError;
        return {
            success: false,
            message: isExpired ? "Token has expired" : (error instanceof Error ? error.message : "Unknown error"),
            error,
            code: isExpired ? "TOKEN_EXPIRED" : "TOKEN_INVALID"
        }
    }
}

export const jwtUtils = {
    createToken,
    verifyToken,
}