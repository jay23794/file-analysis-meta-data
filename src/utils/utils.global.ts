import { fileTypeFromFile } from 'file-type';
import multer, { type FileFilterCallback } from 'multer';
import path from "path";

export function fileUploadConfig(): multer.Multer {
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); 
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});
return multer({ storage,fileFilter,limits: { fileSize: 50 * 1024 * 1024 },  });
}

export async function isImage(filePath: string): Promise<boolean> {
    const type = await fileTypeFromFile(filePath);

    if (!type) return false;

    return type.mime.startsWith("image/");
}

export async function fileExention(filePath: string): Promise<string> {
    const type = await fileTypeFromFile(filePath);
    if (!type) return "unknown";
    return type.ext
}

export async  function isPdf(filePath: string): Promise<boolean> {
  
    const type = await fileTypeFromFile(filePath);

    if (!type) return false;

    return type.mime.startsWith("application/pdf");
}

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error("Only PNG, JPG, JPEG, and PDF files are allowed!"));
  }

  cb(null, true);
};