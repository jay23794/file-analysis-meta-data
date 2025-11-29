import type { NextFunction, Request, Response } from "express";
import { SaveUser } from "../models/user.model.js";
import type { ISaveUser } from "../types/user.type.js";
import { UserSchema } from "../schema/user.schema.js";
import jwt from "jsonwebtoken";
import { ConflictError, UnauthorizedError } from "../errors/custom.errors.js";
import nodemailer from 'nodemailer';
import * as dotenv from "dotenv";
import type { IJWTpayload } from "../global/global.type.js";
dotenv.config();

export class UserController {
  cehk = async (req: Request, res: Response, next: NextFunction) => {
    try {
       return res.status(200).json({
        success: true,
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
  signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users: ISaveUser = req.body;
      UserSchema.parse(users);
      const expiresIn = "1h";
      const isUser = await SaveUser.findOne({ email: users.email });
      if (isUser) {
        throw new ConflictError("User already exists");
      }
      const secret = process.env.JWT_EMAIL_VERIFICATION ?? "";

      const emailToken = jwt.sign({ userId: users.email }, secret, {
        expiresIn,
      });

      users.emailVerificationToken=emailToken
      await this.sendEmail(users.email, emailToken)
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
      await SaveUser.updateOne({ email }, { $set: { refreshToken } });
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

  verificationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.params?.token ?? ""
      const decode = jwt.verify(token, process.env.JWT_EMAIL_VERIFICATION ?? "") as IJWTpayload

      const user = await SaveUser.findOne({ email: decode.userId,emailVerificationToken:token });
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

     // Update verification status
      await SaveUser.updateOne(
        { email: decode.userId},
        {
          $set:{
            emailVerified:true,
            emailVerificationToken:""
          }
        }
      )

      
      return res.status(200).json({
        success: true,
        message:"Verification successfull"
      });
      //const user = await SaveUser.findOne({ email:decode?.userId });
    } catch (error) {
      next(error);
    }
  };

  sendEmail(reciever: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      secure: true,
      port: 465,
    });

    (async () => {
      const info = await transporter.sendMail({
        from: '"jay parmar" <techijp07@gmail.com>',
        to: reciever,
        subject: "Account verification",
        text: "Click on the below link to complete your sign in process",
        html: `<a href='${process.env.LOCALHOST}api/users/email-verification/${token}' >Click Here to Verify</a>`,
      });

      console.log("Message sent:", info);
    })();

  }
}
export const userController = new UserController();
