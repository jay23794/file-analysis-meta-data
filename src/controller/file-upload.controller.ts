import type { NextFunction, Request, Response } from "express";
import { fileQueue } from "../utils/file-queue.utils.js";
import { fileTypeFromFile } from "file-type";
import { Analysis } from "../models/exif.model.js";
export class FileUploadController {
    upload = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({ error: "No file uploaded" });

            // Save file details
            const extension = await fileExention(file.path)
            const result = await Analysis.insertOne({ extension, fileName: file.originalname, status: "UPLOADED" })

            if (await isPdf(file.path)) {
                await fileQueue.add("ocr", {
                    filePath: file.path,
                    extension: 'pdf',
                    originalName: file.originalname,
                    jobId:result.id
                });
            }
            if (await isImage(file.path)) {
                await fileQueue.add("exif", {
                    filePath: file.path,
                    originalName: file.originalname,
                      jobId:result.id
                });
            }

            return res.status(200).json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    };
}
async function isImage(filePath: string): Promise<boolean> {
    const type = await fileTypeFromFile(filePath);

    if (!type) return false;

    return type.mime.startsWith("image/");
}

async function fileExention(filePath: string): Promise<string> {
    const type = await fileTypeFromFile(filePath);
    if (!type) return "unknown";
    return type.ext
}

async function isPdf(filePath: string): Promise<boolean> {
    console.log("filePath")
    const type = await fileTypeFromFile(filePath);

    if (!type) return false;

    return type.mime.startsWith("application/pdf");
}
export const fileController = new FileUploadController();
