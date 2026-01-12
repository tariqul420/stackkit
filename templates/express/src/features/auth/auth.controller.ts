import { NextFunction, Request, Response } from "express";
import { authServices } from "./auth.service";

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authServices.signup(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await authServices.signin(email, password);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const authController = {
  signup,
  signin,
};
