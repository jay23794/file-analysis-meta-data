import { Router } from "express";
import { userController } from "../controller/user.controller.js";

const router = Router();

 router.get('/', userController.getAllUsers.bind(userController));



export default router;