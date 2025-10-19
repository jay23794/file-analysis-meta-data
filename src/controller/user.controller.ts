import { userModel } from "../models/user.model.js";
import type { Request, Response } from "express";

export class UserController {

  
  getAllUser = (req: Request, res: Response) => {
    const users = userModel.findAll();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: [],
    });
  };
  getAllUsers(req: Request, res: Response) {
  const users = userModel.findAll();
    res.status(200).json({
      success: true,
      count: users.length,
      data: [],
    });
  }
}
export const userController = new UserController();
