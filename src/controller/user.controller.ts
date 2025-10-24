import type { NextFunction, Request, Response } from "express";
import { SaveUser } from "../models/user.model.js";
import type { ISaveUser } from "../types/user.type.js";
import { UserSchema } from "../schema/user.schema.js";
import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../errors/custom.errors.js";
export class UserController {
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users: ISaveUser = req.body;
      UserSchema.parse(users);

      const isUser = await SaveUser.findOne({ email: users.email })
      if (isUser) {
        throw new ConflictError('User already exists');
      }
      const user = await SaveUser.insertOne(users);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
     next(error);
    }
  };

  signIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const secret = process.env.JWT_SECRET ?? "";
      const refresh = process.env.REFRESH_JWT_SECRET ?? "";
      const expiresIn = "1h";
      const refreshTokenExpiresIn = "12h";

      const user = await SaveUser.findOne({ email });
      if (!user) {
         throw new UnauthorizedError("Invalid credentials");
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new UnauthorizedError("Invalid credentials");
      }

      // access token
      const accessToken = jwt.sign({ userId: user.id }, secret, {
        expiresIn,
      });

      // refresh token
      const refreshToken = jwt.sign({ userId: user.id }, refresh, {
        expiresIn: refreshTokenExpiresIn,
      });
      await SaveUser.updateOne(
        { email },
        { $set: { refreshToken } }
      );
      return res.status(200).json({
        success: true,
        data: user,
        refreshToken,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
  getAllUsers(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }
}
export const userController = new UserController();


