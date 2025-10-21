import { Router } from "express";
import { userController } from "../controller/user.controller.js";

const router = Router();
router.post('/sign-up', userController.signUp);
router.post('/sign-in', userController.signIn);
router.get('/', userController.getAllUsers.bind(userController));



export default router;