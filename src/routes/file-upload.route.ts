import { Router } from "express";
import { fileController } from "../controller/file-upload.controller.js";
import {fileUploadConfig} from "../utils/utils.global.js";


const router = Router();

router.post('/upload',fileUploadConfig().single('file'), fileController.upload);
router.get('/analysis/:id', fileController.report);
router.get('/', fileController.files);
export default router;