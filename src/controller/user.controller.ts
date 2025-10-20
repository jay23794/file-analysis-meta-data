import type { Request, Response } from "express";
import { SaveUser } from "../models/user.model.js";
import type { ISaveUser } from "../types/user.type.js";
import  { UserSchema } from "../schema/user.schema.js";
export class UserController {
  signUp = async (req: Request, res: Response) => {
    try {
     
      const users: ISaveUser = req.body;
      UserSchema.parse(users)
      const user = await SaveUser.insertOne(users);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
       return res.status(200).json({
        success: true,
        data: [],
        error
      });
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
