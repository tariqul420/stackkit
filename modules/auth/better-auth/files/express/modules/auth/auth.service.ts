import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
{{#if database == "prisma"}}
import { prisma } from "../../database/prisma";
{{/if}}
{{#if database == "mongoose"}}
import {
  deleteAuthUserById,
  getAuthCollections,
} from "../mongoose/auth.helper";
{{/if}}
import { auth } from "../../lib/auth";
import { AppError } from "../../shared/errors/app-error";
import { jwtUtils } from "../../shared/utils/jwt";
import { tokenUtils } from "../../shared/utils/token";
import {
    IChangePasswordPayload,
    ILoginUserPayload,
    IRegisterUserPayload,
    IRequestUser,
} from "./auth.type";

const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!data.user) {
      throw new AppError(status.BAD_REQUEST, "Failed to register user");
    }

    try {
      const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
      });

      const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
      });

      return {
        ...data,
        accessToken,
        refreshToken,
        user: data.user,
      };
    } catch (error) {
      {{#if database == "prisma"}}
      await prisma.user.delete({
        where: {
          id: data.user.id,
        },
      });
      {{/if}}
      {{#if database == "mongoose"}}
      await deleteAuthUserById(data.user.id);
      {{/if}}
      throw error;
    }

}

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    if (data.user.status === "BLOCKED") {
      throw new AppError(status.FORBIDDEN, "User is blocked");
    }

    if (data.user.isDeleted || data.user.status === "DELETED") {
      throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified,
    });

    return {
      ...data,
      accessToken,
      refreshToken,
    };
}

const getMe = async (user : IRequestUser) => {
    {{#if database == "prisma"}}
        const isUserExists = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      // Include other related models if needed
    });
    {{/if}}
    {{#if database == "mongoose"}}
    const { users } = await getAuthCollections();
    const isUserExists = await users.findOne({ id: user.id });
    {{/if}}

    if (!isUserExists) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    return isUserExists;
}

const getNewToken = async (refreshToken : string, sessionToken : string) => {
    {{#if database == "prisma"}}
        const isSessionTokenExists = await prisma.session.findUnique({
        where : {
            token : sessionToken,
        },
        include : {
            user : true,
        }
    })
    {{/if}}
    {{#if database == "mongoose"}}
    const { sessions } = await getAuthCollections();
    
    const isSessionTokenExists = await sessions.findOne({
      token: sessionToken,
    });
    {{/if}}

    if(!isSessionTokenExists){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)

    if(!verifiedRefreshToken.success && verifiedRefreshToken.error){
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    {{#if database == "prisma"}}
        const { token } = await prisma.session.update({
        where : {
            token : sessionToken
        },
        data : {
            token : sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    })
    {{/if}}
    {{#if database == "mongoose"}}
      await sessions.updateOne(
      { token: sessionToken },
      {
        $set: {
          token: sessionToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
          updatedAt: new Date(),
        },
      },
    );
    {{/if}}

    return {
        accessToken : newAccessToken,
        refreshToken : newRefreshToken,
        sessionToken : token,
    }

}

const changePassword = async (payload : IChangePasswordPayload, sessionToken : string) =>{
    const session = await auth.api.getSession({
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    if(!session){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const {currentPassword, newPassword} = payload;

    const result = await auth.api.changePassword({
        body :{
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    if(session.user.needPasswordChange){
        {{#if database == "prisma"}}
        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                needPasswordChange: false,
            }
        })
        {{/if}}
        {{#if database == "mongoose"}}
        const { users } = await getAuthCollections();
          await users.updateOne(
            {
              id: session.user.id,
            },
            {
              $set: {
                needPasswordChange: false,
              },
            },
          );
        {{/if}}
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });
    

    return {
        ...result,
        accessToken,
        refreshToken,
    }
}

const logoutUser = async (sessionToken : string) => {
    const result = await auth.api.signOut({
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    return result;
}

const verifyEmail = async (email : string, otp : string) => {

    const result = await auth.api.verifyEmailOTP({
        body:{
            email,
            otp,
        }
    })

    if(result.status && !result.user.emailVerified){
        {{#if database == "prisma"}}
        await prisma.user.update({
            where : {
                email,
            },
            data : {
                emailVerified: true,
            }
        })
        {{/if}}
        {{#if database == "mongoose"}}
        const { users } = await getAuthCollections();
          await users.updateOne(
            {
              email,
            },
            {
              $set: {
                emailVerified: true,
              },
            },
          );
        {{/if}}
    }
}

const forgetPassword = async (email : string) => {
    {{#if database == "prisma"}}
    const isUserExist = await prisma.user.findUnique({
        where : {
            email,
        }
    })
    {{/if}}
    {{#if database == "mongoose"}}
    const { users } = await getAuthCollections();
    const isUserExist = await users.findOne({
      email,
    });
    {{/if}}

    if(!isUserExist){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if(!isUserExist.emailVerified){
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
      throw new AppError(status.NOT_FOUND, "User not found");
    }

    await auth.api.requestPasswordResetEmailOTP({
        body:{
            email,
        }
    })
}

const resetPassword = async (email : string, otp : string, newPassword : string) => {
    {{#if database == "prisma"}}
    const isUserExist = await prisma.user.findUnique({
        where : {
            email,
        }
    })
    {{/if}}
    {{#if database == "mongoose"}}
    const { users } = await getAuthCollections();
    const isUserExist = await users.findOne({
      email,
    });
    {{/if}}

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (!isUserExist.emailVerified) {
        throw new AppError(status.BAD_REQUEST, "Email not verified");
    }

    if (isUserExist.isDeleted || isUserExist.status === "DELETED") {
      throw new AppError(status.NOT_FOUND, "User not found");
    }

    await auth.api.resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password : newPassword,
        }
    })

    {{#if database == "prisma"}}
    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                needPasswordChange: false,
            }
        })
    }

    await prisma.session.deleteMany({
        where:{
            userId : isUserExist.id,
        }
    })
    {{/if}}
    {{#if database == "mongoose"}}
    if (isUserExist.needPasswordChange) {
        await users.updateOne(
            {
              email,
            },
            {
              $set: {
                needPasswordChange: false,
              },
            },
          );
    }
    const { sessions } = await getAuthCollections();
    await sessions.deleteMany({
      userId: isUserExist.id,
    });
    {{/if}}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session : Record<string, any>) =>{
    {{#if database == "prisma"}}
        const isUserExists = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!isUserExists) {
      await prisma.user.create({
        data: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
      });
    }
    {{/if}}
    {{#if database == "mongoose"}}
    const { users } = await getAuthCollections();
    const isUserExists = await users.findOne({ id: session.user.id });

    if (!isUserExists) {
      await users.insertOne({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: "USER",
        status: "ACTIVE",
        needPasswordChange: false,
        emailVerified: true,
        isDeleted: false,
        deletedAt: null,
      });
    }
    {{/if}}

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
    });

    return {
        accessToken,
        refreshToken,
    }
}

export const authService = {
    registerUser: registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSuccess,
};