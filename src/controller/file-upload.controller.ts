import type { NextFunction, Request, Response } from "express";
import { fileQueue } from "../utils/file-queue.utils.js";
import { fileTypeFromFile } from "file-type";

export class FileUploadController {
  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

    
        console.log(file.originalname)
        console.log(file.path);
        
    if (await isPdf(file.path)) {
        await fileQueue.add("ocr", {
          filePath: file.path,
          extension:'pdf',
          originalName: file.originalname,
        });
      }
      if (await isImage(file.path)) {
        await fileQueue.add("exif", {
          filePath: file.path,
          originalName: file.originalname,
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

async function isPdf(filePath: string): Promise<boolean> {
     console.log("filePath")  
  const type = await fileTypeFromFile(filePath);
   console.log(type?.mime)  
  if (!type) return false;
 
  return type.mime.startsWith("application/pdf");
}
export const fileController = new FileUploadController();
