import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { cookieUtils } from "./cookie";
import { jwtUtils } from "./jwt";

const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload,
        envVars.ACCESS_TOKEN_SECRET,
        { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload,
        envVars.REFRESH_TOKEN_SECRET,
        { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );
    return refreshToken;
}

const setAccessTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: 60 * 60 * 24 * 1000,
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: 60 * 60 * 24 * 1000 * 7,
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    cookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: '/',
        maxAge: 60 * 60 * 24 * 1000,
    });
}

const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string; sessionToken: string }) => {
    setAccessTokenCookie(res, tokens.accessToken);
    setRefreshTokenCookie(res, tokens.refreshToken);
    setBetterAuthSessionCookie(res, tokens.sessionToken);
}

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie,
    setAuthCookies,
}